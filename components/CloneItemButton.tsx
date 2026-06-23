"use client";

import { useTransition } from "react";
import { cloneItem } from "@/app/(app)/items/actions";

export default function CloneItemButton({
  id,
  variant = "soft",
}: {
  id: string;
  variant?: "soft" | "outline";
}) {
  const [pending, startTransition] = useTransition();

  const cls =
    variant === "outline"
      ? "rounded-lg border border-line bg-card px-3 py-1.5 text-[12px] font-medium text-ink transition hover:bg-canvas"
      : "rounded-lg border border-line bg-card px-3 py-1.5 text-[12px] font-medium text-subtle transition hover:bg-canvas hover:text-ink";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => cloneItem(id))}
      className={`${cls} disabled:opacity-60`}
    >
      {pending ? "Cloning…" : "Clone"}
    </button>
  );
}
