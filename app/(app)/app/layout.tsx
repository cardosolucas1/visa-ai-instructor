import Link from "next/link";
import { redirect } from "next/navigation";

import LogoutForm from "@/components/auth/logout-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(data.user);

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-zinc-900">Visa AI App</p>
          <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <Link href="/app" className="hover:text-zinc-900">
              Dashboard
            </Link>
            <Link href="/app/new" className="hover:text-zinc-900">
              Nova análise
            </Link>
            <Link href="/app/account" className="hover:text-zinc-900">
              Conta
            </Link>
            <LogoutForm
              label="Sair"
              className="text-sm font-semibold text-zinc-700 hover:text-zinc-900"
            />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
