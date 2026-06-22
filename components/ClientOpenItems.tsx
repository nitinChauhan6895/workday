"use client";

import { useState } from "react";
import type { Item, Client } from "@/lib/types";
import ItemRow from "./ItemRow";

// Client-detail open items with a language filter (we track work language-wise).
export default function ClientOpenItems({
  items,
  client,
}: {
  items: Item[];
  client: Client;
}) {
  const [lang, setLang] = useState("");

  const shown = items.filter((i) => {
    if (lang === "none") return !i.language;
    if (lang) return i.language === lang;
    return true;
  });

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <h2 className="text-[13px] font-semibold text-ink">Open items ({shown.length})</h2>
        {client.languages.length > 0 && (
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-lg border border-line bg-card px-2 py-1 text-[12px] text-ink outline-none focus:border-accent"
            aria-label="Filter by language"
          >
            <option value="">All languages</option>
            {client.languages.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
            <option value="none">No language</option>
          </select>
        )}
      </div>
      {shown.length === 0 ? (
        <div className="card px-4 py-6 text-center text-[12px] text-muted">
          {lang ? "No open items for this language." : "No open items."}
        </div>
      ) : (
        <div className="card divide-y divide-line/70 overflow-hidden">
          {shown.map((i) => (
            <ItemRow key={i.id} item={i} client={client} />
          ))}
        </div>
      )}
    </section>
  );
}
