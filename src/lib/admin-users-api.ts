import { apiRequest, type ApiSuccessResponse } from "./api";

export type AdminAccountStatus = "active" | "inactive" | "pending";
export type AdminUserRole = "investor" | "investee";

export type AdminUserSummary = {
  accountStatus?: AdminAccountStatus | string;
  accountType?: AdminUserRole | string;
  country?: string;
  createdAt?: string;
  email?: string;
  gmail?: string;
  id: string;
  joiningDate?: string;
  kycStatus?: string;
  mobile?: string;
  name?: string;
  pitchCount?: number;
  profileImage?: string;
  role?: AdminUserRole | string;
  updatedAt?: string;
};

export type AdminUserProfile = AdminUserSummary & {
  age?: number | string;
  socialLinks?: Record<string, unknown>;
  taxPercentage?: number;
};

export type AdminProfileKyc = {
  accountType?: AdminUserRole | string;
  currentStep?: number;
  kycId?: string | null;
  name?: string;
  profileImage?: string;
  role?: AdminUserRole | string;
  status?: string;
  submittedAt?: string | null;
  updatedAt?: string | null;
};

export type AdminKycFileGroup = Record<string, string | null | undefined>;

export type AdminKyc = {
  _id?: string;
  addressVerification?: AdminKycFileGroup;
  approval?: Record<string, unknown>;
  createdAt?: string;
  currentStep?: number;
  faceVerification?: AdminKycFileGroup;
  personalIdentity?: Record<string, string | number | null | undefined>;
  role?: AdminUserRole | string;
  sourceOfFunds?: AdminKycFileGroup;
  status?: string;
  updatedAt?: string;
  user?: string;
} | null;

export type AdminPitchAdditionalDetail = {
  key?: string;
  value?: string;
};

export type AdminPitch = {
  _id: string;
  additionalDetails?: AdminPitchAdditionalDetail[];
  bannerImage?: string;
  country?: string;
  createdAt?: string;
  description?: string;
  fundingTarget?: number;
  keyword?: string;
  sector?: string;
  stage?: string;
  status?: string;
  title?: string;
  updatedAt?: string;
  user?: unknown;
  viewCount?: number;
};

export type AdminUsersPagination = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

export type AdminUsersListData = {
  pagination: AdminUsersPagination;
  users: AdminUserSummary[];
};

export type AdminUserDetailsData = {
  features?: AdminPitch[];
  kyc: AdminKyc;
  pitches?: AdminPitch[];
  profile: AdminUserProfile;
  profileKyc: AdminProfileKyc;
};

export type AdminUserProfileData = {
  profile: AdminUserProfile;
  profileKyc: AdminProfileKyc;
};

export type AdminUserKycData = {
  kyc: AdminKyc;
  user: AdminProfileKyc;
};

export type AdminUserPitchesData = {
  features?: AdminPitch[];
  pitches?: AdminPitch[];
  user: AdminUserProfile;
};

export type AdminUsersQueryParams = {
  accountStatus?: AdminAccountStatus | "";
  limit?: number;
  page?: number;
  role?: AdminUserRole | "";
  search?: string;
};

export function getAdminUsers(params: AdminUsersQueryParams = {}) {
  return apiRequest<ApiSuccessResponse<AdminUsersListData>>({
    method: "GET",
    params,
    url: "admin/users",
  });
}

export function getAdminUserDetails(userId: string) {
  return apiRequest<ApiSuccessResponse<AdminUserDetailsData>>({
    method: "GET",
    url: `admin/users/${userId}`,
  });
}

export function getAdminUserProfile(userId: string) {
  return apiRequest<ApiSuccessResponse<AdminUserProfileData>>({
    method: "GET",
    url: `admin/users/${userId}/profile`,
  });
}

export function getAdminUserKyc(userId: string) {
  return apiRequest<ApiSuccessResponse<AdminUserKycData>>({
    method: "GET",
    url: `admin/users/${userId}/kyc`,
  });
}

export function getAdminUserPitches(userId: string) {
  return apiRequest<ApiSuccessResponse<AdminUserPitchesData>>({
    method: "GET",
    url: `admin/users/${userId}/pitches`,
  });
}

export function updateAdminUserAccountStatus(userId: string, accountStatus: AdminAccountStatus) {
  return apiRequest<ApiSuccessResponse<AdminUserSummary>>({
    data: { accountStatus },
    method: "PATCH",
    url: `admin/users/${userId}/status`,
  });
}
