import { ApiError } from "~/lib/api/types";

export type LoginErrorKind =
  | "invalid_credentials"
  | "rate_limited"
  | "unknown";

export type LoginErrorState = {
  kind: LoginErrorKind;
  message?: string;
};

export function getLoginErrorState(error: unknown): LoginErrorState {
  if (!(error instanceof ApiError)) {
    return {
      kind: "unknown",
      message: error instanceof Error ? error.message : undefined,
    };
  }

  const data = error.data as { errorCode?: string; message?: string } | undefined;
  const errorCode = data?.errorCode;

  if (error.status === 429 || errorCode === "TOO_MANY_REQUESTS") {
    return { kind: "rate_limited", message: data?.message };
  }

  if (error.status === 401 || errorCode === "INVALID_CREDENTIALS") {
    return { kind: "invalid_credentials", message: data?.message };
  }

  return { kind: "unknown", message: data?.message || error.message };
}
