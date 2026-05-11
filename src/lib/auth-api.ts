import { apiRequest } from "./api";

export type AuthUserResponse = {
  email: string;
  id: string;
  name: string;
  role: SignupRole;
};

export type SigninRequest = {
  email: string;
  password: string;
};

export type SigninResponse = {
  data?: AuthSessionResponseData;
  accessToken?: string;
  message?: string;
  refreshToken?: string;
  success?: boolean;
  token?: string;
  user?: AuthUserResponse;
};

export type SignupResponse = {
  data?: AuthSessionResponseData;
  accessToken?: string;
  message?: string;
  refreshToken?: string;
  success?: boolean;
  token?: string;
  user?: AuthUserResponse;
};

export type AuthSessionResponseData = {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user?: AuthUserResponse;
};

export type AuthSession = {
  refreshToken: string | null;
  token: string;
  user: AuthUserResponse;
};

export type SignupRole = "investor" | "investee" | "superadmin";

export type SignupRequest = {
  email: string;
  name: string;
  password: string;
  role: SignupRole;
};

export function signupUser(payload: SignupRequest) {
  return apiRequest<SignupResponse>({
    data: payload,
    method: "POST",
    url: "auth/signup",
  });
}

export function signinUser(payload: SigninRequest) {
  return apiRequest<SigninResponse>({
    data: payload,
    method: "POST",
    url: "auth/signin",
  });
}

export function getAuthUserFromResponse(response: SigninResponse | SignupResponse) {
  return response.data?.user ?? response.user ?? null;
}

export function getAuthSessionFromResponse(
  response: SigninResponse | SignupResponse,
  fallbackUser?: AuthUserResponse | null,
): AuthSession | null {
  const accessToken = response.data?.accessToken ?? response.data?.token ?? response.accessToken ?? response.token;
  const refreshToken = response.data?.refreshToken ?? response.refreshToken ?? null;
  const user = getAuthUserFromResponse(response) ?? fallbackUser;

  if (!accessToken || !user) {
    return null;
  }

  return {
    refreshToken,
    token: accessToken,
    user,
  };
}
