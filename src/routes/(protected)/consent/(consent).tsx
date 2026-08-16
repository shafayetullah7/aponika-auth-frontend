import { useAction, useSearchParams, useSubmission } from "@solidjs/router";
import { createEffect, createSignal, For, onMount, Show } from "solid-js";
import type { Component } from "solid-js";
import {
  EnvelopeIcon,
  KeyIcon,
  UserCircleIcon,
} from "~/components/icons/consent-scope.icons";
import type { IconProps } from "~/components/icons/types";
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

function scopeIcon(scope: string): Component<IconProps> {
  switch (scope) {
    case "email":
      return EnvelopeIcon;
    case "profile":
      return UserCircleIcon;
    default:
      return KeyIcon;
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
  const [details, setDetails] = createSignal<
    Awaited<ReturnType<typeof oauthConsentApi.getInteraction>> | undefined
  >();
  const [loadingDetails, setLoadingDetails] = createSignal(true);
  const [loadError, setLoadError] = createSignal<Error | undefined>();

  // OIDC interaction cookies are set on the issuer host (:3010). SSR on :3011
  // cannot forward them, so load consent details in the browser only.
  onMount(() => {
    const uid = interactionUid();
    if (!uid) {
      setLoadError(new Error("Missing interaction id"));
      setLoadingDetails(false);
      return;
    }

    void oauthConsentApi
      .getInteraction(uid)
      .then((prompt) => {
        setDetails(prompt);
        setLoadError(undefined);
      })
      .catch((error: unknown) => {
        setLoadError(
          error instanceof Error ? error : new Error("Failed to load consent"),
        );
      })
      .finally(() => {
        setLoadingDetails(false);
      });
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
          when={!loadingDetails() && loadError()}
          fallback={
            <Show
              when={details()}
              fallback={
                <p class="text-center text-forest-600">{t("common.loading")}</p>
              }
            >
              {(prompt) => (
                <>
                  <div class="flex flex-col items-center text-center">
                    <div
                      class="flex size-14 items-center justify-center rounded-2xl border border-forest-200 bg-forest-50 text-lg font-bold text-forest-700"
                      aria-hidden="true"
                    >
                      {prompt().clientName.slice(0, 1).toUpperCase()}
                    </div>
                    <h1 class="h3 mt-4">{t("consent.title")}</h1>
                    <p class="mt-2 text-forest-600">
                      {t("consent.subtitle", prompt().clientName)}
                    </p>
                  </div>

                  <Show when={prompt().clientDescription}>
                    <p class="mt-4 text-sm text-forest-700">
                      {prompt().clientDescription}
                    </p>
                  </Show>

                  <div class="mt-6 rounded-xl border border-forest-200 bg-white px-4 py-3">
                    <p class="text-sm font-medium text-forest-900">
                      {t("consent.requestedAccess")}
                    </p>
                    <ul class="mt-3 space-y-3 text-sm text-forest-700">
                      <For each={prompt().scopes}>
                        {(scope) => {
                          const Icon = scopeIcon(scope);
                          return (
                            <li class="flex items-start gap-3">
                              <Icon class="mt-0.5 size-5 shrink-0 text-forest-600" />
                              <span>{scopeLabel(scope, t)}</span>
                            </li>
                          );
                        }}
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
                    <span>
                      {t("consent.remember")}
                      <span class="mt-1 block text-xs text-forest-600">
                        {t("consent.rememberHint")}
                      </span>
                    </span>
                  </label>

                  <p class="mt-4 text-xs text-forest-600">{t("consent.denyHint")}</p>

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
            {loadError()?.message || t("consent.loadFailed")}
          </div>
        </Show>
      </Card>
    </main>
  );
}
