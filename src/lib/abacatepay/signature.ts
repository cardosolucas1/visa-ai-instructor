import crypto from "crypto";

export const createWebhookSignature = (payload: string, secret: string) =>
  crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");

export const validateWebhookSignature = (
  payload: string,
  secret: string,
  providedSignature: string,
) => {
  const expected = createWebhookSignature(payload, secret);

  if (expected.length !== providedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(providedSignature, "utf8"),
  );
};
