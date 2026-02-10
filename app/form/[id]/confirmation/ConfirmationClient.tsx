"use client";

import { useMemo, useState } from "react";

import ConfirmationCard from "@/components/ConfirmationCard";
import { Locale, t } from "@/lib/i18n";

type ConfirmationClientProps = {
  confirmationNumber: string;
  data: Record<string, unknown>;
  locale: Locale;
};

type FlattenedField = {
  key: string;
  value: string;
};

const flattenData = (data: Record<string, unknown>) => {
  const result: FlattenedField[] = [];
  const walk = (obj: Record<string, unknown>, prefix = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === "object" && item) {
            walk(item as Record<string, unknown>, `${currentKey}[${index + 1}]`);
          } else {
            result.push({ key: `${currentKey}[${index + 1}]`, value: String(item) });
          }
        });
        return;
      }
      if (typeof value === "object" && value) {
        walk(value as Record<string, unknown>, currentKey);
        return;
      }
      result.push({ key: currentKey, value: String(value ?? "") });
    });
  };
  walk(data);
  return result;
};

export default function ConfirmationClient({
  confirmationNumber,
  data,
  locale,
}: ConfirmationClientProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fields = useMemo(() => flattenData(data), [data]);

  const handleCopy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-6">
      <ConfirmationCard
        confirmationNumber={confirmationNumber}
        title={t(locale, "confirmation.title")}
        subtitle={t(locale, "confirmation.subtitle")}
        copyLabel={t(locale, "confirmation.copy")}
        copiedLabel={t(locale, "confirmation.copied")}
      />

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900">Resumo</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Clique em um campo para copiar o valor.
        </p>
        <div className="mt-4 grid gap-2">
          {fields.map((field) => (
            <button
              key={field.key}
              type="button"
              onClick={() => handleCopy(field.value, field.key)}
              className="flex flex-col rounded-lg border border-zinc-100 px-3 py-2 text-left text-xs hover:bg-zinc-50"
            >
              <span className="text-zinc-500">{field.key}</span>
              <span className="font-medium text-zinc-900">
                {field.value || "-"}
              </span>
              {copiedKey === field.key ? (
                <span className="text-emerald-600">Copiado</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
