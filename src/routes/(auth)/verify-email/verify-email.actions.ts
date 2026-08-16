import { action } from "@solidjs/router";
import { authApi } from "~/lib/api/auth.api";

export const verifyEmailAction = action(async (token: string) => {
  "use server";
  if (!token.trim()) {
    throw new Error("Missing verification token");
  }

  await authApi.verifyEmail({ token });
  return { success: true as const };
}, "user-verify-email");
