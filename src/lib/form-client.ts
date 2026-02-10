export const saveDraft = async (payload: {
  applicationId: string;
  data: Record<string, unknown>;
  securityQuestion?: string;
  securityAnswer?: string;
}) => {
  const response = await fetch("/api/forms/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

export const loadDraft = async (payload: {
  applicationId: string;
  securityAnswer?: string;
}) => {
  const query = new URLSearchParams({
    id: payload.applicationId,
    ...(payload.securityAnswer ? { securityAnswer: payload.securityAnswer } : {}),
  });
  const response = await fetch(`/api/forms/draft?${query.toString()}`);
  return response.json();
};

export const submitForm = async (payload: {
  applicationId: string;
  data: Record<string, unknown>;
}) => {
  const response = await fetch("/api/forms/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  return response.json();
};
