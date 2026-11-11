import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

export const getDex = cache(async (dexId: string) => {
  const { supabase, user } = await getUser();
  const { data: dex } = await supabase
    .from("dexes")
    .select("*, owner:profiles(display_name, avatar_url)")
    .eq("id", dexId)
    .maybeSingle();
  if (!dex) notFound();
  return { supabase, user, dex, isOwner: user?.id === dex.owner_id };
});

export function imageUrl(path: string | null) {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/creature-images/${path}`;
}

export const STATS = [
  ["hp", "PV"],
  ["attack", "Attaque"],
  ["defense", "Défense"],
  ["sp_attack", "Att. Spé."],
  ["sp_defense", "Déf. Spé."],
  ["speed", "Vitesse"],
] as const;

export const DAMAGE_CLASS = { physical: "Physique", special: "Spéciale", status: "Statut" } as const;
export const LEARN_METHOD = { level: "Niveau", machine: "CT", egg: "Œuf", tutor: "Maître" } as const;
export const EVOLUTION_TRIGGER = {
  level: "Niveau",
  item: "Objet",
  trade: "Échange",
  friendship: "Amitié",
  other: "Autre",
} as const;

export function dexNumber(n: number) {
  return `#${String(n).padStart(3, "0")}`;
}
