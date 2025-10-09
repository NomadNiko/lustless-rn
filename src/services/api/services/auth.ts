import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import { User } from "../types/user";
import { Tokens } from "../types/tokens";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";

// Login Flow
export type AuthInitiateLoginRequest = {
  email: string;
  password: string;
};

export type AuthInitiateLoginResponse = {
  success: boolean;
  message: string;
  temporaryToken?: string;
  expiresAt?: string;
  skipOtp?: boolean;
  loginData?: Tokens & { user: User };
};

export function useAuthInitiateLoginService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthInitiateLoginRequest) => {
      return fetchBase(`${API_URL}/api/v1/auth/email/login/initiate`, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<AuthInitiateLoginResponse>);
    },
    [fetchBase]
  );
}

export type AuthVerifyLoginRequest = {
  email: string;
  otpCode: string;
};

export type AuthVerifyLoginResponse = Tokens & {
  user: User;
};

export function useAuthVerifyLoginService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthVerifyLoginRequest) => {
      return fetchBase(`${API_URL}/api/v1/auth/email/login/verify`, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<AuthVerifyLoginResponse>);
    },
    [fetchBase]
  );
}

// Signup Flow
export type AuthSignupStep1Request = {
  email: string;
  password: string;
};

export type AuthSignupStep1Response = Tokens & {
  user: User;
};

export function useAuthSignupStep1Service() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthSignupStep1Request) => {
      return fetchBase(`${API_URL}/api/v1/auth/signup/step1`, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<AuthSignupStep1Response>);
    },
    [fetchBase]
  );
}

// Phone Verification
export type AuthPhoneInitiateRequest = {
  phoneNumber: string;
};

export type AuthPhoneInitiateResponse = {
  success: boolean;
  message: string;
  expiresAt: string;
  phoneNumber: string;
};

export function useAuthPhoneInitiateService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthPhoneInitiateRequest) => {
      return fetchBase(`${API_URL}/api/v1/auth/phone/initiate`, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<AuthPhoneInitiateResponse>);
    },
    [fetchBase]
  );
}

export type AuthPhoneVerifyRequest = {
  phoneNumber: string;
  code: string;
};

export function useAuthPhoneVerifyService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthPhoneVerifyRequest) => {
      return fetchBase(`${API_URL}/api/v1/auth/phone/verify`, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<void>);
    },
    [fetchBase]
  );
}

// Identity Verification
export type AuthIdentityVerifyRequest = {
  idDocumentId: string;
  selfieId: string;
};

export type AuthIdentityVerifyResponse = {
  success: boolean;
  message: string;
  similarity?: number;
  extractedFirstName?: string;
  extractedLastName?: string;
  newVerificationStep?: string;
};

export function useAuthIdentityVerifyService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthIdentityVerifyRequest) => {
      return fetchBase(`${API_URL}/api/v1/auth/identity/verify`, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<AuthIdentityVerifyResponse>);
    },
    [fetchBase]
  );
}

// Verification Status
export type VerificationStatusResponse = {
  currentStep: "email_verified" | "identity_verified" | "fully_verified";
  nextRoute: string;
  isFullyVerified: boolean;
  message: string;
};

export function useAuthVerificationStatusService() {
  const fetchBase = useFetch();

  return useCallback(
    () => {
      return fetchBase(`${API_URL}/api/v1/auth/verification/status`, {
        method: "GET",
      }).then(wrapperFetchJsonResponse<VerificationStatusResponse>);
    },
    [fetchBase]
  );
}

// Get Me
export type AuthGetMeResponse = User;

export function useAuthGetMeService() {
  const fetch = useFetch();

  return useCallback(
    () => {
      return fetch(`${API_URL}/api/v1/auth/me`, {
        method: "GET",
      }).then(wrapperFetchJsonResponse<AuthGetMeResponse>);
    },
    [fetch]
  );
}
