"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard", icon: GridIcon },
  { href: "/items", label: "Items", icon: ListIcon },
  { href: "/clients", label: "Clients", icon: UsersIcon },
  { href: "/meetings", label: "Meetings", icon: CalendarIcon },
  { href: "/standup", label: "Standup", icon: BoltIcon },
  { href: "/settings", label: "Settings", icon: GearIcon },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-line bg-card px-3 py-4">
      <div className="flex items-center gap-2 px-2 pb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-[13px] font-semibold text-white">
          W
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          WorkDay
        </span>
      </div>

      <Link
        href="/items/new"
        onClick={onNavigate}
        className="mb-4 flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-[13px] font-medium text-white shadow-sm transition hover:bg-accent-dark"
      >
        <PlusIcon />
        New item
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-subtle hover:bg-canvas hover:text-ink"
              }`}
            >
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pt-3 text-[11px] text-muted">v0.1 · Phase 1</div>
    </aside>
  );
}

// --- Icons (inherit currentColor) ---
function base(active?: boolean) {
  return `h-4 w-4 ${active ? "text-accent" : "text-muted"}`;
}
function GridIcon({ active }: { active?: boolean }) {
  return (
    <svg className={base(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function ListIcon({ active }: { active?: boolean }) {
  return (
    <svg className={base(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  );
}
function UsersIcon({ active }: { active?: boolean }) {
  return (
    <svg className={base(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="3.2" />
      <path d="M22 19v-1a4 4 0 0 0-3-3.87M16 3.5a4 4 0 0 1 0 7" />
    </svg>
  );
}
function CalendarIcon({ active }: { active?: boolean }) {
  return (
    <svg className={base(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </svg>
  );
}
function BoltIcon({ active }: { active?: boolean }) {
  return (
    <svg className={base(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}
function GearIcon({ active }: { active?: boolean }) {
  return (
    <svg className={base(active)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5l1.4 2.1 2.5-.5.4 2.5 2.2 1.2-1 2.3 1 2.3-2.2 1.2-.4 2.5-2.5-.5L12 21.5l-1.4-2.1-2.5.5-.4-2.5-2.2-1.2 1-2.3-1-2.3 2.2-1.2.4-2.5 2.5.5L12 2.5z" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
