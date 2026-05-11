import { apiRequest } from "./api";

export type KycMutationResponse = {
  data?: unknown;
  message?: string;
  success?: boolean;
};

function readIdFromObject(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;

  for (const key of ["kycId", "id", "_id"]) {
    if (typeof source[key] === "string") {
      return source[key];
    }
  }

  return readIdFromObject(source.data) ?? readIdFromObject(source.kyc);
}

export function getKycIdFromResponse(response: KycMutationResponse) {
  return readIdFromObject(response);
}

export function submitKycFormData(formData: FormData, kycId?: string | null) {
  return apiRequest<KycMutationResponse>({
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method: kycId ? "PATCH" : "POST",
    url: kycId ? `kyc/${kycId}` : "kyc",
  });
}
