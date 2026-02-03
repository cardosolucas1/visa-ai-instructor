import type { Metadata } from "next";
import Link from "next/link";

import LogoutForm from "@/components/auth/logout-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Visa AI Instructor",
  description: "Pré-check de consistência e completude para visto B1/B2.",
};

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(data.user);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white">
              VA
            </span>
            <span className="text-sm font-semibold text-zinc-900">
              Visa AI Instructor
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-600">
            <Link href="#como-funciona" className="hover:text-zinc-900">
              Como funciona
            </Link>
            <Link href="#precos" className="hover:text-zinc-900">
              Preços
            </Link>
            <Link href="#faq" className="hover:text-zinc-900">
              FAQ
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/app" className="hover:text-zinc-900">
                  Ir para app
                </Link>
                <LogoutForm
                  label="Sair"
                  className="text-sm font-semibold text-zinc-700 hover:text-zinc-900"
                />
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 hover:border-zinc-400"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Visa AI Instructor</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-zinc-900">
              Privacidade
            </Link>
            <Link href="/terms" className="hover:text-zinc-900">
              Termos
            </Link>
            <Link href="/disclaimer" className="hover:text-zinc-900">
              Disclaimer
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
