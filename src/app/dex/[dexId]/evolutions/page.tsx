import { Empty, Section } from "@/components/ui";
import { EvolutionTree } from "@/components/evolution-tree";
import { getDex } from "@/lib/dex";

export default async function EvolutionsPage({ params }: PageProps<"/dex/[dexId]/evolutions">) {
  const { dexId } = await params;
  const { supabase, isOwner } = await getDex(dexId);
  const [{ data: creatures }, { data: edges }] = await Promise.all([
    supabase.from("creatures").select("id, name, number, image_path").eq("dex_id", dexId).order("number"),
    supabase.from("evolutions").select("id, from_creature_id, to_creature_id, trigger, min_level, condition").eq("dex_id", dexId),
  ]);
  const hasParent = new Set(edges?.map((e) => e.to_creature_id));
  const hasChild = new Set(edges?.map((e) => e.from_creature_id));
  const roots = (creatures ?? []).filter((c) => !hasParent.has(c.id) && hasChild.has(c.id));

  return (
    <Section title={`Chaînes d’évolution (${roots.length})`}>
      {roots.length ? (
        <ul className="space-y-4">
          {roots.map((r) => (
            <li key={r.id} className="rounded-lg border border-stone-200 bg-stone-100/60 p-3">
              <EvolutionTree rootId={r.id} dexId={dexId} creatures={creatures ?? []} edges={edges ?? []} />
            </li>
          ))}
        </ul>
      ) : (
        <Empty>
          Aucune chaîne.{isOwner && " Ouvre une créature et ajoute-lui une évolution."}
        </Empty>
      )}
    </Section>
  );
}
