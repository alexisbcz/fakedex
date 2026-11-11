import { signInWithGoogle } from "@/lib/actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, next } = await searchParams;
  return (
    <div className="mx-auto max-w-sm space-y-6 rounded-lg border border-stone-200 bg-white p-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Connexion</h1>
        <p className="text-sm text-stone-600">Connecte-toi avec ton compte Google pour créer et modifier tes dex.</p>
      </div>
      {error && <p className="text-sm text-red-700">La connexion a échoué. Réessaie.</p>}
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={typeof next === "string" ? next : "/"} />
        <button className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-stone-300 bg-white text-sm font-medium transition-colors hover:bg-stone-100 active:scale-[0.99]">
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
            <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
            <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
          </svg>
          Continuer avec Google
        </button>
      </form>
    </div>
  );
}
