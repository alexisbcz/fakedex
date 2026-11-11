import { redirect } from "next/navigation";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { createDex } from "@/lib/actions";
import { getUser } from "@/lib/supabase/server";

export default async function NewDexPage() {
  const { user } = await getUser();
  if (!user) redirect("/login?next=/dex/new");
  return (
    <form action={createDex} className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Nouveau dex</h1>
      <Field label="Nom">
        <Input name="name" required maxLength={80} placeholder="Région de Brumelande" autoFocus />
      </Field>
      <Field label="Description">
        <Textarea name="description" />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_public" defaultChecked /> Visible par tout le monde
      </label>
      <Button>Créer le dex</Button>
    </form>
  );
}
