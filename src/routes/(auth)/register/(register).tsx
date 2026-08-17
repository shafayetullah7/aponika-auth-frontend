import { A, useAction, useSearchParams, useSubmission } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { createForm } from "@modular-forms/solid";
import { Button, Card, FieldGroup, Input, PasswordInput } from "~/components/ui";
import { type RegisterErrorKind } from "~/lib/auth/register-errors";
import { buildAuthPathWithReturnTo, buildResendVerificationHref } from "~/lib/auth/return-to";
import { useI18n } from "~/i18n";
import { registerSchema, type RegisterFormData } from "~/schemas/register.schema";
import { registerAction } from "./register.actions";

export default function RegisterPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const registerTrigger = useAction(registerAction);
  const submission = useSubmission(registerAction);
  const [errorKind, setErrorKind] = createSignal<RegisterErrorKind | null>(null);
  const [resultMessage, setResultMessage] = createSignal<string | undefined>();
  const [registeredEmail, setRegisteredEmail] = createSignal<string | null>(null);

  const [, { Form, Field }] = createForm<RegisterFormData>({
    validate: (values) => {
      const result = registerSchema.safeParse(values);
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
    const result = submission.result;
    if (!result) return;

    if (result.success) {
      setRegisteredEmail(result.email);
      setErrorKind(null);
      setResultMessage(undefined);
      return;
    }

    setErrorKind(result.kind);
    setResultMessage(result.message);
  });

  const errorMessage = () => {
    const kind = errorKind();
    if (!kind) return null;

    if (kind === "rate_limited") {
      return t("auth.registerRateLimited");
    }

    if (kind === "email_taken") {
      return resultMessage() || t("auth.registerEmailTaken");
    }

    return resultMessage() || t("auth.registerFailed");
  };

  const handleSubmit = (values: RegisterFormData) => {
    setErrorKind(null);
    setResultMessage(undefined);
    registerTrigger(values);
  };

  const loginHref = () => buildAuthPathWithReturnTo("/login", searchParams.returnTo);

  const resendVerificationHref = () =>
    buildResendVerificationHref({
      returnTo: searchParams.returnTo,
      email: registeredEmail() ?? undefined,
    });

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-md">
        <Show
          when={!registeredEmail()}
          fallback={
            <>
              <h1 class="h3 text-center">{t("auth.registerSuccessTitle")}</h1>
              <p class="mt-4 text-center text-forest-600">
                {t("auth.registerSuccessMessage")}
              </p>
              <p class="mt-4 rounded-xl bg-forest-50 px-4 py-3 text-center text-sm font-medium text-forest-800">
                {registeredEmail()}
              </p>
              <p class="mt-4 text-center text-sm text-forest-600">
                {t("auth.checkEmailHint")}
              </p>
              <A href={resendVerificationHref()} class="mt-4 block">
                <Button type="button" variant="secondary" class="w-full">
                  {t("auth.resendVerificationButton")}
                </Button>
              </A>
              <A href={loginHref()} class="mt-4 block">
                <Button type="button" class="w-full">
                  {t("auth.backToSignIn")}
                </Button>
              </A>
            </>
          }
        >
          <h1 class="h3 text-center">{t("auth.registerTitle")}</h1>
          <p class="mt-2 text-center text-forest-600">{t("auth.registerSubtitle")}</p>

          <Show when={errorMessage()}>
            <p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-800">
              {errorMessage()}
            </p>
          </Show>

          <Form class="mt-8 space-y-4" onSubmit={handleSubmit}>
            <Field name="name" type="string">
              {(field, props) => (
                <FieldGroup
                  label={t("auth.name")}
                  requirement="required"
                  error={field.error}
                >
                  <Input
                    {...props}
                    autocomplete="name"
                    placeholder="Jane Doe"
                    value={field.value}
                    error={field.error}
                    showErrorMessage={false}
                    disabled={submission.pending}
                  />
                </FieldGroup>
              )}
            </Field>

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
                    error={field.error}
                    showErrorMessage={false}
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
                  hint={t("auth.passwordHint")}
                  error={field.error}
                >
                  <PasswordInput
                    {...props}
                    autocomplete="new-password"
                    placeholder="••••••••"
                    value={field.value}
                    error={field.error}
                    showPasswordLabel={t("auth.showPassword")}
                    hidePasswordLabel={t("auth.hidePassword")}
                    disabled={submission.pending}
                  />
                </FieldGroup>
              )}
            </Field>

            <Field name="confirmPassword" type="string">
              {(field, props) => (
                <FieldGroup
                  label={t("auth.confirmPassword")}
                  requirement="required"
                  error={field.error}
                >
                  <PasswordInput
                    {...props}
                    autocomplete="new-password"
                    placeholder="••••••••"
                    value={field.value}
                    error={field.error}
                    showPasswordLabel={t("auth.showPassword")}
                    hidePasswordLabel={t("auth.hidePassword")}
                    disabled={submission.pending}
                  />
                </FieldGroup>
              )}
            </Field>

            <Button
              type="submit"
              class="w-full"
              loading={submission.pending}
              disabled={submission.pending}
            >
              {submission.pending ? t("auth.registering") : t("auth.signUp")}
            </Button>
          </Form>

          <p class="mt-6 text-center text-sm text-forest-600">
            {t("auth.haveAccount")}{" "}
            <A href={loginHref()} class="font-semibold text-forest-700 hover:text-forest-800">
              {t("auth.signIn")}
            </A>
          </p>
        </Show>
      </Card>
    </main>
  );
}
