import Link from "next/link";
import { notFound } from "next/navigation";
import { EvolutionTree, findRoot } from "@/components/evolution-tree";
import { Button, Field, Input, Section, Select, TypeBadge } from "@/components/ui";
import {
  addCreatureAbility,
  addCreatureMove,
  addEvolution,
  deleteRow,
  removeCreatureAbility,
  removeCreatureMove,
} from "@/lib/actions";
import { DAMAGE_CLASS, dexNumber, EVOLUTION_TRIGGER, getDex, imageUrl, LEARN_METHOD, STATS } from "@/lib/dex";

function statColor(v: number) {
  if (v < 50) return "bg-red-400";
  if (v < 80) return "bg-amber-400";
  if (v < 110) return "bg-lime-500";
  return "bg-emerald-500";
}

export default async function CreaturePage({ params }: PageProps<"/dex/[dexId]/creatures/[creatureId]">) {
  const { dexId, creatureId } = await params;
  const { supabase, isOwner } = await getDex(dexId);

  const [{ data: c }, { data: abilities }, { data: moves }, { data: allCreatures }, { data: edges }, { data: dexAbilities }, { data: dexMoves }] =
    await Promise.all([
      supabase
        .from("creatures")
        .select(
          "*, category:categories(name), primary:types!creatures_primary_type_id_dex_id_fkey(name, color), secondary:types!creatures_secondary_type_id_dex_id_fkey(name, color)",
        )
        .eq("id", creatureId)
        .eq("dex_id", dexId)
        .maybeSingle(),
      supabase.from("creature_abilities").select("is_hidden, ability:abilities(id, name, description)").eq("creature_id", creatureId),
      supabase
        .from("creature_moves")
        .select("id, method, level, move:moves(name, damage_class, power, accuracy, pp, type:types(name, color))")
        .eq("creature_id", creatureId)
        .order("level", { nullsFirst: false }),
      supabase.from("creatures").select("id, name, number, image_path").eq("dex_id", dexId).order("number"),
      supabase.from("evolutions").select("id, from_creature_id, to_creature_id, trigger, min_level, condition").eq("dex_id", dexId),
      isOwner ? supabase.from("abilities").select("id, name").eq("dex_id", dexId).order("name") : Promise.resolve({ data: [] }),
      isOwner ? supabase.from("moves").select("id, name").eq("dex_id", dexId).order("name") : Promise.resolve({ data: [] }),
    ]);
  if (!c) notFound();

  const src = imageUrl(c.image_path);
  const total = STATS.reduce((sum, [k]) => sum + c[k], 0);
  const rootId = findRoot(c.id, edges ?? []);
  const inChain = rootId !== c.id || (edges ?? []).some((e) => e.from_creature_id === c.id);
  const outgoing = (edges ?? []).filter((e) => e.from_creature_id === c.id);
  const hasParent = new Set((edges ?? []).map((e) => e.to_creature_id));
  const evolutionTargets = (allCreatures ?? []).filter((x) => x.id !== c.id && !hasParent.has(x.id) && x.id !== rootId);
  const sortedMoves = [...(moves ?? [])].sort(
    (a, b) => Object.keys(LEARN_METHOD).indexOf(a.method) - Object.keys(LEARN_METHOD).indexOf(b.method) || (a.level ?? 0) - (b.level ?? 0),
  );

  return (
    <div className="space-y-10">
      <div className="grid gap-8 md:grid-cols-[20rem_1fr]">
        <div className="flex aspect-square items-center justify-center rounded-xl border border-stone-200 bg-white">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={c.name} className="size-full object-contain p-6" />
          ) : (
            <span className="text-6xl text-stone-300">?</span>
          )}
        </div>
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="font-mono text-sm tabular-nums text-stone-500">{dexNumber(c.number)}</span>
              <h2 className="text-3xl font-semibold tracking-tight">{c.name}</h2>
              {c.species && <p className="text-stone-600">{c.species}</p>}
              <div className="mt-2 flex gap-1.5">
                <TypeBadge type={c.primary} />
                <TypeBadge type={c.secondary} />
              </div>
            </div>
            {isOwner && (
              <Link href={`/dex/${dexId}/creatures/${c.id}/edit`} className="text-sm text-stone-600 underline-offset-4 hover:underline">
                Modifier
              </Link>
            )}
          </div>
          {c.description && <p className="max-w-prose text-stone-800">{c.description}</p>}
          <dl className="flex gap-8 text-sm">
            <div>
              <dt className="text-xs text-stone-500">Catégorie</dt>
              <dd>{c.category?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">Taille</dt>
              <dd className="tabular-nums">{c.height_m ? `${c.height_m} m` : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">Poids</dt>
              <dd className="tabular-nums">{c.weight_kg ? `${c.weight_kg} kg` : "—"}</dd>
            </div>
          </dl>
          <div className="space-y-1.5">
            {STATS.map(([key, label]) => (
              <div key={key} className="grid grid-cols-[5.5rem_2.5rem_1fr] items-center gap-2 text-sm">
                <span className="text-stone-600">{label}</span>
                <span className="text-right font-medium tabular-nums">{c[key]}</span>
                <div className="h-2 rounded-full bg-stone-200">
                  <div className={`h-2 rounded-full ${statColor(c[key])}`} style={{ width: `${(c[key] / 255) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[5.5rem_2.5rem_1fr] gap-2 border-t border-stone-200 pt-1.5 text-sm">
              <span className="text-stone-600">Total</span>
              <span className="text-right font-semibold tabular-nums">{total}</span>
            </div>
          </div>
        </div>
      </div>

      <Section title="Talents">
        <ul className="space-y-2">
          {abilities?.map(({ ability, is_hidden }) =>
            ability ? (
              <li key={ability.id} className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-medium">{ability.name}</span>
                  {is_hidden && <span className="ml-2 rounded bg-stone-200 px-1.5 py-0.5 text-[11px] text-stone-700">caché</span>}
                  {ability.description && <p className="text-sm text-stone-600">{ability.description}</p>}
                </div>
                {isOwner && (
                  <form action={removeCreatureAbility.bind(null, dexId, c.id, ability.id)}>
                    <Button variant="danger" className="h-6 px-2 text-xs">Retirer</Button>
                  </form>
                )}
              </li>
            ) : null,
          )}
          {!abilities?.length && <p className="text-sm text-stone-500">Aucun talent.</p>}
        </ul>
        {isOwner && (
          dexAbilities?.length ? (
            <form action={addCreatureAbility.bind(null, dexId, c.id)} className="flex flex-wrap items-center gap-2">
              <Select name="ability_id" required className="w-56">
                {dexAbilities.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
              <label className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="is_hidden" /> Caché
              </label>
              <Button variant="ghost">Ajouter</Button>
            </form>
          ) : (
            <p className="text-sm text-stone-500">
              Crée d’abord des talents dans l’onglet <Link className="underline" href={`/dex/${dexId}/abilities`}>Talents</Link>.
            </p>
          )
        )}
      </Section>

      <Section title="Capacités">
        {sortedMoves.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-200 text-left text-xs text-stone-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Apprise</th>
                  <th className="px-3 py-2 font-medium">Capacité</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Cat.</th>
                  <th className="px-3 py-2 text-right font-medium">Puiss.</th>
                  <th className="px-3 py-2 text-right font-medium">Préc.</th>
                  <th className="px-3 py-2 text-right font-medium">PP</th>
                  {isOwner && <th />}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sortedMoves.map((m) => (
                  <tr key={m.id}>
                    <td className="px-3 py-2 tabular-nums text-stone-600">
                      {m.method === "level" ? `Niv. ${m.level}` : LEARN_METHOD[m.method]}
                    </td>
                    <td className="px-3 py-2 font-medium">{m.move?.name}</td>
                    <td className="px-3 py-2"><TypeBadge type={m.move?.type ?? null} /></td>
                    <td className="px-3 py-2 text-stone-600">{m.move && DAMAGE_CLASS[m.move.damage_class]}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{m.move?.power ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{m.move?.accuracy ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{m.move?.pp}</td>
                    {isOwner && (
                      <td className="px-3 py-2 text-right">
                        <form action={removeCreatureMove.bind(null, dexId, c.id, m.id)}>
                          <Button variant="danger" className="h-6 px-2 text-xs">Retirer</Button>
                        </form>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-stone-500">Aucune capacité.</p>
        )}
        {isOwner && (
          dexMoves?.length ? (
            <form action={addCreatureMove.bind(null, dexId, c.id)} className="flex flex-wrap items-end gap-2">
              <Field label="Capacité">
                <Select name="move_id" required className="w-56">
                  {dexMoves.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>
              </Field>
              <Field label="Méthode">
                <Select name="method" className="w-32">
                  {Object.entries(LEARN_METHOD).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
              </Field>
              <Field label="Niveau">
                <Input name="level" type="number" min={1} max={100} defaultValue={1} className="w-20" />
              </Field>
              <Button variant="ghost">Ajouter</Button>
            </form>
          ) : (
            <p className="text-sm text-stone-500">
              Crée d’abord des capacités dans l’onglet <Link className="underline" href={`/dex/${dexId}/moves`}>Capacités</Link>.
            </p>
          )
        )}
      </Section>

      <Section title="Évolutions">
        {inChain ? (
          <div className="rounded-lg border border-stone-200 bg-stone-100/60 p-3">
            <EvolutionTree rootId={rootId} dexId={dexId} creatures={allCreatures ?? []} edges={edges ?? []} highlight={c.id} />
          </div>
        ) : (
          <p className="text-sm text-stone-500">{c.name} n’évolue pas.</p>
        )}
        {isOwner && outgoing.length > 0 && (
          <ul className="space-y-1 text-sm">
            {outgoing.map((e) => (
              <li key={e.id} className="flex items-center gap-2">
                → {allCreatures?.find((x) => x.id === e.to_creature_id)?.name}
                <form action={deleteRow.bind(null, dexId, "evolutions", e.id, `/dex/${dexId}/creatures/${c.id}`)}>
                  <Button variant="danger" className="h-6 px-2 text-xs">Retirer</Button>
                </form>
              </li>
            ))}
          </ul>
        )}
        {isOwner && evolutionTargets.length > 0 && (
          <form action={addEvolution.bind(null, dexId, c.id)} className="flex flex-wrap items-end gap-2">
            <Field label={`${c.name} évolue en`}>
              <Select name="to_creature_id" required className="w-56">
                {evolutionTargets.map((x) => (
                  <option key={x.id} value={x.id}>
                    {dexNumber(x.number)} {x.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Déclencheur">
              <Select name="trigger" className="w-32">
                {Object.entries(EVOLUTION_TRIGGER).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Niveau">
              <Input name="min_level" type="number" min={1} max={100} className="w-20" />
            </Field>
            <Field label="Condition">
              <Input name="condition" placeholder="Pierre Lune, la nuit…" className="w-48" />
            </Field>
            <Button variant="ghost">Ajouter</Button>
          </form>
        )}
      </Section>
    </div>
  );
}
