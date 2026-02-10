import type { FormSchema, StepSchema } from "./schema-loader";

/** Schema step IDs included in each app step (1-4). */
const APP_STEP_IDS: Record<number, string[]> = {
  1: ["personal_1", "personal_2"],
  2: ["travel_info", "travel_companions", "previous_travel"],
  3: ["contact_info", "passport_docs", "us_contact"],
  4: ["work_education", "security_background", "security_question"],
};

export function getSchemaStepIdsForAppStep(appStep: number): string[] {
  return APP_STEP_IDS[appStep] ?? [];
}

export function getStepsForAppStep(
  fullSchema: FormSchema,
  appStep: number,
): StepSchema[] {
  const ids = getSchemaStepIdsForAppStep(appStep);
  return fullSchema.steps.filter((s) => ids.includes(s.id));
}

export function getSchemaSubsetForAppStep(
  fullSchema: FormSchema,
  appStep: number,
): FormSchema {
  const steps = getStepsForAppStep(fullSchema, appStep);
  return { title: fullSchema.title, steps };
}
