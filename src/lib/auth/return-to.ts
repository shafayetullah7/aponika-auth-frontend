import { config } from "../config";

const DEFAULT_RETURN_TO = "/account";

/** Internal paths users may be sent to after login. */
const ALLOWED_RETURN_TO_PREFIXES = ["/account", "/consent"] as const;

const BLOCKED_PREFIXES = [
  "/login",
  "/register",
  "/verify-email",
  "/resend-verification",
  "/forgot-password",
  "/oauth/resume",
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

export function isOidcInteractionReturnTo(value: string): boolean {
  return (
    (value.startsWith("http://") || value.startsWith("https://")) &&
    isAllowedOidcInteractionUrl(value)
  );
}

export function buildOAuthResumeHref(returnTo: string): string {
  if (!isOidcInteractionReturnTo(returnTo)) {
    return safeReturnTo(returnTo);
  }

  const params = new URLSearchParams();
  params.set("returnTo", returnTo);
  return `/oauth/resume?${params.toString()}`;
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

export function buildAuthPathWithReturnTo(
  path: string,
  returnTo: string | string[] | undefined,
): string {
  const raw = Array.isArray(returnTo) ? returnTo[0] : returnTo;
  if (!raw || !isAllowedReturnTo(raw)) {
    return path;
  }

  const params = new URLSearchParams();
  params.set("returnTo", raw);
  return `${path}?${params.toString()}`;
}

export function buildResendVerificationHref(
  options: {
    returnTo?: string | string[] | undefined;
    email?: string;
  } = {},
): string {
  const params = new URLSearchParams();
  const rawReturnTo = Array.isArray(options.returnTo)
    ? options.returnTo[0]
    : options.returnTo;

  if (rawReturnTo && isAllowedReturnTo(rawReturnTo)) {
    params.set("returnTo", rawReturnTo);
  }

  if (options.email?.trim()) {
    params.set("email", options.email.trim());
  }

  const query = params.toString();
  return query ? `/resend-verification?${query}` : "/resend-verification";
}

export function extractInteractionUidFromReturnTo(returnTo: string): string | null {
  try {
    const url = new URL(returnTo);
    const match = url.pathname.match(/^\/interaction\/([^/]+)$/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
