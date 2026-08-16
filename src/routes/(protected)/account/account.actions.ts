import { action } from "@solidjs/router";
import { accountApi } from "~/lib/api/account.api";
import type {
  ChangePasswordFormData,
  UpdateProfileFormData,
} from "~/schemas/account.schema";

export const updateProfileAction = action(async (data: UpdateProfileFormData) => {
  "use server";
  const user = await accountApi.updateProfile({ name: data.name });
  return { success: true as const, user };
}, "account-update-profile");

export const changePasswordAction = action(
  async (data: ChangePasswordFormData) => {
    "use server";
    await accountApi.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    return { success: true as const };
  },
  "account-change-password",
);
