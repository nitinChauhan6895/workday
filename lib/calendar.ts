// ICS (Outlook/Teams published feed) parsing + sync into the meetings table.
// Server-only. Expands recurring events within a window so each occurrence
// becomes its own meeting row, deduped by (event UID + occurrence time).
import ical from "node-ical";

// How far around "now" to import meetings.
const WINDOW_PAST_DAYS = 7;
const WINDOW_FUTURE_DAYS = 90;
const MAX_OCCURRENCES_PER_SERIES = 200;

export interface ParsedMeeting {
  ics_uid: string;
  title: string;
  datetime: string; // ISO
  attendees: string | null;
  join_url: string | null;
}

// Outlook puts the Teams join link in the event description (and sometimes
// location), not a dedicated property. Pull the first online-meeting URL.
function joinUrlOf(ev: any): string | null {
  const haystack = `${ev.description ?? ""}\n${ev.location ?? ""}`;
  const m = haystack.match(
    /https:\/\/(?:teams\.microsoft\.com\/l\/meetup-join|teams\.live\.com\/meet)\/\S+/i,
  );
  if (!m) return null;
  // Trim trailing wrappers/punctuation that can ride along after folding.
  return m[0].replace(/[>"',.\]]+$/, "");
}

function attendeesOf(ev: any): string | null {
  const raw = ev.attendee ?? [];
  const list = Array.isArray(raw) ? raw : [raw];
  const names = list
    .map((a: any) => {
      if (!a) return null;
      if (typeof a === "string") return a.replace(/^mailto:/i, "");
      return a.params?.CN ?? (a.val ? String(a.val).replace(/^mailto:/i, "") : null);
    })
    .filter(Boolean);
  return names.length ? names.join(", ") : null;
}

function isCancelled(ev: any): boolean {
  if ((ev.status ?? "").toString().toUpperCase() === "CANCELLED") return true;
  // Outlook often prepends "Canceled:" to the title instead of setting STATUS.
  return /^cancell?ed:/i.test((ev.summary ?? "").toString().trim());
}

export function parseIcsToMeetings(icsText: string): ParsedMeeting[] {
  const data = ical.sync.parseICS(icsText);
  const now = Date.now();
  const winStart = new Date(now - WINDOW_PAST_DAYS * 864e5);
  const winEnd = new Date(now + WINDOW_FUTURE_DAYS * 864e5);

  const out: ParsedMeeting[] = [];

  for (const key of Object.keys(data)) {
    const ev: any = data[key];
    if (!ev || ev.type !== "VEVENT" || isCancelled(ev)) continue;

    const uid = ev.uid ?? key;
    const title = (ev.summary ?? "Untitled meeting").toString();
    const attendees = attendeesOf(ev);
    const join_url = joinUrlOf(ev);

    if (ev.rrule) {
      // Recurring series — expand occurrences within the window.
      let dates: Date[] = [];
      try {
        dates = ev.rrule.between(winStart, winEnd, true).slice(0, MAX_OCCURRENCES_PER_SERIES);
      } catch {
        dates = [];
      }
      const exdates: Record<string, true> = {};
      if (ev.exdate) {
        for (const k of Object.keys(ev.exdate)) {
          const d = ev.exdate[k];
          exdates[new Date(d).toISOString().slice(0, 10)] = true;
        }
      }
      for (const d of dates) {
        const iso = d.toISOString();
        if (exdates[iso.slice(0, 10)]) continue;
        out.push({ ics_uid: `${uid}|${iso}`, title, datetime: iso, attendees, join_url });
      }
    } else if (ev.start) {
      const start = new Date(ev.start);
      if (start >= winStart && start <= winEnd) {
        out.push({
          ics_uid: String(uid),
          title,
          datetime: start.toISOString(),
          attendees,
          join_url,
        });
      }
    }
  }

  return out;
}

export async function fetchIcs(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { Accept: "text/calendar" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Calendar feed returned ${res.status}. Check the published URL.`);
  }
  const text = await res.text();
  if (!text.includes("BEGIN:VCALENDAR")) {
    throw new Error("That URL didn't return a calendar feed (no VCALENDAR found).");
  }
  return text;
}
