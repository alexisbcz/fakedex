"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  ["", "Créatures"],
  ["/evolutions", "Évolutions"],
  ["/types", "Types"],
  ["/abilities", "Talents"],
  ["/moves", "Capacités"],
] as const;

export function DexTabs({ dexId, isOwner }: { dexId: string; isOwner: boolean }) {
  const pathname = usePathname();
  const base = `/dex/${dexId}`;
  const tabs = isOwner ? [...TABS, ["/settings", "Paramètres"] as const] : TABS;
  return (
    <nav className="-mb-px flex gap-5 overflow-x-auto text-sm">
      {tabs.map(([suffix, label]) => {
        const href = base + suffix;
        const active = suffix === "" ? pathname === base || pathname.startsWith(`${base}/creatures`) : pathname.startsWith(href);
        return (
          <Link
            key={suffix}
            href={href}
            className={`whitespace-nowrap border-b-2 pb-2 transition-colors ${active ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-800"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
