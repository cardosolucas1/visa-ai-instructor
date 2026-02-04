"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type ApiResponse = {
  ok: boolean;
  payment_url?: string;
  pix_copy?: string;
  message?: string;
};

type StatusResponse = {
  ok: boolean;
  status?: "pending" | "approved" | "failed" | "refunded";
};

export default function PayWithAbacatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [pixCopy, setPixCopy] = useState<string | null>(null);
  const [needsCustomer, setNeedsCustomer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cellphone: "",
    email: "",
    taxId: "",
  });

  const qrUrl = useMemo(() => {
    if (!paymentUrl) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      paymentUrl,
    )}`;
  }, [paymentUrl]);

  const createCharge = async (withCustomer: boolean) => {
    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/abacatepay/create-charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: params.id,
        ...(withCustomer ? { customer: form } : {}),
      }),
    });

    const data = (await response.json()) as ApiResponse;

    if (!response.ok || !data.payment_url) {
      if (response.status === 422) {
        setNeedsCustomer(true);
      }
      setError(data.message ?? "Não foi possível iniciar o pagamento.");
      setIsSubmitting(false);
      return;
    }

    setPaymentUrl(data.payment_url);
    setPixCopy(data.pix_copy ?? null);
    setNeedsCustomer(false);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (params?.id) {
      void createCharge(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  useEffect(() => {
    if (!params?.id) return;
    let attempts = 0;
    const interval = window.setInterval(async () => {
      attempts += 1;
      if (attempts > 40) {
        window.clearInterval(interval);
        return;
      }

      const response = await fetch("/api/payments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: params.id }),
      });

      const data = (await response.json()) as StatusResponse;
      if (data.status === "approved") {
        window.clearInterval(interval);
        router.push(`/app/a/${params.id}/status`);
      }
    }, 3000);

    return () => window.clearInterval(interval);
  }, [params?.id, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createCharge(true);
  };

  const handleCopy = async () => {
    const value = pixCopy ?? paymentUrl;
    if (!value) return;
    await navigator.clipboard.writeText(value);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-zinc-900">
          AbacatePay (PIX ou Cartão)
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Use o QR Code ou o link para concluir o pagamento.
        </p>
      </div>

      {paymentUrl ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="QR Code do pagamento"
                className="h-40 w-40 rounded-lg border border-zinc-200"
              />
            ) : null}
            <div className="space-y-3">
              <p className="text-sm text-zinc-600">
                Abra o checkout ou copie o código de pagamento.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Abrir checkout
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700"
                >
                  {pixCopy ? "Copiar PIX" : "Copiar link"}
                </button>
              </div>
              {pixCopy ? (
                <p className="text-xs text-zinc-500">
                  Copie e cole o PIX no app do seu banco.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {needsCustomer ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-600">
            Precisamos dos seus dados para criar o cliente no AbacatePay.
          </p>
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700" htmlFor="name">
                Nome completo
              </label>
              <input
                id="name"
                required
                className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-zinc-700"
                htmlFor="cellphone"
              >
                Celular
              </label>
              <input
                id="cellphone"
                required
                className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="(11) 90000-0000"
                value={form.cellphone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, cellphone: event.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700" htmlFor="taxId">
                CPF/CNPJ
              </label>
              <input
                id="taxId"
                required
                className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                value={form.taxId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, taxId: event.target.value }))
                }
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Gerando cobrança..." : "Continuar"}
            </button>
          </form>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Link
        href={`/app/a/${params?.id}/pay`}
        className="inline-flex text-sm font-semibold text-zinc-700 hover:text-zinc-900"
      >
        ← Voltar
      </Link>
    </div>
  );
}
