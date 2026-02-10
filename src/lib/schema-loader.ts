import { z } from "zod";

export type LocalizedText = string | { "pt-BR": string; en: string };

export type FieldCondition = {
  fieldId: string;
  equals: string;
};

export type FieldOption = {
  value: string;
  label: LocalizedText;
};

export type FieldValidation = {
  noAccents?: boolean;
  maxFileSizeMb?: number;
  allowedTypes?: string[];
};

export type FieldSchema = {
  id: string;
  type: "text" | "select" | "radio" | "date" | "file" | "repeatable";
  label: LocalizedText;
  required?: boolean;
  helpText?: LocalizedText;
  options?: FieldOption[];
  validations?: FieldValidation;
  conditions?: FieldCondition[];
  fields?: FieldSchema[];
};

export type StepSchema = {
  id: string;
  title: LocalizedText;
  fields: FieldSchema[];
};

export type FormSchema = {
  title: LocalizedText;
  steps: StepSchema[];
};

type BuildSchemaResult = {
  schema: z.ZodTypeAny;
  conditionalRequired: Array<{
    fieldId: string;
    conditions: FieldCondition[];
  }>;
};

const buildFieldSchema = (field: FieldSchema): BuildSchemaResult => {
  if (field.type === "repeatable" && field.fields) {
    const nested = buildObjectSchema(field.fields);
    const arraySchema = z.array(nested.schema);
    return {
      schema: field.required ? arraySchema.min(1) : arraySchema.optional(),
      conditionalRequired: [
        ...nested.conditionalRequired,
        ...(field.required && field.conditions
          ? [{ fieldId: field.id, conditions: field.conditions }]
          : []),
      ],
    };
  }

  let base: z.ZodTypeAny = z.string();

  if (field.type === "file") {
    const schema = z.any();
    return {
      schema: field.required
        ? schema.refine((value) => Boolean(value), { message: "required" })
        : schema.optional(),
      conditionalRequired:
        field.required && field.conditions
          ? [{ fieldId: field.id, conditions: field.conditions }]
          : [],
    };
  }

  if (field.type === "date") {
    base = z
      .string()
      .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
        message: "invalid_date",
      });
  }

  if (field.type === "select" || field.type === "radio") {
    const values = field.options?.map((option) => option.value) ?? [];
    base =
      values.length > 0
        ? z.string().refine((value) => values.includes(value), {
            message: "invalid_option",
          })
        : z.string();
  }

  if (field.validations?.noAccents) {
    base = base.refine(
      (value) => !value || !/[^\u0000-\u007F]/.test(String(value)),
      { message: "no_accents" },
    );
  }

  const withRequired = field.required
    ? base.refine(
        (v) => v != null && String(v).trim().length > 0,
        { message: "required" },
      )
    : base.optional();

  return {
    schema: withRequired,
    conditionalRequired:
      field.required && field.conditions
        ? [{ fieldId: field.id, conditions: field.conditions }]
        : [],
  };
};

const buildObjectSchema = (fields: FieldSchema[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  const conditionalRequired: BuildSchemaResult["conditionalRequired"] = [];

  fields.forEach((field) => {
    const result = buildFieldSchema(field);
    shape[field.id] = result.schema;
    conditionalRequired.push(...result.conditionalRequired);
  });

  const schema = z.object(shape).superRefine((values, ctx) => {
    conditionalRequired.forEach((rule) => {
      const matches = rule.conditions.every(
        (condition) => values[condition.fieldId] === condition.equals,
      );
      if (matches && !values[rule.fieldId]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [rule.fieldId],
          message: "required",
        });
      }
    });
  });

  return { schema, conditionalRequired };
};

export const buildZodSchema = (schema: FormSchema) =>
  buildObjectSchema(schema.steps.flatMap((step) => step.fields)).schema;

export const loadFormSchema = async (): Promise<FormSchema> => {
  const module = await import("../../schemas/ds160.json");
  return module.default as FormSchema;
};
