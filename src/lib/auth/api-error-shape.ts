import { ApiError } from "~/lib/api/types";

export type ApiErrorShape = {
  status?: number;
  message?: string;
  data?: { errorCode?: string; message?: string };
};

export function readApiErrorShape(error: unknown): ApiErrorShape | null {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      message: error.message,
      data: error.data as ApiErrorShape["data"],
    };
  }

  if (typeof error !== "object" || error === null) {
    return null;
  }

  const candidate = error as Record<string, unknown>;
  const status =
    typeof candidate.status === "number" ? candidate.status : undefined;
  const message =
    typeof candidate.message === "string" ? candidate.message : undefined;
  const data =
    typeof candidate.data === "object" && candidate.data !== null
      ? (candidate.data as ApiErrorShape["data"])
      : undefined;

  if (status !== undefined || data?.errorCode || message) {
    return { status, message, data };
  }

  return null;
}
