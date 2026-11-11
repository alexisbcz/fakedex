import { notFound } from "next/navigation";
import { CreatureForm } from "@/components/creature-form";
import { Button } from "@/components/ui";
import { deleteCreature, updateCreature } from "@/lib/actions";
import { getDex } from "@/lib/dex";

export default async function EditCreaturePage({ params }: PageProps<"/dex/[dexId]/creatures/[creatureId]/edit">) {
  const { dexId, creatureId } = await params;
  const { supabase, isOwner } = await getDex(dexId);
  if (!isOwner) notFound();
  const [{ data: creature }, { data: types }, { data: categories }] = await Promise.all([
    supabase.from("creatures").select("*").eq("id", creatureId).eq("dex_id", dexId).maybeSingle(),
    supabase.from("types").select("id, name").eq("dex_id", dexId).order("name"),
    supabase.from("categories").select("id, name").eq("dex_id", dexId).order("position"),
  ]);
  if (!creature) notFound();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Modifier {creature.name}</h2>
      <CreatureForm
        action={updateCreature.bind(null, dexId, creatureId)}
        creature={creature}
        types={types ?? []}
        categories={categories ?? []}
      />
      <form action={deleteCreature.bind(null, dexId, creatureId)} className="flex items-center gap-3 border-t border-stone-200 pt-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" required /> Supprimer définitivement
        </label>
        <Button variant="ghost" className="border-red-300 text-red-700 hover:bg-red-50">
          Supprimer {creature.name}
        </Button>
      </form>
    </div>
  );
}
