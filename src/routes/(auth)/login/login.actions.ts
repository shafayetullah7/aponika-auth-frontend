import { action } from "@solidjs/router";
import { authApi } from "~/lib/api/auth.api";
import { getLoginErrorState, type LoginErrorKind } from "~/lib/auth/login-errors";
import { safeReturnTo } from "~/lib/auth/return-to";
import type { LoginFormData } from "~/schemas/login.schema";

export type LoginActionResult =
  | { success: true; target: string }
  | { success: false; kind: LoginErrorKind };

export const loginAction = action(
  async (data: LoginFormData & { returnTo?: string }): Promise<LoginActionResult> => {
    "use server";

    try {
      await authApi.login({
        email: data.email,
        password: data.password,
      });

      return {
        success: true,
        target: safeReturnTo(data.returnTo),
      };
    } catch (error) {
      const { kind } = getLoginErrorState(error);
      return { success: false, kind };
    }
  },
  "user-login",
);
