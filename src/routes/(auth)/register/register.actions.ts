import { action } from "@solidjs/router";
import { authApi } from "~/lib/api/auth.api";
import {
  toRegisterPayload,
  type RegisterFormData,
} from "~/schemas/register.schema";

export const registerAction = action(async (data: RegisterFormData) => {
  "use server";
  await authApi.register(toRegisterPayload(data));
  return { success: true as const, email: data.email };
}, "user-register");
