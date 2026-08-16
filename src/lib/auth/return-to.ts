import { config } from "../config";

const DEFAULT_RETURN_TO = "/account";

/** Internal paths users may be sent to after login. */
const ALLOWED_RETURN_TO_PREFIXES = ["/account"] as const;

const BLOCKED_PREFIXES = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
] as const;

function isBlockedReturnTo(path: string): boolean {
  return BLOCKED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function isAllowedInternalPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return false;
  }

  if (isBlockedReturnTo(path)) {
    return false;
  }

  return ALLOWED_RETURN_TO_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function isAllowedOidcInteractionUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const issuerOrigin = config.api.origin.replace(/\/$/, "");
    return (
      url.origin === issuerOrigin &&
      url.pathname.startsWith("/interaction/") &&
      url.pathname.length > "/interaction/".length
    );
  } catch {
    return false;
  }
}

function isAllowedReturnTo(value: string): boolean {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return isAllowedOidcInteractionUrl(value);
  }

  return isAllowedInternalPath(value);
}

export function safeReturnTo(
  value: string | string[] | undefined,
  fallback: string = DEFAULT_RETURN_TO,
): string {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || !isAllowedReturnTo(raw)) {
    return fallback;
  }

  return raw;
}
