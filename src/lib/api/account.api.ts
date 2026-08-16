import { fetcher } from "./api-client";
import type { ChangePasswordDto, UpdateProfileDto, User } from "./types";

export const accountApi = {
  getMe(): Promise<User> {
    return fetcher<User>("/account/me", {
      strict: false,
    });
  },

  updateProfile(data: UpdateProfileDto): Promise<User> {
    return fetcher<User>("/account/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  changePassword(data: ChangePasswordDto): Promise<void> {
    return fetcher<void>("/account/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
