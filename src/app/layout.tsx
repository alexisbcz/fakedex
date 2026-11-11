import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { signOut } from "@/lib/actions";
import { getUser } from "@/lib/supabase/server";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fakedex",
  description: "Crée ton propre dex : créatures, types, talents, capacités et évolutions.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).single()
    : { data: null };

  return (
    <html lang="fr" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh font-sans">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="font-semibold tracking-tight">
              Fakedex
            </Link>
            {user ? (
              <div className="flex items-center gap-3 text-sm">
                <Link href="/dex/new" className="text-stone-600 hover:text-stone-900">
                  Nouveau dex
                </Link>
                {profile?.avatar_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="size-6 rounded-full" referrerPolicy="no-referrer" />
                )}
                <span className="text-stone-700">{profile?.display_name}</span>
                <form action={signOut}>
                  <button className="text-stone-500 hover:text-stone-900">Déconnexion</button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900">
                Se connecter
              </Link>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
