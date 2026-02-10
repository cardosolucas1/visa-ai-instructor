import ptBR from "@/i18n/pt-BR.json";
import en from "@/i18n/en.json";

export type Locale = "pt-BR" | "en";

export const DEFAULT_LOCALE: Locale = "pt-BR";

const dictionaries: Record<Locale, Record<string, unknown>> = {
  "pt-BR": ptBR,
  en,
};

export const getDictionary = (locale: Locale) =>
  dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];

export const getNestedValue = (
  dict: Record<string, unknown>,
  path: string,
) => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, dict);
};

export const t = (locale: Locale, key: string, vars?: Record<string, string>) => {
  const dict = getDictionary(locale);
  const value = getNestedValue(dict, key);
  if (typeof value !== "string") return key;
  if (!vars) return value;
  return Object.entries(vars).reduce(
    (text, [varKey, varValue]) => text.replace(`{${varKey}}`, varValue),
    value,
  );
};
