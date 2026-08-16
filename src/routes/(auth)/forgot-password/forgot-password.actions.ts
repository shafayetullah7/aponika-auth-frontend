import { action } from "@solidjs/router";
import { passwordResetApi } from "~/lib/api/password-reset.api";
import type {
  ConfirmResetFormData,
  RequestResetFormData,
  VerifyResetOtpFormData,
} from "~/schemas/password-reset.schema";

export const requestResetAction = action(async (data: RequestResetFormData) => {
  "use server";
  const result = await passwordResetApi.request(data.email);
  return { success: true as const, ...result };
}, "password-reset-request");

export const verifyResetOtpAction = action(
  async (data: VerifyResetOtpFormData & { requestToken: string }) => {
    "use server";
    const result = await passwordResetApi.verify(data.requestToken, data.otp);
    return { success: true as const, ...result };
  },
  "password-reset-verify",
);

export const confirmResetAction = action(
  async (data: ConfirmResetFormData & { accessToken: string }) => {
    "use server";
    await passwordResetApi.confirm(data.accessToken, data.password);
    return { success: true as const };
  },
  "password-reset-confirm",
);
