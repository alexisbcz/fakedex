import { notFound } from "next/navigation";
import { Button, Field, Input, Section, Textarea } from "@/components/ui";
import { deleteDex, updateDex } from "@/lib/actions";
import { getDex } from "@/lib/dex";

export default async function SettingsPage({ params }: PageProps<"/dex/[dexId]/settings">) {
  const { dexId } = await params;
  const { dex, isOwner } = await getDex(dexId);
  if (!isOwner) notFound();
  return (
    <div className="max-w-lg space-y-10">
      <Section title="Paramètres">
        <form action={updateDex.bind(null, dexId)} className="space-y-4">
          <Field label="Nom">
            <Input name="name" required maxLength={80} defaultValue={dex.name} />
          </Field>
          <Field label="Description">
            <Textarea name="description" defaultValue={dex.description ?? ""} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_public" defaultChecked={dex.is_public} /> Visible par tout le monde
          </label>
          <Button>Enregistrer</Button>
        </form>
      </Section>
      <Section title="Supprimer le dex">
        <p className="text-sm text-stone-600">Supprime le dex et toutes ses créatures, types, talents et capacités.</p>
        <form action={deleteDex.bind(null, dexId)} className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" required /> Je comprends que c’est définitif
          </label>
          <Button variant="ghost" className="border-red-300 text-red-700 hover:bg-red-50">
            Supprimer « {dex.name} »
          </Button>
        </form>
      </Section>
    </div>
  );
}
