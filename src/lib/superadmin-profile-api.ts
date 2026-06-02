import { apiRequest } from "./api";

export type SuperadminProfile = {
  accountStatus?: string;
  createdAt?: string;
  email?: string;
  id?: string;
  mobile?: string;
  name?: string;
  profileImage?: string;
  role?: string;
  taxPercentage?: number;
  updatedAt?: string;
};

type SuperadminProfileResponse = {
  data?: SuperadminProfile;
  message?: string;
  success?: boolean;
};

export function getSuperadminProfile() {
  return apiRequest<SuperadminProfileResponse>({
    method: "GET",
    url: "auth/superadmin/profile",
  });
}

export function updateSuperadminProfile(data: FormData) {
  return apiRequest<SuperadminProfileResponse>({
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method: "PATCH",
    url: "auth/superadmin/profile",
  });
}
