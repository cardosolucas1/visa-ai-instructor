"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  occupation: z.string().min(1, "Informe sua ocupação."),
  employed: z.enum(["yes", "no"], {
    message: "Selecione se está empregado.",
  }),
  incomeRange: z
    .number()
    .min(0, "O valor deve ser positivo.")
    .max(50000, "Use até 50.000 no MVP."),
  hasTies: z.enum(["yes", "no"], {
    message: "Selecione se possui vínculo no país de residência.",
  }),
  observations: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

type StepThreeFormProps = {
  initialValues: Partial<FormValues>;
  applicationId: string;
  nextPath: string;
};

export default function StepThreeForm({
  initialValues,
  applicationId,
  nextPath,
}: StepThreeFormProps) {
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
      occupation: initialValues.occupation ?? "",
      employed: initialValues.employed ?? "yes",
      incomeRange: initialValues.incomeRange ?? 0,
      hasTies: initialValues.hasTies ?? "yes",
      observations: initialValues.observations ?? "",
    },
  });

  const storageKey = useMemo(
    () => `visa-ai:step-3:${applicationId}`,
    [applicationId],
  );
  const pendingKey = useMemo(
    () => `visa-ai:step-3:pending:${applicationId}`,
    [applicationId],
  );
  const lastSavedKey = useMemo(
    () => `visa-ai:step-3:last-saved:${applicationId}`,
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
        occupation: parsed.occupation ?? initialValues.occupation ?? "",
        employed: parsed.employed ?? initialValues.employed ?? "yes",
        incomeRange: parsed.incomeRange ?? initialValues.incomeRange ?? 0,
        hasTies: parsed.hasTies ?? initialValues.hasTies ?? "yes",
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
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="occupation">
          Ocupação
        </label>
        <input
          id="occupation"
          type="text"
          className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          placeholder="Ex.: analista, estudante, empresário"
          {...register("occupation")}
        />
        {errors.occupation ? (
          <p className="text-xs text-red-600">{errors.occupation.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700" htmlFor="employed">
            Empregado?
          </label>
          <select
            id="employed"
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            {...register("employed")}
          >
            <option value="yes">Sim</option>
            <option value="no">Não</option>
          </select>
          {errors.employed ? (
            <p className="text-xs text-red-600">{errors.employed.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700" htmlFor="hasTies">
            Possui vínculo no Brasil/país de residência?
          </label>
          <select
            id="hasTies"
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            {...register("hasTies")}
          >
            <option value="yes">Sim</option>
            <option value="no">Não</option>
          </select>
          {errors.hasTies ? (
            <p className="text-xs text-red-600">{errors.hasTies.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-zinc-700"
          htmlFor="incomeRange"
        >
          Renda mensal aproximada (0 = não informar)
        </label>
        <input
          id="incomeRange"
          type="range"
          min={0}
          max={50000}
          step={500}
          className="w-full"
          {...register("incomeRange", { valueAsNumber: true })}
        />
        <p className="text-xs text-zinc-500">
          Valor selecionado: {watch("incomeRange") ?? 0}
        </p>
        {errors.incomeRange ? (
          <p className="text-xs text-red-600">{errors.incomeRange.message}</p>
        ) : null}
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
          placeholder="Ex.: detalhes sobre ocupação ou renda"
          {...register("observations")}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push(`/app/a/${applicationId}/step-2`)}
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
