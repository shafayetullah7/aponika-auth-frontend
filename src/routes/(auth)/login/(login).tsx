import { A, useAction, useSearchParams, useSubmission } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { createForm } from "@modular-forms/solid";
import { ApiHealthStatus } from "~/components/ApiHealthStatus";
import { Button, Card, FieldGroup, Input, PasswordInput } from "~/components/ui";
import { getLoginErrorState } from "~/lib/auth/login-errors";
import { safeReturnTo, buildAuthPathWithReturnTo } from "~/lib/auth/return-to";
import { useI18n } from "~/i18n";
import { loginSchema, type LoginFormData } from "~/schemas/login.schema";
import { loginAction } from "./login.actions";

function readQueryFlag(value: string | string[] | undefined): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1" || raw === "true";
}

export default function LoginPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const loginTrigger = useAction(loginAction);
  const submission = useSubmission(loginAction);
  const [errorKind, setErrorKind] = createSignal<
    ReturnType<typeof getLoginErrorState>["kind"] | null
  >(null);

  const [, { Form, Field }] = createForm<LoginFormData>({
    validate: (values) => {
      const result = loginSchema.safeParse(values);
      if (result.success) return {};
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          errors[issue.path.join(".")] = issue.message;
        }
      });
      return errors;
    },
  });

  createEffect(() => {
    if (!submission.error) return;

    const state = getLoginErrorState(submission.error);
    setErrorKind(state.kind);
  });

  createEffect(() => {
    if (submission.result?.success) {
      window.location.assign(submission.result.target || "/account");
    }
  });

  const handleSubmit = (values: LoginFormData) => {
    setErrorKind(null);
    loginTrigger({
      ...values,
      returnTo: safeReturnTo(searchParams.returnTo),
    });
  };

  const errorMessage = () => {
    const kind = errorKind();
    if (!kind) return null;

    if (kind === "rate_limited") {
      return t("auth.loginRateLimited");
    }

    if (kind === "invalid_credentials") {
      return t("auth.loginInvalidCredentials");
    }

    return t("auth.loginFailed");
  };

  const registerHref = () =>
    buildAuthPathWithReturnTo("/register", searchParams.returnTo);

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-md">
        <h1 class="h3 text-center">{t("auth.loginTitle")}</h1>
        <p class="mt-2 text-center text-forest-600">{t("auth.loginSubtitle")}</p>

        <Show when={readQueryFlag(searchParams.verified)}>
          <div class="mt-4 rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
            {t("auth.verifiedBanner")}
          </div>
        </Show>

        <Show when={errorMessage()}>
          <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p>{errorMessage()}</p>
            <Show when={errorKind() === "invalid_credentials"}>
              <p class="mt-2 text-red-700">{t("auth.unverifiedEmailHint")}</p>
            </Show>
          </div>
        </Show>

        <Form class="mt-8 space-y-4" onSubmit={handleSubmit}>
          <Field name="email" type="string">
            {(field, props) => (
              <FieldGroup
                label={t("auth.email")}
                requirement="required"
                hint={t("auth.emailHint")}
                error={field.error}
              >
                <Input
                  {...props}
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                  value={field.value}
                  disabled={submission.pending}
                />
              </FieldGroup>
            )}
          </Field>

          <Field name="password" type="string">
            {(field, props) => (
              <FieldGroup
                label={t("auth.password")}
                requirement="required"
                error={field.error}
              >
                <PasswordInput
                  {...props}
                  autocomplete="current-password"
                  placeholder="••••••••"
                  value={field.value}
                  error={field.error}
                  disabled={submission.pending}
                />
              </FieldGroup>
            )}
          </Field>

          <div class="text-right">
            <A
              href="/forgot-password"
              class="text-sm font-medium text-forest-700 hover:text-forest-900"
            >
              {t("auth.forgotPassword")}
            </A>
          </div>

          <Button
            type="submit"
            class="w-full"
            loading={submission.pending}
            disabled={submission.pending}
          >
            {submission.pending ? t("auth.signingIn") : t("auth.signIn")}
          </Button>
        </Form>

        <div class="mt-4">
          <ApiHealthStatus />
        </div>

        <p class="mt-6 text-center text-sm text-forest-600">
          {t("auth.needAccount")}{" "}
          <A href={registerHref()} class="font-semibold text-forest-700 hover:text-forest-800">
            {t("auth.signUp")}
          </A>
        </p>
      </Card>
    </main>
  );
}
