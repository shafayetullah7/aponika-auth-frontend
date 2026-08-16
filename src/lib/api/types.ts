export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  status: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: User;
}

export interface VerifyEmailResponse {
  emailVerified: true;
}

export interface UpdateProfileDto {
  name: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
