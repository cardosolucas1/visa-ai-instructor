"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  FieldRenderer,
  getLocalizedText,
  collectFieldIds,
  type FormValues,
  type ErrorMapper,
} from "@/components/form/FieldRenderer";
import Stepper from "@/components/form/Stepper";
import SaveDraftButton from "@/components/SaveDraftButton";
import { buildZodSchema, FormSchema } from "@/lib/schema-loader";
import { loadDraft, saveDraft, submitForm, uploadFile } from "@/lib/form-client";
import { DEFAULT_LOCALE, Locale, t } from "@/lib/i18n";

type FormWizardClientProps = {
  applicationId: string;
  schema: FormSchema;
};

const LOCAL_STORAGE_PREFIX = "ds160-draft";

export default function FormWizardClient({
  applicationId,
  schema,
}: FormWizardClientProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  const zodSchema = useMemo(() => buildZodSchema(schema), [schema]);
  const mapErrorMessage: ErrorMapper = (message) => {
    if (!message) return undefined;
    if (message === "required") return t(locale, "form.required");
    if (message === "no_accents") return t(locale, "form.noAccents");
    if (message === "invalid_date") return t(locale, "form.invalidDate");
    if (message === "invalid_option") return t(locale, "form.invalidOption");
    return message;
  };
  const steps = schema.steps.map((step) => ({
    id: step.id,
    title: getLocalizedText(step.title, locale),
  }));

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    setValue,
    watch,
    trigger,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(zodSchema),
    mode: "onBlur",
  });

  const values = watch();

  useEffect(() => {
    const storedLocale = localStorage.getItem("ds160-locale") as Locale | null;
    if (storedLocale) {
      setLocale(storedLocale);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ds160-locale", locale);
  }, [locale]);

  useEffect(() => {
    const storageKey = `${LOCAL_STORAGE_PREFIX}:${applicationId}`;
    const localDraft = localStorage.getItem(storageKey);
    if (localDraft) {
      reset(JSON.parse(localDraft));
    }
  }, [applicationId, reset]);

  useEffect(() => {
    const storageKey = `${LOCAL_STORAGE_PREFIX}:${applicationId}`;
    const timeout = window.setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(values));
      const now = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastSavedAt(now);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [values, applicationId]);

  const stepFields = schema.steps[currentStep]?.fields ?? [];

  const handleNext = async () => {
    const fieldIds = collectFieldIds(stepFields);
    const valid = await trigger(fieldIds as any);
    if (!valid) {
      const firstError = fieldIds.find((id) => errors[id]);
      if (firstError) {
        setFocus(firstError as any);
      }
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSaveDraft = async () => {
    setSaving(true);
    setServerMessage(null);
    const data = getValues();
    const response = await saveDraft({
      applicationId,
      data,
      securityQuestion: data.security_question as string | undefined,
      securityAnswer: data.security_answer as string | undefined,
    });
    if (response.ok) {
      const formatted = response.updatedAt
        ? new Date(response.updatedAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      setServerMessage(t(locale, "stepper.savedAt", { time: formatted }));
    }
    setSaving(false);
  };

  const handleLoadDraft = async (securityAnswer: string) => {
    setServerMessage(null);
    const response = await loadDraft({ applicationId, securityAnswer });
    if (response.ok) {
      reset(response.data);
      setServerMessage(t(locale, "draft.loaded"));
    }
  };

  const onSubmit = async (data: FormValues) => {
    const response = await submitForm({ applicationId, data });
    if (response.ok) {
      window.location.href = `/form/${response.confirmation_number}/confirmation`;
      return;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900">
          {getLocalizedText(schema.title, locale)}
        </h1>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setLocale("pt-BR")}
            className={`rounded-full px-3 py-1 ${
              locale === "pt-BR" ? "bg-zinc-900 text-white" : "bg-zinc-100"
            }`}
          >
            PT-BR
          </button>
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`rounded-full px-3 py-1 ${
              locale === "en" ? "bg-zinc-900 text-white" : "bg-zinc-100"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      <Stepper steps={steps} currentStep={currentStep} />

      <DraftPanel
        locale={locale}
        onLoad={handleLoadDraft}
        message={serverMessage}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-6">
          {stepFields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              locale={locale}
              values={values as FormValues}
              register={register}
              setValue={setValue}
              control={control}
              error={errors[field.id]}
              uploadingField={uploadingField}
              setUploadingField={setUploadingField}
              mapErrorMessage={mapErrorMessage}
              onFileUpload={async (file) => {
                const r = await uploadFile(file);
                return r as { ok?: boolean; fileId?: string };
              }}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <SaveDraftButton
            onSave={handleSaveDraft}
            saving={saving}
            label={t(locale, "stepper.saveDraft")}
            savingLabel={t(locale, "stepper.saving")}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-60"
            >
              {t(locale, "stepper.back")}
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
              >
                {t(locale, "stepper.next")}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
              >
                {isSubmitting ? t(locale, "stepper.saving") : t(locale, "stepper.submit")}
              </button>
            )}
          </div>
        </div>
        {lastSavedAt ? (
          <p className="text-xs text-zinc-500">{t(locale, "stepper.savedAt", { time: lastSavedAt })}</p>
        ) : null}
      </form>
    </div>
  );
}

type DraftPanelProps = {
  locale: Locale;
  onLoad: (answer: string) => Promise<void>;
  message: string | null;
};

function DraftPanel({ locale, onLoad, message }: DraftPanelProps) {
  const [answer, setAnswer] = useState("");
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
      <p className="font-semibold text-zinc-800">{t(locale, "draft.title")}</p>
      <p className="mt-1 text-xs text-zinc-500">{t(locale, "draft.description")}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder={t(locale, "draft.securityAnswer")}
          className="h-10 flex-1 rounded-lg border border-zinc-300 px-3 text-xs"
        />
        <button
          type="button"
          onClick={() => onLoad(answer)}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
        >
          {t(locale, "draft.load")}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
    </div>
  );
}
