"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginFormProps = {
  redirectTo: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export default function LoginForm({
  redirectTo,
  supabaseUrl,
  supabaseAnonKey,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Informe um e-mail válido.");
      return;
    }

    setStatus("loading");
    const supabase = createSupabaseBrowserClient({
      supabaseUrl,
      supabaseAnonKey,
    });
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectTo}/auth/callback?next=/app`,
      },
    });

    if (signInError) {
      setStatus("idle");
      setError(
        `Não foi possível enviar o link: ${signInError.message}. Verifique se o provedor de e-mail do Supabase está configurado.`,
      );
      return;
    }

    setStatus("sent");
  };

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          autoComplete="email"
          required
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      {status === "sent" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          Enviamos um link mágico para seu e-mail.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Enviando..." : "Enviar link mágico"}
      </button>
    </form>
  );
}
