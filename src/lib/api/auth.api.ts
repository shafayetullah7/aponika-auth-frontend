import { fetcher } from "./api-client";
import type {
  LoginResponse,
  LoginUserDto,
  RegisterUserDto,
  User,
  VerifyEmailDto,
  VerifyEmailResponse,
} from "./types";

export const authApi = {
  login(data: LoginUserDto): Promise<LoginResponse> {
    return fetcher<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      strict: false,
    });
  },

  register(data: RegisterUserDto): Promise<User> {
    return fetcher<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      strict: false,
    });
  },

  verifyEmail(data: VerifyEmailDto): Promise<VerifyEmailResponse> {
    return fetcher<VerifyEmailResponse>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(data),
      strict: false,
    });
  },

  checkAuth(): Promise<User> {
    return fetcher<User>("/auth/check");
  },

  logout(): Promise<void> {
    return fetcher<void>("/auth/logout", {
      method: "POST",
    });
  },
};
