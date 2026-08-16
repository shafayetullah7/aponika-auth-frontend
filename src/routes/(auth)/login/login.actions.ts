import { action } from "@solidjs/router";
import { authApi } from "~/lib/api/auth.api";
import { safeReturnTo } from "~/lib/auth/return-to";
import type { LoginFormData } from "~/schemas/login.schema";

export const loginAction = action(async (data: LoginFormData & { returnTo?: string }) => {
  "use server";
  await authApi.login({
    email: data.email,
    password: data.password,
  });

  return {
    success: true as const,
    target: safeReturnTo(data.returnTo),
  };
}, "user-login");
