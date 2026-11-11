import Link from "next/link";
import { dexNumber, EVOLUTION_TRIGGER, imageUrl } from "@/lib/dex";

export type ChainCreature = { id: string; name: string; number: number; image_path: string | null };
export type ChainEdge = {
  id: string;
  from_creature_id: string;
  to_creature_id: string;
  trigger: keyof typeof EVOLUTION_TRIGGER;
  min_level: number | null;
  condition: string | null;
};

export function edgeLabel(e: ChainEdge) {
  if (e.trigger === "level" && e.min_level) return `Niv. ${e.min_level}${e.condition ? ` · ${e.condition}` : ""}`;
  return [EVOLUTION_TRIGGER[e.trigger], e.condition].filter(Boolean).join(" · ");
}

export function findRoot(id: string, edges: ChainEdge[]) {
  const parent = new Map(edges.map((e) => [e.to_creature_id, e.from_creature_id]));
  const seen = new Set<string>();
  let current = id;
  while (parent.has(current) && !seen.has(current)) {
    seen.add(current);
    current = parent.get(current)!;
  }
  return current;
}

function Node({
  id,
  dexId,
  creatures,
  edges,
  highlight,
}: {
  id: string;
  dexId: string;
  creatures: Map<string, ChainCreature>;
  edges: ChainEdge[];
  highlight?: string;
}) {
  const c = creatures.get(id);
  if (!c) return null;
  const children = edges.filter((e) => e.from_creature_id === id);
  const src = imageUrl(c.image_path);
  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/dex/${dexId}/creatures/${c.id}`}
        className={`flex w-24 shrink-0 flex-col items-center rounded-lg border bg-white p-2 text-center transition-colors hover:border-stone-400 ${c.id === highlight ? "border-stone-900" : "border-stone-200"}`}
      >
        <div className="flex size-16 items-center justify-center">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="size-full object-contain" />
          ) : (
            <span className="text-xl text-stone-300">?</span>
          )}
        </div>
        <span className="font-mono text-[10px] tabular-nums text-stone-500">{dexNumber(c.number)}</span>
        <span className="w-full truncate text-xs font-medium">{c.name}</span>
      </Link>
      {children.length > 0 && (
        <div className="flex flex-col gap-3">
          {children.map((e) => (
            <div key={e.id} className="flex items-center gap-3">
              <div className="flex w-24 flex-col items-center text-[11px] text-stone-500">
                <span className="text-center leading-tight">{edgeLabel(e)}</span>
                <span aria-hidden>→</span>
              </div>
              <Node id={e.to_creature_id} dexId={dexId} creatures={creatures} edges={edges} highlight={highlight} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EvolutionTree(props: {
  rootId: string;
  dexId: string;
  creatures: ChainCreature[];
  edges: ChainEdge[];
  highlight?: string;
}) {
  const creatures = new Map(props.creatures.map((c) => [c.id, c]));
  return (
    <div className="overflow-x-auto pb-1">
      <Node id={props.rootId} dexId={props.dexId} creatures={creatures} edges={props.edges} highlight={props.highlight} />
    </div>
  );
}
