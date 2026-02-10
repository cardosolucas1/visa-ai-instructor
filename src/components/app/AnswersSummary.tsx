import React from "react";
import type {
  FormSchema,
  StepSchema,
  FieldSchema,
  LocalizedText,
} from "@/lib/schema-loader";

const LOCALE: "pt-BR" | "en" = "pt-BR";

function getLabel(value: LocalizedText | undefined): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[LOCALE] ?? value["pt-BR"] ?? "";
}

function formatValue(
  field: FieldSchema,
  value: unknown,
  options?: { value: string; label: LocalizedText }[],
): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "string" && field.type === "date" && value) {
    try {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString("pt-BR");
      }
    } catch {
      // fallback to raw
    }
  }
  if (field.type === "select" || field.type === "radio") {
    const opt = options?.find((o) => o.value === value);
    if (opt) return getLabel(opt.label);
  }
  if (field.type === "file") return value ? "Documento anexado" : "—";
  if (typeof value === "object" && !Array.isArray(value)) return "—";
  return String(value);
}

function renderFieldValue(
  field: FieldSchema,
  data: Record<string, unknown>,
  stepData?: Record<string, unknown>,
): string | React.ReactNode {
  const value = stepData?.[field.id] ?? data[field.id];

  if (field.type === "repeatable" && field.fields && Array.isArray(value)) {
    const nestedFields = field.fields;
    if (value.length === 0) return null;
    return (
      <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-zinc-600">
        {value.map((item: Record<string, unknown>, index: number) => (
          <li key={index} className="space-y-0.5">
            <span className="font-medium text-zinc-500">
              Item {index + 1}:
            </span>
            <ul className="ml-3 mt-0.5 list-none space-y-0.5 text-sm text-zinc-600">
              {nestedFields.map((nested) => {
                const v = item[nested.id];
                const label = getLabel(nested.label);
                const formatted = formatValue(
                  nested,
                  v,
                  nested.options,
                );
                if (formatted === "—") return null;
                return (
                  <li key={nested.id}>
                    <span className="text-zinc-500">{label}:</span>{" "}
                    {formatted}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    );
  }

  const formatted = formatValue(field, value, field.options);
  if (formatted === "—") return "—";
  return formatted;
}

function shouldShowField(
  field: FieldSchema,
  data: Record<string, unknown>,
  stepData?: Record<string, unknown>,
): boolean {
  if (!field.conditions?.length) return true;
  return field.conditions.every((c) => {
    const v = stepData?.[c.fieldId] ?? data[c.fieldId];
    return v === c.equals;
  });
}

type AnswersSummaryProps = {
  schema: FormSchema;
  data: Record<string, unknown>;
};

export default function AnswersSummary({ schema, data }: AnswersSummaryProps) {
  return (
    <div className="space-y-8">
      {schema.steps.map((step: StepSchema) => {
        const stepFields = step.fields.filter((f) =>
          shouldShowField(f, data),
        );
        if (stepFields.length === 0) return null;

        return (
          <section key={step.id} className="border-b border-zinc-100 pb-6 last:border-0">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {getLabel(step.title)}
            </h3>
            <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-[auto_1fr]">
              {stepFields.map((field) => {
                const label = getLabel(field.label);
                const valueNode = renderFieldValue(field, data);
                if (valueNode == null || valueNode === "—") return null;
                return (
                  <div key={field.id} className="contents">
                    <dt className="text-sm font-medium text-zinc-700">
                      {label}
                    </dt>
                    <dd className="text-sm text-zinc-600">
                      {valueNode}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
