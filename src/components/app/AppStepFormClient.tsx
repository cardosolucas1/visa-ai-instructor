"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  FieldRenderer,
  collectFieldIds,
  getLocalizedText,
  type FormValues,
  type ErrorMapper,
} from "@/components/form/FieldRenderer";
import { buildZodSchema, type FormSchema } from "@/lib/schema-loader";
import { uploadFile } from "@/lib/form-client";
import { DEFAULT_LOCALE, Locale, t } from "@/lib/i18n";

type AppStepFormClientProps = {
  schemaSubset: FormSchema;
  applicationId: string;
  initialValues: Record<string, unknown>;
  nextPath: string;
  prevPath?: string;
};

export default function AppStepFormClient({
  schemaSubset,
  applicationId,
  initialValues,
  nextPath,
  prevPath = "/app",
}: AppStepFormClientProps) {
  const router = useRouter();
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const locale: Locale = DEFAULT_LOCALE;

  const zodSchema = useMemo(() => buildZodSchema(schemaSubset), [schemaSubset]);
  const allFields = useMemo(
    () => schemaSubset.steps.flatMap((s) => s.fields),
    [schemaSubset],
  );
  const fieldIds = useMemo(() => collectFieldIds(allFields), [allFields]);

  const defaultValues = useMemo(() => {
    const out: Record<string, unknown> = { ...initialValues };
    allFields.forEach((f) => {
      if (f.type === "repeatable" && !Array.isArray(out[f.id])) {
        out[f.id] = [];
      }
    });
    return out;
  }, [initialValues, allFields]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(zodSchema),
    defaultValues,
    mode: "onBlur",
  });

  const values = watch();

  const mapErrorMessage: ErrorMapper = (message) => {
    if (!message) return undefined;
    if (message === "required") return t(locale, "form.required");
    if (message === "no_accents") return t(locale, "form.noAccents");
    if (message === "invalid_date") return t(locale, "form.invalidDate");
    if (message === "invalid_option") return t(locale, "form.invalidOption");
    return message;
  };

  const onFileUpload = async (file: File) => {
    const response = await uploadFile(file);
    return response as { ok?: boolean; fileId?: string };
  };

  const onSubmit = async () => {
    const valid = await trigger(fieldIds as (keyof FormValues)[]);
    if (!valid) return;

    const stepValues = getValues();
    const merged = { ...initialValues, ...stepValues };

    const response = await fetch(`/api/applications/${applicationId}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });

    if (!response.ok) {
      router.push(`${window.location.pathname}?error=save_failed`);
      return;
    }
    router.push(nextPath);
  };

  return (
    <form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      {schemaSubset.steps.map((step) => (
        <section key={step.id} className="space-y-4">
          <h2 className="text-base font-semibold text-zinc-800">
            {getLocalizedText(step.title, locale)}
          </h2>
          <div className="flex flex-col gap-4">
            {step.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                locale={locale}
                values={values as FormValues}
                register={register}
                setValue={setValue}
                control={control}
                error={errors[field.id] as { message?: string } | undefined}
                uploadingField={uploadingField}
                setUploadingField={setUploadingField}
                mapErrorMessage={mapErrorMessage}
                onFileUpload={onFileUpload}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="mt-2 flex flex-wrap gap-3">
        <Link
          href={prevPath}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700"
        >
          Voltar
        </Link>
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
