import { Button, Empty, Field, Input, Section, TypeBadge } from "@/components/ui";
import { createType, deleteRow, setMatchup } from "@/lib/actions";
import { getDex } from "@/lib/dex";

const LABEL: Record<string, string> = { "0": "×0", "0.5": "×½", "2": "×2" };
const CELL: Record<string, string> = { "0": "bg-stone-800 text-white", "0.5": "bg-red-100 text-red-800", "2": "bg-emerald-100 text-emerald-800" };

export default async function TypesPage({ params }: PageProps<"/dex/[dexId]/types">) {
  const { dexId } = await params;
  const { supabase, isOwner } = await getDex(dexId);
  const [{ data: types }, { data: matchups }] = await Promise.all([
    supabase.from("types").select("id, name, color").eq("dex_id", dexId).order("name"),
    supabase.from("type_matchups").select("attacker_type_id, defender_type_id, multiplier").eq("dex_id", dexId),
  ]);
  const chart = new Map((matchups ?? []).map((m) => [`${m.attacker_type_id}:${m.defender_type_id}`, String(Number(m.multiplier))]));

  return (
    <div className="space-y-10">
      <Section title="Types">
        {isOwner && (
          <form action={createType.bind(null, dexId)} className="flex flex-wrap items-end gap-2">
            <Field label="Nom">
              <Input name="name" required maxLength={30} placeholder="Brume" className="w-48" />
            </Field>
            <Field label="Couleur">
              <Input name="color" type="color" defaultValue="#6b8fb3" className="h-[34px] w-16 p-1" />
            </Field>
            <Button>Ajouter</Button>
          </form>
        )}
        {types?.length ? (
          <ul className="flex flex-wrap gap-2">
            {types.map((t) => (
              <li key={t.id} className="flex items-center gap-1">
                <TypeBadge type={t} />
                {isOwner && (
                  <form action={deleteRow.bind(null, dexId, "types", t.id, `/dex/${dexId}/types`)}>
                    <button className="text-xs text-stone-400 hover:text-red-700" aria-label={`Supprimer ${t.name}`}>
                      ×
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Aucun type. Les types servent aux créatures et aux capacités.</Empty>
        )}
      </Section>

      {types && types.length > 1 && (
        <Section title="Table des types">
          <p className="text-sm text-stone-600">
            Ligne = type de l’attaque, colonne = type du défenseur. Une case vide vaut ×1.
          </p>
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs">
              <thead>
                <tr>
                  <th />
                  {types.map((d) => (
                    <th key={d.id} className="pb-1" title={d.name}>
                      <span
                        className="mx-auto block w-7 rounded py-0.5 text-[10px] font-semibold uppercase text-white"
                        style={{ backgroundColor: d.color }}
                      >
                        {d.name.slice(0, 3)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {types.map((a) => (
                  <tr key={a.id}>
                    <th className="pr-2 text-right">
                      <TypeBadge type={a} />
                    </th>
                    {types.map((d) => {
                      const value = chart.get(`${a.id}:${d.id}`) ?? "1";
                      return (
                        <td key={d.id} className="border border-stone-200 p-0">
                          {isOwner ? (
                            <form action={setMatchup.bind(null, dexId)}>
                              <input type="hidden" name="attacker" value={a.id} />
                              <input type="hidden" name="defender" value={d.id} />
                              <input type="hidden" name="multiplier" value={{ "1": "2", "2": "0.5", "0.5": "0", "0": "1" }[value]} />
                              <button
                                title="Cliquer pour changer (×1 → ×2 → ×½ → ×0)"
                                className={`size-8 font-semibold tabular-nums ${CELL[value] ?? "bg-white hover:bg-stone-100"}`}
                              >
                                {LABEL[value] ?? ""}
                              </button>
                            </form>
                          ) : (
                            <span className={`flex size-8 items-center justify-center font-semibold ${CELL[value] ?? "bg-white"}`}>
                              {LABEL[value] ?? ""}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}
