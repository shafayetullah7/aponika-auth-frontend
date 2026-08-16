import { A, useSearchParams } from "@solidjs/router";
import { Show } from "solid-js";
import { Card } from "~/components/ui";
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

  const error = () => readQueryValue(searchParams.error);
  const description = () => readQueryValue(searchParams.error_description);
  const state = () => readQueryValue(searchParams.state);
  const message = () => resolveErrorMessage(error(), description(), t);

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-md">
        <h1 class="h3 text-center">{t("oauthError.title")}</h1>
        <p class="mt-4 text-center text-forest-700">{message()}</p>

        <Show when={error()}>
          <div class="mt-6 rounded-xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-700">
            <p>
              <span class="font-medium">{t("oauthError.codeLabel")}</span> {error()}
            </p>
            <Show when={state()}>
              <p class="mt-2">
                <span class="font-medium">{t("oauthError.stateLabel")}</span>{" "}
                {state()}
              </p>
            </Show>
          </div>
        </Show>

        <p class="mt-6 text-center text-sm text-forest-600">
          {t("oauthError.hint")}
        </p>

        <div class="mt-8 text-center">
          <A
            href="/login"
            class="font-semibold text-forest-700 hover:text-forest-800"
          >
            {t("oauthError.backToSignIn")}
          </A>
        </div>
      </Card>
    </main>
  );
}
