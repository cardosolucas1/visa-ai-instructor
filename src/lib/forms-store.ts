import crypto from "crypto";

type DraftRecord = {
  applicationId: string;
  securityQuestion?: string;
  securityAnswerHash?: string;
  data: Record<string, unknown>;
  updatedAt: string;
};

type SubmissionRecord = {
  confirmationNumber: string;
  applicationId: string;
  data: Record<string, unknown>;
  submittedAt: string;
};

const draftStore = new Map<string, DraftRecord>();
const submissionStore = new Map<string, SubmissionRecord>();

const hash = (value: string) =>
  crypto.createHash("sha256").update(value, "utf8").digest("hex");

export const saveDraftRecord = (input: {
  applicationId: string;
  data: Record<string, unknown>;
  securityQuestion?: string;
  securityAnswer?: string;
}) => {
  const record: DraftRecord = {
    applicationId: input.applicationId,
    securityQuestion: input.securityQuestion,
    securityAnswerHash: input.securityAnswer ? hash(input.securityAnswer) : undefined,
    data: input.data,
    updatedAt: new Date().toISOString(),
  };
  draftStore.set(input.applicationId, record);
  return record;
};

export const getDraftRecord = (applicationId: string) =>
  draftStore.get(applicationId) ?? null;

export const verifyDraftAccess = (
  record: DraftRecord,
  securityAnswer?: string,
) => {
  if (!record.securityAnswerHash) return true;
  if (!securityAnswer) return false;
  return record.securityAnswerHash === hash(securityAnswer);
};

export const saveSubmissionRecord = (input: {
  applicationId: string;
  data: Record<string, unknown>;
}) => {
  const confirmationNumber = crypto.randomUUID().toUpperCase();
  const record: SubmissionRecord = {
    confirmationNumber,
    applicationId: input.applicationId,
    data: input.data,
    submittedAt: new Date().toISOString(),
  };
  submissionStore.set(confirmationNumber, record);
  return record;
};

export const getSubmissionRecord = (confirmationNumber: string) =>
  submissionStore.get(confirmationNumber) ?? null;
