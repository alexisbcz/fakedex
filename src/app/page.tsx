import Link from "next/link";
import { ButtonLink, Empty, Section } from "@/components/ui";
import { getUser } from "@/lib/supabase/server";

type DexRow = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  owner: { display_name: string | null } | null;
  creatures: { count: number }[];
};

function DexList({ dexes }: { dexes: DexRow[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {dexes.map((dex) => (
        <li key={dex.id}>
          <Link
            href={`/dex/${dex.id}`}
            className="block h-full rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:border-stone-400"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{dex.name}</span>
              <span className="text-xs tabular-nums text-stone-500">
                {dex.creatures[0]?.count ?? 0} créatures
              </span>
            </div>
            {dex.description && <p className="mt-1 line-clamp-2 text-sm text-stone-600">{dex.description}</p>}
            <p className="mt-3 text-xs text-stone-500">
              par {dex.owner?.display_name ?? "anonyme"}
              {!dex.is_public && " · privé"}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function Home() {
  const { supabase, user } = await getUser();
  const select = "id, name, description, is_public, owner:profiles(display_name), creatures(count)";

  const [{ data: mine }, { data: recent }] = await Promise.all([
    user
      ? supabase.from("dexes").select(select).eq("owner_id", user.id).order("updated_at", { ascending: false })
      : Promise.resolve({ data: [] as DexRow[] }),
    supabase.from("dexes").select(select).eq("is_public", true).order("updated_at", { ascending: false }).limit(30),
  ]);

  return (
    <div className="space-y-10">
      <div className="max-w-xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Crée ton propre dex</h1>
        <p className="text-stone-600">
          Invente des créatures, leurs types, leurs talents, leurs capacités et leurs chaînes d’évolution, puis
          partage le dex.
        </p>
      </div>

      {user && (
        <Section title="Mes dex" action={<ButtonLink href="/dex/new">Nouveau dex</ButtonLink>}>
          {mine?.length ? <DexList dexes={mine as DexRow[]} /> : <Empty>Tu n’as pas encore de dex.</Empty>}
        </Section>
      )}

      <Section title="Dex publics récents">
        {recent?.length ? <DexList dexes={recent as DexRow[]} /> : <Empty>Aucun dex public pour l’instant.</Empty>}
      </Section>
    </div>
  );
}
