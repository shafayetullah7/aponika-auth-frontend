import { readApiErrorShape } from "./api-error-shape";

export type VerifyEmailErrorKind = "missing_token" | "invalid_token" | "unknown";

export type VerifyEmailErrorState = {
  kind: VerifyEmailErrorKind;
  message?: string;
};

export function getVerifyEmailErrorState(error: unknown): VerifyEmailErrorState {
  const shape = readApiErrorShape(error);
  if (!shape) {
    return {
      kind: "unknown",
      message: error instanceof Error ? error.message : undefined,
    };
  }

  const errorCode = shape.data?.errorCode;
  const message = shape.data?.message ?? shape.message;

  if (
    errorCode === "INVALID_EMAIL_VERIFICATION_TOKEN"
    || shape.status === 400
    || shape.status === 404
  ) {
    return { kind: "invalid_token", message };
  }

  return { kind: "unknown", message };
}
