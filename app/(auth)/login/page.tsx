import Link from "next/link";

import LoginForm from "@/components/auth/login-form";
import { getPublicEnv, getServerEnv } from "@/lib/env";

export default function LoginPage() {
  const { APP_BASE_URL } = getServerEnv();
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10">
        <Link href="/" className="text-sm font-semibold text-zinc-700">
          ← Voltar
        </Link>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-zinc-900">Entrar</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Receba um link mágico para acessar sua conta com segurança.
          </p>
          <div className="mt-6">
            <LoginForm
              redirectTo={APP_BASE_URL}
              supabaseUrl={NEXT_PUBLIC_SUPABASE_URL}
              supabaseAnonKey={NEXT_PUBLIC_SUPABASE_ANON_KEY}
            />
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          Não compartilhamos seu e-mail e nunca pedimos senha.
        </p>
      </div>
    </div>
  );
}
