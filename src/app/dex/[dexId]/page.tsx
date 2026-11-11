import Link from "next/link";
import { Button, ButtonLink, Empty, Input, Section, TypeBadge } from "@/components/ui";
import { createCategory, deleteRow } from "@/lib/actions";
import { dexNumber, getDex, imageUrl } from "@/lib/dex";

export default async function DexPage({ params }: PageProps<"/dex/[dexId]">) {
  const { dexId } = await params;
  const { supabase, isOwner } = await getDex(dexId);

  const [{ data: categories }, { data: creatures }] = await Promise.all([
    supabase.from("categories").select("id, name").eq("dex_id", dexId).order("position"),
    supabase
      .from("creatures")
      .select(
        "id, number, name, species, image_path, category_id, primary:types!creatures_primary_type_id_dex_id_fkey(name, color), secondary:types!creatures_secondary_type_id_dex_id_fkey(name, color)",
      )
      .eq("dex_id", dexId)
      .order("number"),
  ]);

  const groups = [
    ...(categories ?? []).map((c) => ({ ...c, creatures: (creatures ?? []).filter((x) => x.category_id === c.id) })),
    { id: null, name: "Sans catégorie", creatures: (creatures ?? []).filter((x) => !x.category_id) },
  ].filter((g) => g.id !== null || g.creatures.length > 0);

  return (
    <div className="space-y-10">
      {isOwner && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ButtonLink href={`/dex/${dexId}/creatures/new`}>Nouvelle créature</ButtonLink>
          <form action={createCategory.bind(null, dexId)} className="flex gap-2">
            <Input name="name" required placeholder="Nouvelle catégorie" className="w-48" />
            <Button variant="ghost">Ajouter</Button>
          </form>
        </div>
      )}

      {!creatures?.length && !categories?.length && (
        <Empty>
          Ce dex est vide.
          {isOwner && " Commence par créer des types, puis ta première créature."}
        </Empty>
      )}

      {groups.map((group) => (
        <Section
          key={group.id ?? "none"}
          title={`${group.name} (${group.creatures.length})`}
          action={
            isOwner &&
            group.id &&
            group.creatures.length === 0 && (
              <form action={deleteRow.bind(null, dexId, "categories", group.id, `/dex/${dexId}`)}>
                <Button variant="danger" className="h-6 px-2 text-xs">
                  Supprimer
                </Button>
              </form>
            )
          }
        >
          {group.creatures.length === 0 ? (
            <p className="text-sm text-stone-500">Aucune créature dans cette catégorie.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {group.creatures.map((c) => {
                const src = imageUrl(c.image_path);
                return (
                  <li key={c.id}>
                    <Link
                      href={`/dex/${dexId}/creatures/${c.id}`}
                      className="block rounded-lg border border-stone-200 bg-white p-2 transition-colors hover:border-stone-400"
                    >
                      <div className="flex aspect-square items-center justify-center rounded-md bg-stone-100">
                        {src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={src} alt={c.name} className="size-full object-contain p-2" />
                        ) : (
                          <span className="text-2xl text-stone-300">?</span>
                        )}
                      </div>
                      <div className="mt-2 px-1">
                        <span className="font-mono text-xs tabular-nums text-stone-500">{dexNumber(c.number)}</span>
                        <p className="truncate text-sm font-medium">{c.name}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <TypeBadge type={c.primary} />
                          <TypeBadge type={c.secondary} />
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      ))}
    </div>
  );
}
