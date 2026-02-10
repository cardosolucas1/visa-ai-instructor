import { buildZodSchema, FormSchema } from "@/lib/schema-loader";

describe("schema-loader", () => {
  it("valida campo sem acentos", () => {
    const schema: FormSchema = {
      title: "Teste",
      steps: [
        {
          id: "step",
          title: "Step",
          fields: [
            {
              id: "name",
              type: "text",
              label: "Nome",
              required: true,
              validations: { noAccents: true },
            },
          ],
        },
      ],
    };

    const zodSchema = buildZodSchema(schema);
    expect(zodSchema.safeParse({ name: "Jose" }).success).toBe(true);
    expect(zodSchema.safeParse({ name: "José" }).success).toBe(false);
  });

  it("exige campo condicional quando condicao e atendida", () => {
    const schema: FormSchema = {
      title: "Teste",
      steps: [
        {
          id: "step",
          title: "Step",
          fields: [
            {
              id: "has_plan",
              type: "radio",
              label: "Plano",
              required: true,
              options: [{ value: "yes", label: "Sim" }],
            },
            {
              id: "arrival",
              type: "date",
              label: "Chegada",
              required: true,
              conditions: [{ fieldId: "has_plan", equals: "yes" }],
            },
          ],
        },
      ],
    };

    const zodSchema = buildZodSchema(schema);
    expect(zodSchema.safeParse({ has_plan: "yes" }).success).toBe(false);
    expect(
      zodSchema.safeParse({ has_plan: "yes", arrival: "2026-02-04" }).success,
    ).toBe(true);
  });
});
