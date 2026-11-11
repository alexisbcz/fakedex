"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Enums = Database["public"]["Enums"];

function text(form: FormData, key: string) {
  const value = String(form.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function int(form: FormData, key: string) {
  const value = text(form, key);
  return value === null ? null : Number.parseInt(value, 10);
}

function num(form: FormData, key: string) {
  const value = text(form, key);
  return value === null ? null : Number(value.replace(",", "."));
}

function fail(message: string): never {
  throw new Error(message);
}

async function requireUser() {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

// Auth ----------------------------------------------------------------------

export async function signInWithGoogle(form: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3030";
  const next = text(form, "next") ?? "/";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) redirect("/login?error=1");
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// Dexes ---------------------------------------------------------------------

export async function createDex(form: FormData) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("dexes")
    .insert({
      owner_id: user.id,
      name: text(form, "name") ?? fail("Nom requis"),
      description: text(form, "description"),
      is_public: form.get("is_public") === "on",
    })
    .select("id")
    .single();
  if (error) fail(error.message);
  redirect(`/dex/${data.id}`);
}

export async function updateDex(dexId: string, form: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("dexes")
    .update({
      name: text(form, "name") ?? fail("Nom requis"),
      description: text(form, "description"),
      is_public: form.get("is_public") === "on",
    })
    .eq("id", dexId);
  if (error) fail(error.message);
  revalidatePath(`/dex/${dexId}`, "layout");
}

export async function deleteDex(dexId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("dexes").delete().eq("id", dexId);
  if (error) fail(error.message);
  redirect("/");
}

// Dex-scoped lists ----------------------------------------------------------

export async function createCategory(dexId: string, form: FormData) {
  const { supabase } = await requireUser();
  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("dex_id", dexId);
  const { error } = await supabase.from("categories").insert({
    dex_id: dexId,
    name: text(form, "name") ?? fail("Nom requis"),
    position: count ?? 0,
  });
  if (error) fail(error.message);
  revalidatePath(`/dex/${dexId}`);
}

export async function createType(dexId: string, form: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("types").insert({
    dex_id: dexId,
    name: text(form, "name") ?? fail("Nom requis"),
    color: text(form, "color") ?? "#9ca3af",
  });
  if (error) fail(error.message);
  revalidatePath(`/dex/${dexId}/types`);
}

export async function setMatchup(dexId: string, form: FormData) {
  const { supabase } = await requireUser();
  const attacker = text(form, "attacker") ?? fail("Type requis");
  const defender = text(form, "defender") ?? fail("Type requis");
  const multiplier = num(form, "multiplier") ?? 1;
  if (multiplier === 1) {
    await supabase
      .from("type_matchups")
      .delete()
      .eq("attacker_type_id", attacker)
      .eq("defender_type_id", defender);
  } else {
    const { error } = await supabase.from("type_matchups").upsert({
      dex_id: dexId,
      attacker_type_id: attacker,
      defender_type_id: defender,
      multiplier,
    });
    if (error) fail(error.message);
  }
  revalidatePath(`/dex/${dexId}/types`);
}

export async function createAbility(dexId: string, form: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("abilities").insert({
    dex_id: dexId,
    name: text(form, "name") ?? fail("Nom requis"),
    description: text(form, "description"),
  });
  if (error) fail(error.message);
  revalidatePath(`/dex/${dexId}/abilities`);
}

export async function createMove(dexId: string, form: FormData) {
  const { supabase } = await requireUser();
  const damageClass = (text(form, "damage_class") ?? "physical") as Enums["damage_class"];
  const { error } = await supabase.from("moves").insert({
    dex_id: dexId,
    name: text(form, "name") ?? fail("Nom requis"),
    type_id: text(form, "type_id"),
    damage_class: damageClass,
    power: damageClass === "status" ? null : int(form, "power"),
    accuracy: int(form, "accuracy"),
    pp: int(form, "pp") ?? 10,
    description: text(form, "description"),
  });
  if (error) fail(error.message);
  revalidatePath(`/dex/${dexId}/moves`);
}

const deletable = ["categories", "types", "abilities", "moves", "evolutions"] as const;

export async function deleteRow(
  dexId: string,
  table: (typeof deletable)[number],
  id: string,
  path: string,
) {
  if (!deletable.includes(table)) fail("Table inconnue");
  const { supabase } = await requireUser();
  const { error } = await supabase.from(table).delete().eq("id", id).eq("dex_id", dexId);
  if (error) fail(error.message);
  revalidatePath(path);
}

// Creatures -----------------------------------------------------------------

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  dexId: string,
  file: FormDataEntryValue | null,
) {
  if (!(file instanceof File) || file.size === 0) return undefined;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `${userId}/${dexId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("creature-images")
    .upload(path, file, { contentType: file.type });
  if (error) fail(error.message);
  return path;
}

function creatureFields(form: FormData) {
  return {
    number: int(form, "number") ?? fail("Numéro requis"),
    name: text(form, "name") ?? fail("Nom requis"),
    species: text(form, "species"),
    description: text(form, "description"),
    category_id: text(form, "category_id"),
    primary_type_id: text(form, "primary_type_id"),
    secondary_type_id: text(form, "secondary_type_id"),
    height_m: num(form, "height_m"),
    weight_kg: num(form, "weight_kg"),
    hp: int(form, "hp") ?? 50,
    attack: int(form, "attack") ?? 50,
    defense: int(form, "defense") ?? 50,
    sp_attack: int(form, "sp_attack") ?? 50,
    sp_defense: int(form, "sp_defense") ?? 50,
    speed: int(form, "speed") ?? 50,
  };
}

export async function createCreature(dexId: string, form: FormData) {
  const { supabase, user } = await requireUser();
  const image_path = await uploadImage(supabase, user.id, dexId, form.get("image"));
  const { data, error } = await supabase
    .from("creatures")
    .insert({ dex_id: dexId, image_path, ...creatureFields(form) })
    .select("id")
    .single();
  if (error) fail(error.message);
  redirect(`/dex/${dexId}/creatures/${data.id}`);
}

export async function updateCreature(dexId: string, creatureId: string, form: FormData) {
  const { supabase, user } = await requireUser();
  const image_path = await uploadImage(supabase, user.id, dexId, form.get("image"));
  const { error } = await supabase
    .from("creatures")
    .update({ ...creatureFields(form), ...(image_path ? { image_path } : {}) })
    .eq("id", creatureId)
    .eq("dex_id", dexId);
  if (error) fail(error.message);
  redirect(`/dex/${dexId}/creatures/${creatureId}`);
}

export async function deleteCreature(dexId: string, creatureId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("creatures")
    .delete()
    .eq("id", creatureId)
    .eq("dex_id", dexId);
  if (error) fail(error.message);
  redirect(`/dex/${dexId}`);
}

export async function addCreatureAbility(dexId: string, creatureId: string, form: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("creature_abilities").upsert({
    dex_id: dexId,
    creature_id: creatureId,
    ability_id: text(form, "ability_id") ?? fail("Talent requis"),
    is_hidden: form.get("is_hidden") === "on",
  });
  if (error) fail(error.message);
  revalidatePath(`/dex/${dexId}/creatures/${creatureId}`);
}

export async function removeCreatureAbility(dexId: string, creatureId: string, abilityId: string) {
  const { supabase } = await requireUser();
  await supabase
    .from("creature_abilities")
    .delete()
    .eq("creature_id", creatureId)
    .eq("ability_id", abilityId);
  revalidatePath(`/dex/${dexId}/creatures/${creatureId}`);
}

export async function addCreatureMove(dexId: string, creatureId: string, form: FormData) {
  const { supabase } = await requireUser();
  const method = (text(form, "method") ?? "level") as Enums["learn_method"];
  const { error } = await supabase.from("creature_moves").insert({
    dex_id: dexId,
    creature_id: creatureId,
    move_id: text(form, "move_id") ?? fail("Capacité requise"),
    method,
    level: method === "level" ? (int(form, "level") ?? 1) : null,
  });
  if (error) fail(error.message);
  revalidatePath(`/dex/${dexId}/creatures/${creatureId}`);
}

export async function removeCreatureMove(dexId: string, creatureId: string, id: string) {
  const { supabase } = await requireUser();
  await supabase.from("creature_moves").delete().eq("id", id);
  revalidatePath(`/dex/${dexId}/creatures/${creatureId}`);
}

export async function addEvolution(dexId: string, creatureId: string, form: FormData) {
  const { supabase } = await requireUser();
  const trigger = (text(form, "trigger") ?? "level") as Enums["evolution_trigger"];
  const { error } = await supabase.from("evolutions").insert({
    dex_id: dexId,
    from_creature_id: creatureId,
    to_creature_id: text(form, "to_creature_id") ?? fail("Créature requise"),
    trigger,
    min_level: trigger === "level" ? int(form, "min_level") : null,
    condition: text(form, "condition"),
  });
  if (error) {
    fail(error.code === "23505" ? "Cette créature évolue déjà depuis une autre." : error.message);
  }
  revalidatePath(`/dex/${dexId}/creatures/${creatureId}`);
}
