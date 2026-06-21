import {
  ITEM_TYPE_META,
  PRIORITY_META,
  STATUS_META,
  type ItemType,
  type Priority,
  type ItemStatus,
} from "@/lib/types";

function Pill({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-none ${className}`}
    >
      {children}
    </span>
  );
}

export function TypeBadge({ type }: { type: ItemType }) {
  const meta = ITEM_TYPE_META[type];
  return <Pill className={meta.chip}>{meta.label}</Pill>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return (
    <Pill className={meta.chip}>
      <span className={`mr-1 h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </Pill>
  );
}

export function StatusBadge({ status }: { status: ItemStatus }) {
  const meta = STATUS_META[status];
  return <Pill className={meta.chip}>{meta.label}</Pill>;
}
