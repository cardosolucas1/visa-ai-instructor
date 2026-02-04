import "server-only";

import { getServerEnv } from "@/lib/env";

type BillingProduct = {
  externalId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
};

type CreateBillingPayload = {
  frequency?: "ONE_TIME" | "MULTIPLE_PAYMENTS";
  methods?: Array<"PIX" | "CARD">;
  products: BillingProduct[];
  returnUrl?: string;
  completionUrl?: string;
  customerId?: string;
};

type CreateBillingResponse = {
  data?: {
    id: string;
    url: string;
    amount: number;
    status: string;
  };
  error?: string | null;
};

type CreateCustomerPayload = {
  name: string;
  cellphone: string;
  email: string;
  taxId: string;
};

type CreateCustomerResponse = {
  data?: {
    id: string;
  };
  error?: string | null;
};

export const createBilling = async (payload: CreateBillingPayload) => {
  const { ABACATEPAY_API_KEY } = getServerEnv();

  const response = await fetch("https://api.abacatepay.com/v1/billing/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AbacatePay error: ${text}`);
  }

  const data = (await response.json()) as CreateBillingResponse;

  if (!data.data?.url || data.error) {
    throw new Error(data.error ?? "Resposta inválida da AbacatePay.");
  }

  return data.data;
};

export const createCustomer = async (payload: CreateCustomerPayload) => {
  const { ABACATEPAY_API_KEY } = getServerEnv();

  const response = await fetch("https://api.abacatepay.com/v1/customer/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AbacatePay error: ${text}`);
  }

  const data = (await response.json()) as CreateCustomerResponse;

  if (!data.data?.id || data.error) {
    throw new Error(data.error ?? "Resposta inválida da AbacatePay.");
  }

  return data.data;
};
