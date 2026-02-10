"use client";

import type { Control, FieldValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import TextInput from "@/components/fields/TextInput";
import Select from "@/components/fields/Select";
import RadioGroup from "@/components/fields/RadioGroup";
import DatePicker from "@/components/fields/DatePicker";
import FileUpload from "@/components/fields/FileUpload";
import type { FieldSchema, LocalizedText } from "@/lib/schema-loader";
import { DEFAULT_LOCALE, Locale, t } from "@/lib/i18n";

export type FormValues = Record<string, unknown>;

export type ErrorMapper = (message?: string) => string | undefined;

export const getLocalizedText = (
  value: LocalizedText | undefined,
  locale: Locale,
): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? value["pt-BR"] ?? "";
};

export function collectFieldIds(fields: FieldSchema[]): string[] {
  return fields.map((f) => f.id);
}

type FieldRendererProps = {
  field: FieldSchema;
  locale: Locale;
  values: FormValues;
  register: UseFormRegister<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  control: Control<FieldValues>;
  error?: { message?: string };
  uploadingField: string | null;
  setUploadingField: (id: string | null) => void;
  mapErrorMessage: ErrorMapper;
  onFileUpload?: (file: File) => Promise<{ ok?: boolean; fileId?: string }>;
};

export function FieldRenderer({
  field,
  locale,
  values,
  register,
  setValue,
  control,
  error,
  uploadingField,
  setUploadingField,
  mapErrorMessage,
  onFileUpload,
}: FieldRendererProps) {
  const shouldShow =
    !field.conditions ||
    field.conditions.every(
      (condition) => values[condition.fieldId] === condition.equals,
    );

  if (!shouldShow) return null;

  const label = getLocalizedText(field.label, locale);
  const helper = field.helpText
    ? getLocalizedText(field.helpText, locale)
    : undefined;
  const errorMessage = mapErrorMessage(error?.message);

  if (field.type === "select") {
    const options =
      field.options?.map((option) => ({
        value: option.value,
        label: getLocalizedText(option.label, locale),
      })) ?? [];
    return (
      <Select
        id={field.id}
        label={label}
        options={options}
        placeholder={t(locale, "form.selectPlaceholder")}
        helper={helper}
        error={errorMessage}
        register={register(field.id)}
        required={field.required}
      />
    );
  }

  if (field.type === "radio") {
    const options =
      field.options?.map((option) => ({
        value: option.value,
        label: getLocalizedText(option.label, locale),
      })) ?? [];
    return (
      <RadioGroup
        id={field.id}
        label={label}
        options={options}
        helper={helper}
        error={errorMessage}
        register={register(field.id)}
        required={field.required}
      />
    );
  }

  if (field.type === "date") {
    return (
      <DatePicker
        id={field.id}
        label={label}
        helper={helper}
        error={errorMessage}
        register={register(field.id)}
        required={field.required}
      />
    );
  }

  if (field.type === "file" && onFileUpload) {
    const value = values[field.id] as string | undefined;
    return (
      <FileUpload
        id={field.id}
        label={label}
        helper={helper}
        error={errorMessage}
        required={field.required}
        uploading={uploadingField === field.id}
        value={value}
        onUpload={async (file) => {
          setUploadingField(field.id);
          const response = await onFileUpload(file);
          if (response?.ok && response?.fileId) {
            setValue(field.id, response.fileId);
          }
          setUploadingField(null);
        }}
      />
    );
  }

  if (field.type === "repeatable" && field.fields) {
    return (
      <RepeatableField
        field={field}
        locale={locale}
        values={values}
        control={control}
        register={register}
        error={error}
        mapErrorMessage={mapErrorMessage}
      />
    );
  }

  return (
    <TextInput
      id={field.id}
      label={label}
      helper={helper}
      error={errorMessage}
      register={register(field.id)}
      required={field.required}
    />
  );
}

type RepeatableFieldProps = {
  field: FieldSchema;
  locale: Locale;
  values: FormValues;
  control: FieldRendererProps["control"];
  register: FieldRendererProps["register"];
  error?: FieldRendererProps["error"];
  mapErrorMessage: ErrorMapper;
};

function RepeatableField({
  field,
  locale,
  values,
  control,
  register,
  error,
  mapErrorMessage,
}: RepeatableFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: field.id,
  });

  const renderNestedField = (
    nestedField: FieldSchema,
    index: number,
    nestedError?: string,
  ) => {
    const entryValues = (values[field.id] as Record<string, unknown>[])?.[
      index
    ] ?? {};
    const showNested =
      !nestedField.conditions ||
      nestedField.conditions.every(
        (condition) => entryValues[condition.fieldId] === condition.equals,
      );
    if (!showNested) return null;

    const nestedRegister = register(
      `${field.id}.${index}.${nestedField.id}` as const,
    );
    const label = getLocalizedText(nestedField.label, locale);
    const helper = nestedField.helpText
      ? getLocalizedText(nestedField.helpText, locale)
      : undefined;
    const nestedErrorMessage = mapErrorMessage(nestedError);

    if (nestedField.type === "select") {
      const options =
        nestedField.options?.map((option) => ({
          value: option.value,
          label: getLocalizedText(option.label, locale),
        })) ?? [];
      return (
        <Select
          key={`${field.id}.${nestedField.id}.${index}`}
          id={`${field.id}.${nestedField.id}.${index}`}
          label={label}
          options={options}
          placeholder={t(locale, "form.selectPlaceholder")}
          register={nestedRegister}
          required={nestedField.required}
          error={nestedErrorMessage}
          helper={helper}
        />
      );
    }

    if (nestedField.type === "radio") {
      const options =
        nestedField.options?.map((option) => ({
          value: option.value,
          label: getLocalizedText(option.label, locale),
        })) ?? [];
      return (
        <RadioGroup
          key={`${field.id}.${nestedField.id}.${index}`}
          id={`${field.id}.${nestedField.id}.${index}`}
          label={label}
          options={options}
          register={nestedRegister}
          required={nestedField.required}
          error={nestedErrorMessage}
          helper={helper}
        />
      );
    }

    if (nestedField.type === "date") {
      return (
        <DatePicker
          key={`${field.id}.${nestedField.id}.${index}`}
          id={`${field.id}.${nestedField.id}.${index}`}
          label={label}
          register={nestedRegister}
          required={nestedField.required}
          error={nestedErrorMessage}
          helper={helper}
        />
      );
    }

    return (
      <TextInput
        key={`${field.id}.${nestedField.id}.${index}`}
        id={`${field.id}.${nestedField.id}.${index}`}
        label={label}
        register={nestedRegister}
        required={nestedField.required}
        error={nestedErrorMessage}
        helper={helper}
      />
    );
  };

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-800">
          {getLocalizedText(field.label, locale)}
        </h3>
        <button
          type="button"
          onClick={() => append({})}
          className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700"
        >
          Adicionar
        </button>
      </div>
      {fields.length === 0 ? (
        <p className="text-xs text-zinc-500">Nenhum item adicionado.</p>
      ) : null}
      {fields.map((item, index) => (
        <div
          key={item.id}
          className="space-y-3 rounded-lg border border-zinc-100 p-3"
        >
          {field.fields?.map((nestedField) => {
            const nestedError = (error as { [index: number]: { [key: string]: { message?: string } } })?.[index]?.[nestedField.id]?.message;
            return renderNestedField(nestedField, index, nestedError);
          })}
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-xs text-red-600"
          >
            Remover
          </button>
        </div>
      ))}
      {error?.message ? (
        <p className="text-xs text-red-600">{mapErrorMessage(error.message)}</p>
      ) : null}
    </div>
  );
}
