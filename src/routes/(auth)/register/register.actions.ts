import { action } from "@solidjs/router";
import { authApi } from "~/lib/api/auth.api";
import {
  getRegisterErrorState,
  type RegisterErrorKind,
} from "~/lib/auth/register-errors";
import {
  toRegisterPayload,
  type RegisterFormData,
} from "~/schemas/register.schema";

export type RegisterActionResult =
  | { success: true; email: string }
  | { success: false; kind: RegisterErrorKind; message?: string };

export const registerAction = action(
  async (data: RegisterFormData): Promise<RegisterActionResult> => {
    "use server";

    try {
      await authApi.register(toRegisterPayload(data));
      return { success: true, email: data.email };
    } catch (error) {
      const { kind, message } = getRegisterErrorState(error);
      return { success: false, kind, message };
    }
  },
  "user-register",
);
