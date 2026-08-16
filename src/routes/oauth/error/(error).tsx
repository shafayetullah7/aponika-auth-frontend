import { A, useSearchParams } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { Button, Card } from "~/components/ui";
import { buildAuthPathWithReturnTo } from "~/lib/auth/return-to";
import { useI18n } from "~/i18n";

function readQueryValue(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

function resolveErrorMessage(
  error: string | undefined,
  description: string | undefined,
  t: (key: string) => string,
): string {
  switch (error) {
    case "access_denied":
      return t("oauthError.accessDenied");
    case "invalid_client":
      return t("oauthError.invalidClient");
    case "invalid_request":
      return t("oauthError.invalidRequest");
    case "unauthorized_client":
      return t("oauthError.unauthorizedClient");
    case "server_error":
      return t("oauthError.serverError");
    default:
      return description || t("oauthError.generic");
  }
}

export default function OAuthErrorPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [showDetails, setShowDetails] = createSignal(false);

  const error = () => readQueryValue(searchParams.error);
  const description = () => readQueryValue(searchParams.error_description);
  const state = () => readQueryValue(searchParams.state);
  const message = () => resolveErrorMessage(error(), description(), t);
  const loginHref = () => buildAuthPathWithReturnTo("/login", searchParams.returnTo);
  const isDev = import.meta.env.DEV;

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-md">
        <h1 class="h3 text-center">{t("oauthError.title")}</h1>
        <p class="mt-4 text-center text-forest-700">{message()}</p>

        <Show when={error() && (isDev || showDetails())}>
          <div class="mt-6 rounded-xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-700">
            <p>
              <span class="font-medium">{t("oauthError.codeLabel")}</span> {error()}
            </p>
            <Show when={description()}>
              <p class="mt-2">{description()}</p>
            </Show>
            <Show when={state()}>
              <p class="mt-2">
                <span class="font-medium">{t("oauthError.stateLabel")}</span>{" "}
                {state()}
              </p>
            </Show>
          </div>
        </Show>

        <Show when={error() && !isDev && !showDetails()}>
          <button
            type="button"
            class="mt-4 w-full text-center text-sm font-medium text-forest-600 hover:text-forest-800"
            onClick={() => setShowDetails(true)}
          >
            {t("oauthError.technicalDetails")}
          </button>
        </Show>

        <p class="mt-6 text-center text-sm text-forest-600">{t("oauthError.hint")}</p>

        <div class="mt-8 flex flex-col gap-3">
          <A href={loginHref()}>
            <Button type="button" class="w-full">
              {t("oauthError.tryAgain")}
            </Button>
          </A>
          <A href="/account">
            <Button type="button" variant="secondary" class="w-full">
              {t("oauthError.goHome")}
            </Button>
          </A>
        </div>
      </Card>
    </main>
  );
}
