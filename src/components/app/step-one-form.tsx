"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    fullName: z.string().trim().optional(),
    birthDate: z.string().min(1, "Informe sua data de nascimento."),
    nationality: z.string().min(1, "Informe sua nacionalidade."),
    passportCountry: z.string().min(1, "Informe o país de emissão."),
    passportExpiry: z.string().min(1, "Informe a data de expiração."),
  })
  .refine(
    (values) => {
      const expiry = new Date(values.passportExpiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !Number.isNaN(expiry.getTime()) && expiry > today;
    },
    {
      message: "A expiração precisa ser posterior a hoje.",
      path: ["passportExpiry"],
    },
  );

type FormValues = z.infer<typeof schema>;

type StepOneFormProps = {
  initialValues: Partial<FormValues>;
  applicationId: string;
  nextPath: string;
};

export default function StepOneForm({
  initialValues,
  applicationId,
  nextPath,
}: StepOneFormProps) {
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
      fullName: initialValues.fullName ?? "",
      birthDate: initialValues.birthDate ?? "",
      nationality: initialValues.nationality ?? "",
      passportCountry: initialValues.passportCountry ?? "",
      passportExpiry: initialValues.passportExpiry ?? "",
    },
  });

  const storageKey = useMemo(
    () => `visa-ai:step-1:${applicationId}`,
    [applicationId],
  );
  const pendingKey = useMemo(
    () => `visa-ai:step-1:pending:${applicationId}`,
    [applicationId],
  );
  const lastSavedKey = useMemo(
    () => `visa-ai:step-1:last-saved:${applicationId}`,
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
        fullName: parsed.fullName ?? initialValues.fullName ?? "",
        birthDate: parsed.birthDate ?? initialValues.birthDate ?? "",
        nationality: parsed.nationality ?? initialValues.nationality ?? "",
        passportCountry:
          parsed.passportCountry ?? initialValues.passportCountry ?? "",
        passportExpiry:
          parsed.passportExpiry ?? initialValues.passportExpiry ?? "",
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
        <label className="text-sm font-medium text-zinc-700" htmlFor="fullName">
          Nome completo (opcional)
        </label>
        <input
          id="fullName"
          type="text"
          className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          placeholder="Seu nome completo"
          {...register("fullName")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-zinc-700"
            htmlFor="birthDate"
          >
            Data de nascimento
          </label>
          <input
            id="birthDate"
            type="date"
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            {...register("birthDate")}
          />
          {errors.birthDate ? (
            <p className="text-xs text-red-600">{errors.birthDate.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-zinc-700"
            htmlFor="nationality"
          >
            Nacionalidade
          </label>
          <input
            id="nationality"
            type="text"
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Ex.: brasileira"
            {...register("nationality")}
          />
          {errors.nationality ? (
            <p className="text-xs text-red-600">{errors.nationality.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-zinc-700"
            htmlFor="passportCountry"
          >
            País de emissão do passaporte
          </label>
          <input
            id="passportCountry"
            type="text"
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Ex.: Brasil"
            {...register("passportCountry")}
          />
          {errors.passportCountry ? (
            <p className="text-xs text-red-600">
              {errors.passportCountry.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-zinc-700"
            htmlFor="passportExpiry"
          >
            Data de expiração do passaporte
          </label>
          <input
            id="passportExpiry"
            type="date"
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            {...register("passportExpiry")}
          />
          {errors.passportExpiry ? (
            <p className="text-xs text-red-600">
              {errors.passportExpiry.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push("/app")}
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
