import { action } from "@solidjs/router";
import { authApi } from "~/lib/api/auth.api";
import { getLoginErrorState, type LoginErrorKind } from "~/lib/auth/login-errors";

export type ResendVerificationActionResult =
  | { success: true }
  | { success: false; kind: LoginErrorKind };

export const resendVerificationAction = action(
  async (data: { email: string }): Promise<ResendVerificationActionResult> => {
    "use server";

    try {
      await authApi.resendVerification({ email: data.email });
      return { success: true };
    } catch (error) {
      const { kind } = getLoginErrorState(error);
      return { success: false, kind };
    }
  },
  "user-resend-verification",
);
