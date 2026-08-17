import { readApiErrorShape } from "./api-error-shape";

export type RegisterErrorKind = "email_taken" | "rate_limited" | "unknown";

export type RegisterErrorState = {
  kind: RegisterErrorKind;
  message?: string;
};

export function getRegisterErrorState(error: unknown): RegisterErrorState {
  const shape = readApiErrorShape(error);
  if (!shape) {
    return {
      kind: "unknown",
      message: error instanceof Error ? error.message : undefined,
    };
  }

  const errorCode = shape.data?.errorCode;
  const message = shape.data?.message ?? shape.message;

  if (shape.status === 429 || errorCode === "TOO_MANY_REQUESTS") {
    return { kind: "rate_limited", message };
  }

  if (shape.status === 409 || errorCode === "DUPLICATE_ENTRY") {
    return { kind: "email_taken", message };
  }

  return { kind: "unknown", message };
}
