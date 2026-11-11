import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { STATS } from "@/lib/dex";
import type { Database } from "@/lib/supabase/database.types";

type Creature = Database["public"]["Tables"]["creatures"]["Row"];
type Option = { id: string; name: string };

export function CreatureForm({
  action,
  creature,
  nextNumber,
  types,
  categories,
}: {
  action: (form: FormData) => Promise<void>;
  creature?: Creature;
  nextNumber?: number;
  types: Option[];
  categories: Option[];
}) {
  const typeOptions = types.map((t) => (
    <option key={t.id} value={t.id}>
      {t.name}
    </option>
  ));
  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-4">
        <div className="grid grid-cols-[6rem_1fr] gap-3">
          <Field label="Numéro">
            <Input name="number" type="number" min={0} max={9999} required defaultValue={creature?.number ?? nextNumber} />
          </Field>
          <Field label="Nom">
            <Input name="name" required maxLength={40} defaultValue={creature?.name} placeholder="Brumelin" autoFocus={!creature} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Espèce">
            <Input name="species" defaultValue={creature?.species ?? ""} placeholder="Créature Brouillard" />
          </Field>
          <Field label="Catégorie">
            <Select name="category_id" defaultValue={creature?.category_id ?? ""}>
              <option value="">Sans catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Type 1">
            <Select name="primary_type_id" defaultValue={creature?.primary_type_id ?? ""}>
              <option value="">—</option>
              {typeOptions}
            </Select>
          </Field>
          <Field label="Type 2">
            <Select name="secondary_type_id" defaultValue={creature?.secondary_type_id ?? ""}>
              <option value="">—</option>
              {typeOptions}
            </Select>
          </Field>
          <Field label="Taille (m)">
            <Input name="height_m" type="number" step="0.01" min={0.01} defaultValue={creature?.height_m ?? ""} />
          </Field>
          <Field label="Poids (kg)">
            <Input name="weight_kg" type="number" step="0.1" min={0.1} defaultValue={creature?.weight_kg ?? ""} />
          </Field>
        </div>
        <Field label="Description">
          <Textarea name="description" rows={4} defaultValue={creature?.description ?? ""} />
        </Field>
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-stone-600">Statistiques de base</legend>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {STATS.map(([key, label]) => (
              <Field key={key} label={label}>
                <Input name={key} type="number" min={1} max={255} required defaultValue={creature?.[key] ?? 50} />
              </Field>
            ))}
          </div>
        </fieldset>
        <Button>{creature ? "Enregistrer" : "Créer la créature"}</Button>
      </div>
      <Field label={creature?.image_path ? "Remplacer l’image" : "Image (PNG, JPG, WebP, GIF · 5 Mo max)"}>
        <Input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      </Field>
    </form>
  );
}
