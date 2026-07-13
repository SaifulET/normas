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

export const SUPERADMIN_DISPLAY_EMAILS = ["info@early-n.com", "normie@early-n.com"] as const;
export const SUPERADMIN_PRIMARY_DISPLAY_EMAIL = SUPERADMIN_DISPLAY_EMAILS[0];

const SUPERADMIN_PROFILE_CACHE_KEY = "normas.superadmin.profile";

let profileRequest: Promise<SuperadminProfileResponse> | null = null;

export function getCachedSuperadminProfile() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawProfile = window.sessionStorage.getItem(SUPERADMIN_PROFILE_CACHE_KEY);

    if (!rawProfile) {
      return null;
    }

    return JSON.parse(rawProfile) as SuperadminProfile;
  } catch {
    return null;
  }
}

export function cacheSuperadminProfile(profile?: SuperadminProfile | null) {
  if (typeof window === "undefined" || !profile) {
    return;
  }

  try {
    const cachedProfile = getCachedSuperadminProfile();
    const nextProfile = cachedProfile ? { ...cachedProfile, ...profile } : profile;

    window.sessionStorage.setItem(SUPERADMIN_PROFILE_CACHE_KEY, JSON.stringify(nextProfile));
  } catch {
    // Ignore storage failures; the API response remains the source of truth.
  }
}

export function getSuperadminProfile() {
  if (!profileRequest) {
    profileRequest = apiRequest<SuperadminProfileResponse>({
      method: "GET",
      url: "auth/superadmin/profile",
    })
      .then((response) => {
        cacheSuperadminProfile(response.data);
        return response;
      })
      .finally(() => {
        profileRequest = null;
      });
  }

  return profileRequest;
}

export async function updateSuperadminProfile(data: FormData) {
  const response = await apiRequest<SuperadminProfileResponse>({
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method: "PATCH",
    url: "auth/superadmin/profile",
  });

  cacheSuperadminProfile(response.data);

  return response;
}
