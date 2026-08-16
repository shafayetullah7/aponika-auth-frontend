import { useAction, useSearchParams, useSubmission } from "@solidjs/router";
import { createEffect, createResource, createSignal, For, Show } from "solid-js";
import { Button, Card } from "~/components/ui";
import {
  extractInteractionUidFromReturnTo,
  safeReturnTo,
} from "~/lib/auth/return-to";
import { oauthConsentApi } from "~/lib/api/oauth-consent.api";
import { useI18n } from "~/i18n";
import { allowConsentAction, denyConsentAction } from "./consent.actions";

function scopeLabel(scope: string, t: (key: string) => string): string {
  switch (scope) {
    case "openid":
      return t("consent.scopeOpenId");
    case "profile":
      return t("consent.scopeProfile");
    case "email":
      return t("consent.scopeEmail");
    default:
      return scope;
  }
}

export default function ConsentPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const returnTo = () => safeReturnTo(searchParams.returnTo, "/account");
  const interactionUid = () =>
    extractInteractionUidFromReturnTo(returnTo()) ?? "";
  const [remember, setRemember] = createSignal(true);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const [details] = createResource(interactionUid, async (uid) => {
    if (!uid) {
      throw new Error("Missing interaction id");
    }

    return oauthConsentApi.getInteraction(uid);
  });

  const allowConsent = useAction(allowConsentAction);
  const denyConsent = useAction(denyConsentAction);
  const allowSubmission = useSubmission(allowConsentAction);
  const denySubmission = useSubmission(denyConsentAction);

  createEffect(() => {
    const result = allowSubmission.result ?? denySubmission.result;
    if (result?.redirectUrl) {
      window.location.assign(result.redirectUrl);
    }
  });

  createEffect(() => {
    const error = allowSubmission.error ?? denySubmission.error;
    if (error instanceof Error) {
      setErrorMessage(error.message);
    }
  });

  const handleAllow = () => {
    setErrorMessage(null);
    const uid = interactionUid();
    if (!uid) {
      setErrorMessage(t("consent.missingInteraction"));
      return;
    }

    void allowConsent({ uid, remember: remember() });
  };

  const handleDeny = () => {
    setErrorMessage(null);
    const uid = interactionUid();
    if (!uid) {
      setErrorMessage(t("consent.missingInteraction"));
      return;
    }

    void denyConsent({ uid });
  };

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-md">
        <Show
          when={!details.loading && details.error}
          fallback={
            <Show
              when={details()}
              fallback={
                <p class="text-center text-forest-600">{t("common.loading")}</p>
              }
            >
              {(prompt) => (
                <>
                  <h1 class="h3 text-center">{t("consent.title")}</h1>
                  <p class="mt-2 text-center text-forest-600">
                    {t("consent.subtitle", prompt().clientName)}
                  </p>

                  <Show when={prompt().clientDescription}>
                    <p class="mt-4 text-sm text-forest-700">
                      {prompt().clientDescription}
                    </p>
                  </Show>

                  <div class="mt-6 rounded-xl border border-forest-200 bg-white px-4 py-3">
                    <p class="text-sm font-medium text-forest-900">
                      {t("consent.requestedAccess")}
                    </p>
                    <ul class="mt-3 space-y-2 text-sm text-forest-700">
                      <For each={prompt().scopes}>
                        {(scope) => <li>{scopeLabel(scope, t)}</li>}
                      </For>
                    </ul>
                  </div>

                  <label class="mt-6 flex items-start gap-3 text-sm text-forest-700">
                    <input
                      type="checkbox"
                      class="mt-1"
                      checked={remember()}
                      onChange={(event) => setRemember(event.currentTarget.checked)}
                      disabled={allowSubmission.pending || denySubmission.pending}
                    />
                    <span>{t("consent.remember")}</span>
                  </label>

                  <Show when={errorMessage()}>
                    <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                      {errorMessage()}
                    </div>
                  </Show>

                  <div class="mt-8 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      class="flex-1"
                      onClick={handleDeny}
                      loading={denySubmission.pending}
                      disabled={allowSubmission.pending || denySubmission.pending}
                    >
                      {t("consent.deny")}
                    </Button>
                    <Button
                      type="button"
                      class="flex-1"
                      onClick={handleAllow}
                      loading={allowSubmission.pending}
                      disabled={allowSubmission.pending || denySubmission.pending}
                    >
                      {t("consent.allow")}
                    </Button>
                  </div>
                </>
              )}
            </Show>
          }
        >
          <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {t("consent.loadFailed")}
          </div>
        </Show>
      </Card>
    </main>
  );
}
