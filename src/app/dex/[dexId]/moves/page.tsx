import { Button, Empty, Field, Input, Section, Select, TypeBadge } from "@/components/ui";
import { createMove, deleteRow } from "@/lib/actions";
import { DAMAGE_CLASS, getDex } from "@/lib/dex";

export default async function MovesPage({ params }: PageProps<"/dex/[dexId]/moves">) {
  const { dexId } = await params;
  const { supabase, isOwner } = await getDex(dexId);
  const [{ data: moves }, { data: types }] = await Promise.all([
    supabase.from("moves").select("*, type:types(name, color)").eq("dex_id", dexId).order("name"),
    supabase.from("types").select("id, name").eq("dex_id", dexId).order("name"),
  ]);

  return (
    <Section title="Capacités">
      {isOwner && (
        <form action={createMove.bind(null, dexId)} className="grid grid-cols-2 gap-2 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-4 lg:grid-cols-7 lg:items-end">
          <Field label="Nom" className="col-span-2">
            <Input name="name" required maxLength={60} placeholder="Souffle givré" />
          </Field>
          <Field label="Type">
            <Select name="type_id">
              <option value="">—</option>
              {types?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Field>
          <Field label="Catégorie">
            <Select name="damage_class">
              {Object.entries(DAMAGE_CLASS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Puissance">
            <Input name="power" type="number" min={1} max={250} />
          </Field>
          <Field label="Précision">
            <Input name="accuracy" type="number" min={1} max={100} defaultValue={100} />
          </Field>
          <Field label="PP">
            <Input name="pp" type="number" min={1} max={64} defaultValue={15} />
          </Field>
          <Field label="Effet" className="col-span-2 sm:col-span-3 lg:col-span-6">
            <Input name="description" />
          </Field>
          <Button>Ajouter</Button>
        </form>
      )}
      {moves?.length ? (
        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 text-left text-xs text-stone-500">
              <tr>
                <th className="px-3 py-2 font-medium">Nom</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Cat.</th>
                <th className="px-3 py-2 text-right font-medium">Puiss.</th>
                <th className="px-3 py-2 text-right font-medium">Préc.</th>
                <th className="px-3 py-2 text-right font-medium">PP</th>
                <th className="px-3 py-2 font-medium">Effet</th>
                {isOwner && <th />}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {moves.map((m) => (
                <tr key={m.id}>
                  <td className="px-3 py-2 font-medium">{m.name}</td>
                  <td className="px-3 py-2"><TypeBadge type={m.type} /></td>
                  <td className="px-3 py-2 text-stone-600">{DAMAGE_CLASS[m.damage_class]}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.power ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.accuracy ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.pp}</td>
                  <td className="px-3 py-2 text-stone-600">{m.description}</td>
                  {isOwner && (
                    <td className="px-3 py-2 text-right">
                      <form action={deleteRow.bind(null, dexId, "moves", m.id, `/dex/${dexId}/moves`)}>
                        <Button variant="danger" className="h-6 px-2 text-xs">Supprimer</Button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Aucune capacité.</Empty>
      )}
    </Section>
  );
}
