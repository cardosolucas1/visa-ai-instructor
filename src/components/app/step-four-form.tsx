"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    visitedUsa: z.enum(["yes", "no"], {
      message: "Selecione se já esteve nos EUA.",
    }),
    lastVisitYear: z.string().trim().optional(),
    visaDenied: z.enum(["yes", "no"], {
      message: "Selecione se já teve visto negado.",
    }),
    overstayDeportation: z.enum(["yes", "no"], {
      message: "Selecione se já teve overstay/deportação.",
    }),
    traveledLast5Years: z.enum(["yes", "no"]).optional(),
    observations: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.visitedUsa === "yes") {
      if (!values.lastVisitYear || values.lastVisitYear.length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lastVisitYear"],
          message: "Informe o ano da última visita.",
        });
        return;
      }
      const year = Number(values.lastVisitYear);
      const currentYear = new Date().getFullYear();
      if (Number.isNaN(year) || year < 1900 || year > currentYear) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lastVisitYear"],
          message: "Informe um ano válido.",
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

type StepFourFormProps = {
  initialValues: Partial<FormValues>;
  applicationId: string;
  nextPath: string;
};

export default function StepFourForm({
  initialValues,
  applicationId,
  nextPath,
}: StepFourFormProps) {
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
      visitedUsa: initialValues.visitedUsa ?? "no",
      lastVisitYear: initialValues.lastVisitYear ?? "",
      visaDenied: initialValues.visaDenied ?? "no",
      overstayDeportation: initialValues.overstayDeportation ?? "no",
      traveledLast5Years: initialValues.traveledLast5Years ?? "no",
      observations: initialValues.observations ?? "",
    },
  });

  const storageKey = useMemo(
    () => `visa-ai:step-4:${applicationId}`,
    [applicationId],
  );
  const pendingKey = useMemo(
    () => `visa-ai:step-4:pending:${applicationId}`,
    [applicationId],
  );
  const lastSavedKey = useMemo(
    () => `visa-ai:step-4:last-saved:${applicationId}`,
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
        visitedUsa: parsed.visitedUsa ?? initialValues.visitedUsa ?? "no",
        lastVisitYear: parsed.lastVisitYear ?? initialValues.lastVisitYear ?? "",
        visaDenied: parsed.visaDenied ?? initialValues.visaDenied ?? "no",
        overstayDeportation:
          parsed.overstayDeportation ??
          initialValues.overstayDeportation ??
          "no",
        traveledLast5Years:
          parsed.traveledLast5Years ??
          initialValues.traveledLast5Years ??
          "no",
        observations: parsed.observations ?? initialValues.observations ?? "",
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

  const visitedUsaValue = watch("visitedUsa");

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
          <label className="text-sm font-medium text-zinc-700" htmlFor="visitedUsa">
            Já esteve nos EUA?
          </label>
          <select
            id="visitedUsa"
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            {...register("visitedUsa")}
          >
            <option value="no">Não</option>
            <option value="yes">Sim</option>
          </select>
          {errors.visitedUsa ? (
            <p className="text-xs text-red-600">{errors.visitedUsa.message}</p>
          ) : null}
        </div>

        {visitedUsaValue === "yes" ? (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="lastVisitYear">
              Ano da última visita
            </label>
            <input
              id="lastVisitYear"
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              {...register("lastVisitYear")}
            />
            {errors.lastVisitYear ? (
              <p className="text-xs text-red-600">
                {errors.lastVisitYear.message}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700" htmlFor="visaDenied">
            Já teve visto dos EUA negado?
          </label>
          <select
            id="visaDenied"
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            {...register("visaDenied")}
          >
            <option value="no">Não</option>
            <option value="yes">Sim</option>
          </select>
          {errors.visaDenied ? (
            <p className="text-xs text-red-600">{errors.visaDenied.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-zinc-700"
            htmlFor="overstayDeportation"
          >
            Já teve overstay/deportação?
          </label>
          <select
            id="overstayDeportation"
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            {...register("overstayDeportation")}
          >
            <option value="no">Não</option>
            <option value="yes">Sim</option>
          </select>
          {errors.overstayDeportation ? (
            <p className="text-xs text-red-600">
              {errors.overstayDeportation.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-zinc-700"
          htmlFor="traveledLast5Years"
        >
          Já viajou internacionalmente nos últimos 5 anos?
        </label>
        <select
          id="traveledLast5Years"
          className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          {...register("traveledLast5Years")}
        >
          <option value="no">Não</option>
          <option value="yes">Sim</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-zinc-700"
          htmlFor="observations"
        >
          Observações (opcional)
        </label>
        <textarea
          id="observations"
          rows={4}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          placeholder="Ex.: informações adicionais relevantes"
          {...register("observations")}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push(`/app/a/${applicationId}/step-3`)}
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
