import { A, useAction, useSubmission } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { createForm } from "@modular-forms/solid";
import { Button, Card, FieldGroup, Input } from "~/components/ui";
import { ApiError } from "~/lib/api/types";
import { useI18n } from "~/i18n";
import { registerSchema, type RegisterFormData } from "~/schemas/register.schema";
import { registerAction } from "./register.actions";

export default function RegisterPage() {
  const { t } = useI18n();
  const registerTrigger = useAction(registerAction);
  const submission = useSubmission(registerAction);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
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
    if (submission.result?.success) {
      setRegisteredEmail(submission.result.email);
      setErrorMessage(null);
    }
  });

  createEffect(() => {
    if (!submission.error) return;

    const error = submission.error as ApiError | Error;
    if (error instanceof ApiError) {
      const data = error.data as { message?: string } | undefined;
      setErrorMessage(data?.message || error.message || t("auth.registerFailed"));
      return;
    }

    setErrorMessage(error.message || t("auth.registerFailed"));
  });

  const handleSubmit = (values: RegisterFormData) => {
    setErrorMessage(null);
    registerTrigger(values);
  };

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
              <A href="/login" class="mt-8 block">
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
                  <Input
                    {...props}
                    type="password"
                    autocomplete="new-password"
                    placeholder="••••••••"
                    value={field.value}
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
                  <Input
                    {...props}
                    type="password"
                    autocomplete="new-password"
                    placeholder="••••••••"
                    value={field.value}
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
            <A href="/login" class="font-semibold text-forest-700 hover:text-forest-800">
              {t("auth.signIn")}
            </A>
          </p>
        </Show>
      </Card>
    </main>
  );
}
