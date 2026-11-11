import { notFound } from "next/navigation";
import { CreatureForm } from "@/components/creature-form";
import { createCreature } from "@/lib/actions";
import { getDex } from "@/lib/dex";

export default async function NewCreaturePage({ params }: PageProps<"/dex/[dexId]/creatures/new">) {
  const { dexId } = await params;
  const { supabase, isOwner } = await getDex(dexId);
  if (!isOwner) notFound();
  const [{ data: types }, { data: categories }, { data: last }] = await Promise.all([
    supabase.from("types").select("id, name").eq("dex_id", dexId).order("name"),
    supabase.from("categories").select("id, name").eq("dex_id", dexId).order("position"),
    supabase.from("creatures").select("number").eq("dex_id", dexId).order("number", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Nouvelle créature</h2>
      <CreatureForm
        action={createCreature.bind(null, dexId)}
        nextNumber={(last?.number ?? 0) + 1}
        types={types ?? []}
        categories={categories ?? []}
      />
    </div>
  );
}
