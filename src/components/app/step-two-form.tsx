"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    arrivalDate: z.string().min(1, "Informe a data prevista de chegada."),
    durationDays: z
      .number({
        message: "Informe a duração em dias.",
      })
      .int("Informe um número inteiro.")
      .min(1, "A duração mínima é 1 dia.")
      .max(180, "A duração máxima é 180 dias."),
    cities: z.string().trim().optional(),
    lodgingAddress: z.string().trim().optional(),
    tripPayer: z.enum(["self", "family", "company", "other"], {
      message: "Selecione quem paga a viagem.",
    }),
  })
  .refine(
    (values) => {
      const arrival = new Date(values.arrivalDate);
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return !Number.isNaN(arrival.getTime()) && arrival >= tomorrow;
    },
    {
      message: "A chegada deve ser a partir de amanhã.",
      path: ["arrivalDate"],
    },
  );

type FormValues = z.infer<typeof schema>;

type StepTwoFormProps = {
  initialValues: Partial<FormValues>;
  applicationId: string;
  nextPath: string;
};

export default function StepTwoForm({
  initialValues,
  applicationId,
  nextPath,
}: StepTwoFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      arrivalDate: initialValues.arrivalDate ?? "",
      durationDays: initialValues.durationDays ?? 1,
      cities: initialValues.cities ?? "",
      lodgingAddress: initialValues.lodgingAddress ?? "",
      tripPayer: initialValues.tripPayer ?? "self",
    },
  });

  const storageKey = useMemo(
    () => `visa-ai:step-2:${applicationId}`,
    [applicationId],
  );
  const pendingKey = useMemo(
    () => `visa-ai:step-2:pending:${applicationId}`,
    [applicationId],
  );
  const lastSavedKey = useMemo(
    () => `visa-ai:step-2:last-saved:${applicationId}`,
    [applicationId],
  );

  const serialize = (values: FormValues) => JSON.stringify(values);

  const saveInBackground = async (values: FormValues) => {
    try {
      const response = await fetch(
        `/api/applications/${applicationId}/answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );

      if (response.ok) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(pendingKey);
          window.localStorage.setItem(lastSavedKey, serialize(values));
        }
        return;
      }
    } catch {
      // Intencionalmente silencioso para retry.
    }
  };

  useEffect(() => {
    router.prefetch(nextPath);
  }, [nextPath, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cached = window.localStorage.getItem(storageKey);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as Partial<FormValues>;
      reset({
        arrivalDate: parsed.arrivalDate ?? initialValues.arrivalDate ?? "",
        durationDays: parsed.durationDays ?? initialValues.durationDays ?? 1,
        cities: parsed.cities ?? initialValues.cities ?? "",
        lodgingAddress:
          parsed.lodgingAddress ?? initialValues.lodgingAddress ?? "",
        tripPayer: parsed.tripPayer ?? initialValues.tripPayer ?? "self",
      });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [initialValues, reset, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const values = watch();
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(values));
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [storageKey, watch]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pending = window.localStorage.getItem(pendingKey);
    if (!pending) return;
    try {
      const lastSaved = window.localStorage.getItem(lastSavedKey);
      if (lastSaved === pending) {
        window.localStorage.removeItem(pendingKey);
        return;
      }
      const parsed = JSON.parse(pending) as FormValues;
      void saveInBackground(parsed);
    } catch {
      window.localStorage.removeItem(pendingKey);
    }
  }, [lastSavedKey, pendingKey]);

  return (
    <form
      className="mt-6 flex flex-col gap-4"
      onSubmit={handleSubmit((values) => {
        if (typeof window !== "undefined") {
          const serialized = serialize(values);
          window.localStorage.setItem(storageKey, serialized);
          const lastSaved = window.localStorage.getItem(lastSavedKey);
          if (lastSaved !== serialized) {
            window.localStorage.setItem(pendingKey, serialized);
            void saveInBackground(values);
          }
        }
        router.push(nextPath);
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-zinc-700"
            htmlFor="arrivalDate"
          >
            Data prevista de chegada
          </label>
          <input
            id="arrivalDate"
            type="date"
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            {...register("arrivalDate")}
          />
          {errors.arrivalDate ? (
            <p className="text-xs text-red-600">{errors.arrivalDate.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-zinc-700"
            htmlFor="durationDays"
          >
            Duração (dias)
          </label>
          <input
            id="durationDays"
            type="number"
            min={1}
            max={180}
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            {...register("durationDays", { valueAsNumber: true })}
          />
          {errors.durationDays ? (
            <p className="text-xs text-red-600">
              {errors.durationDays.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="cities">
          Cidade(s) (opcional)
        </label>
        <input
          id="cities"
          type="text"
          className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          placeholder="Ex.: Nova York, Miami"
          {...register("cities")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-zinc-700"
          htmlFor="lodgingAddress"
        >
          Endereço/hotel nos EUA (opcional)
        </label>
        <input
          id="lodgingAddress"
          type="text"
          className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          placeholder="Ex.: 123 Main St, NY"
          {...register("lodgingAddress")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="tripPayer">
          Quem paga a viagem?
        </label>
        <select
          id="tripPayer"
          className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          {...register("tripPayer")}
        >
          <option value="self">Eu mesmo</option>
          <option value="family">Família</option>
          <option value="company">Empresa</option>
          <option value="other">Outro</option>
        </select>
        {errors.tripPayer ? (
          <p className="text-xs text-red-600">{errors.tripPayer.message}</p>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push(`/app/a/${applicationId}/step-1`)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Salvando..." : "Salvar e continuar"}
        </button>
      </div>
    </form>
  );
}
