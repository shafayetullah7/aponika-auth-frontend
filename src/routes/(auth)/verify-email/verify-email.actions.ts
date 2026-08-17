import { action } from "@solidjs/router";
import { authApi } from "~/lib/api/auth.api";
import {
  getVerifyEmailErrorState,
  type VerifyEmailErrorKind,
} from "~/lib/auth/verify-email-errors";

export type VerifyEmailActionResult =
  | { success: true }
  | { success: false; kind: VerifyEmailErrorKind; message?: string };

export const verifyEmailAction = action(
  async (token: string): Promise<VerifyEmailActionResult> => {
    "use server";

    if (!token.trim()) {
      return { success: false, kind: "missing_token" };
    }

    try {
      await authApi.verifyEmail({ token });
      return { success: true };
    } catch (error) {
      const { kind, message } = getVerifyEmailErrorState(error);
      return { success: false, kind, message };
    }
  },
  "user-verify-email",
);
