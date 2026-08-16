import { A, useAction, useSearchParams, useSubmission } from "@solidjs/router";
import { createEffect, createSignal, onMount, Show } from "solid-js";
import { Button, Card } from "~/components/ui";
import { ApiError } from "~/lib/api/types";
import { useI18n } from "~/i18n";
import { buildAuthPathWithReturnTo } from "~/lib/auth/return-to";
import { verifyEmailAction } from "./verify-email.actions";

function readTokenParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

export default function VerifyEmailPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const verifyTrigger = useAction(verifyEmailAction);
  const submission = useSubmission(verifyEmailAction);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
  const [hasStarted, setHasStarted] = createSignal(false);

  onMount(() => {
    const token = readTokenParam(searchParams.token);
    if (!token) {
      setErrorMessage(t("verify.missingToken"));
      return;
    }

    setHasStarted(true);
    verifyTrigger(token);
  });

  createEffect(() => {
    if (!submission.error) return;

    const error = submission.error as ApiError | Error;
    if (error instanceof ApiError) {
      const data = error.data as { message?: string } | undefined;
      setErrorMessage(data?.message || error.message || t("verify.failed"));
      return;
    }

    setErrorMessage(error.message || t("verify.failed"));
  });

  const isLoading = () =>
    hasStarted() && submission.pending && !submission.result && !errorMessage();

  const isSuccess = () => submission.result?.success === true;

  const loginHref = () => buildAuthPathWithReturnTo("/login", searchParams.returnTo);

  const loginSuccessHref = () => {
    const path = buildAuthPathWithReturnTo("/login", searchParams.returnTo);
    const url = new URL(path, "http://local");
    url.searchParams.set("verified", "1");
    return `${url.pathname}${url.search}`;
  };

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-md text-center">
        <Show when={isLoading()}>
          <h1 class="h3">{t("verify.title")}</h1>
          <p class="mt-4 text-forest-600">{t("verify.verifying")}</p>
          <div class="mt-8 flex justify-center">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-forest-600 border-t-transparent" />
          </div>
        </Show>

        <Show when={isSuccess()}>
          <h1 class="h3">{t("verify.successTitle")}</h1>
          <p class="mt-4 text-forest-600">{t("verify.successMessage")}</p>
          <A href={loginSuccessHref()} class="mt-8 block">
            <Button type="button" class="w-full">
              {t("verify.successAction")}
            </Button>
          </A>
        </Show>

        <Show when={!isLoading() && !isSuccess() && errorMessage()}>
          <h1 class="h3">{t("verify.failedTitle")}</h1>
          <p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMessage()}
          </p>
          <div class="mt-8 flex flex-col gap-3">
            <A href="/register">
              <Button type="button" variant="secondary" class="w-full">
                {t("auth.signUp")}
              </Button>
            </A>
            <A href={loginHref()}>
              <Button type="button" class="w-full">
                {t("auth.backToSignIn")}
              </Button>
            </A>
          </div>
        </Show>
      </Card>
    </main>
  );
}
