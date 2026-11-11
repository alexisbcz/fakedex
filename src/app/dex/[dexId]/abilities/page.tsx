import { Button, Empty, Field, Input, Section } from "@/components/ui";
import { createAbility, deleteRow } from "@/lib/actions";
import { getDex } from "@/lib/dex";

export default async function AbilitiesPage({ params }: PageProps<"/dex/[dexId]/abilities">) {
  const { dexId } = await params;
  const { supabase, isOwner } = await getDex(dexId);
  const { data: abilities } = await supabase
    .from("abilities")
    .select("id, name, description, creature_abilities(count)")
    .eq("dex_id", dexId)
    .order("name");

  return (
    <Section title="Talents">
      {isOwner && (
        <form action={createAbility.bind(null, dexId)} className="grid gap-2 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
          <Field label="Nom">
            <Input name="name" required maxLength={60} placeholder="Voile de brume" />
          </Field>
          <Field label="Effet">
            <Input name="description" placeholder="Augmente l’esquive par temps de brouillard." />
          </Field>
          <Button>Ajouter</Button>
        </form>
      )}
      {abilities?.length ? (
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {abilities.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium">{a.name}</p>
                {a.description && <p className="text-sm text-stone-600">{a.description}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs text-stone-500">
                <span className="tabular-nums">{a.creature_abilities[0]?.count ?? 0} créatures</span>
                {isOwner && (
                  <form action={deleteRow.bind(null, dexId, "abilities", a.id, `/dex/${dexId}/abilities`)}>
                    <Button variant="danger" className="h-6 px-2 text-xs">Supprimer</Button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>Aucun talent.</Empty>
      )}
    </Section>
  );
}
