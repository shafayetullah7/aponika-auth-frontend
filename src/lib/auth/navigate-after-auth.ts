import {
  buildOAuthResumeHref,
  isOidcInteractionReturnTo,
  safeReturnTo,
} from "./return-to";

type NavigateFn = (path: string, options?: { replace?: boolean }) => void;

export function navigateAfterAuth(
  target: string | undefined,
  options?: {
    navigate?: NavigateFn;
    fallback?: string;
  },
): void {
  const fallback = options?.fallback ?? "/account";
  const safe = safeReturnTo(target, fallback);

  if (isOidcInteractionReturnTo(safe)) {
    window.location.replace(buildOAuthResumeHref(safe));
    return;
  }

  if (options?.navigate) {
    options.navigate(safe, { replace: true });
    return;
  }

  window.location.replace(safe);
}
