import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const formatZodError = (error: z.ZodError) =>
  [
    "Variáveis de ambiente inválidas:",
    ...error.issues.map(
      (issue) => `- ${issue.path.join(".")}: ${issue.message}`,
    ),
  ].join("\n");

export const getPublicEnv = () => {
  const parsed = publicSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  return parsed.data;
};

export const getServerEnv = () => {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv deve ser chamado apenas no servidor.");
  }

  const serverSchema = publicSchema.extend({
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    APP_BASE_URL: z.string().url(),
    ABACATEPAY_API_KEY: z.string().min(1),
    ABACATEPAY_CUSTOMER_ID: z.string().min(1).optional(),
    ABACATEPAY_WEBHOOK_SIGNATURE_SECRET: z.string().min(1),
    /** Valor da compra em centavos (ex.: 4990 = R$ 49,90) */
    PURCHASE_AMOUNT_CENTS: z.coerce.number().int().positive(),
  });

  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  return parsed.data;
};
