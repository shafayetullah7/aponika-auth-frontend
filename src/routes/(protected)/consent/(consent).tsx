import { useSearchParams } from "@solidjs/router";
import { createSignal, For, onMount, Show } from "solid-js";
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

function replaceLocation(url: string): void {
  window.location.replace(url);
}

const CONSENT_ABORT_FALLBACK = "/oauth/error?error=interaction_expired";

export default function ConsentPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const returnTo = () => safeReturnTo(searchParams.returnTo, "/account");
  const interactionUid = () =>
    extractInteractionUidFromReturnTo(returnTo()) ?? "";
  const [remember, setRemember] = createSignal(true);
  const [decisionPending, setDecisionPending] = createSignal(false);
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
      replaceLocation(CONSENT_ABORT_FALLBACK);
      setLoadingDetails(false);
      return;
    }

    void oauthConsentApi
      .getInteraction(uid)
      .then((prompt) => {
        if (prompt.autoRedirectUrl) {
          replaceLocation(prompt.autoRedirectUrl);
          return;
        }

        setDetails(prompt);
        setLoadError(undefined);
      })
      .catch(() => {
        replaceLocation(CONSENT_ABORT_FALLBACK);
      })
      .finally(() => {
        setLoadingDetails(false);
      });
  });

  const handleAllow = () => {
    const uid = interactionUid();
    if (!uid) {
      replaceLocation(CONSENT_ABORT_FALLBACK);
      return;
    }

    setDecisionPending(true);
    void oauthConsentApi
      .allow(uid, { remember: remember() })
      .then((result) => {
        replaceLocation(result.redirectUrl);
      })
      .catch(() => {
        replaceLocation(details()?.abortRedirectUrl ?? CONSENT_ABORT_FALLBACK);
      });
  };

  const handleDeny = () => {
    const uid = interactionUid();
    if (!uid) {
      replaceLocation(CONSENT_ABORT_FALLBACK);
      return;
    }

    setDecisionPending(true);
    void oauthConsentApi
      .deny(uid)
      .then((result) => {
        replaceLocation(result.redirectUrl);
      })
      .catch(() => {
        replaceLocation(details()?.abortRedirectUrl ?? CONSENT_ABORT_FALLBACK);
      });
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
                      {t("consent.subtitle", {
                        clientName: prompt().clientName,
                      })}
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
                      disabled={decisionPending()}
                    />
                    <span>
                      {t("consent.remember")}
                      <span class="mt-1 block text-xs text-forest-600">
                        {t("consent.rememberHint")}
                      </span>
                    </span>
                  </label>

                  <p class="mt-4 text-xs text-forest-600">{t("consent.denyHint")}</p>

                  <div class="mt-8 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      class="flex-1"
                      onClick={handleDeny}
                      loading={decisionPending()}
                      disabled={decisionPending()}
                    >
                      {t("consent.deny")}
                    </Button>
                    <Button
                      type="button"
                      class="flex-1"
                      onClick={handleAllow}
                      loading={decisionPending()}
                      disabled={decisionPending()}
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
