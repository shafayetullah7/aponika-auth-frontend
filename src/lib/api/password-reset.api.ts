import { fetcher } from "./api-client";

export type PasswordResetTokenResponse = {
  token: string;
  expiresAt: string;
};

export const passwordResetApi = {
  request(email: string): Promise<PasswordResetTokenResponse> {
    return fetcher<PasswordResetTokenResponse>("/auth/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email }),
      strict: false,
    });
  },

  verify(token: string, otp: string): Promise<PasswordResetTokenResponse> {
    return fetcher<PasswordResetTokenResponse>("/auth/password-reset/verify", {
      method: "POST",
      body: JSON.stringify({ token, otp }),
      strict: false,
    });
  },

  confirm(token: string, password: string): Promise<void> {
    return fetcher<void>("/auth/password-reset/confirm", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      strict: false,
    });
  },
};
