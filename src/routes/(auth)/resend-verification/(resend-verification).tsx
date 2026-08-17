import { A, useAction, useSearchParams, useSubmission } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { createForm } from "@modular-forms/solid";
import { Button, Card, FieldGroup, Input } from "~/components/ui";
import { type LoginErrorKind } from "~/lib/auth/login-errors";
import { buildAuthPathWithReturnTo } from "~/lib/auth/return-to";
import { useI18n } from "~/i18n";
import {
  resendVerificationSchema,
  type ResendVerificationFormData,
} from "~/schemas/resend-verification.schema";
import { resendVerificationAction } from "./resend-verification.actions";

function readEmailParam(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

export default function ResendVerificationPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const resendTrigger = useAction(resendVerificationAction);
  const submission = useSubmission(resendVerificationAction);
  const [errorKind, setErrorKind] = createSignal<LoginErrorKind | null>(null);
  const [submitted, setSubmitted] = createSignal(false);

  const [, { Form, Field }] = createForm<ResendVerificationFormData>({
    initialValues: {
      email: readEmailParam(searchParams.email),
    },
    validate: (values) => {
      const result = resendVerificationSchema.safeParse(values);
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
      setSubmitted(true);
      setErrorKind(null);
      return;
    }

    setErrorKind(result.kind);
    setSubmitted(false);
  });

  const handleSubmit = (values: ResendVerificationFormData) => {
    setErrorKind(null);
    setSubmitted(false);
    resendTrigger({ email: values.email });
  };

  const errorMessage = () => {
    const kind = errorKind();
    if (!kind) return null;

    if (kind === "rate_limited") {
      return t("auth.resendVerification.rateLimited");
    }

    return t("auth.resendVerification.failed");
  };

  const loginHref = () => buildAuthPathWithReturnTo("/login", searchParams.returnTo);

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-md">
        <Show
          when={!submitted()}
          fallback={
            <>
              <h1 class="h3 text-center">{t("auth.resendVerification.successTitle")}</h1>
              <p class="mt-4 text-center text-forest-600">
                {t("auth.resendVerification.successMessage")}
              </p>
              <A href={loginHref()} class="mt-8 block">
                <Button type="button" class="w-full">
                  {t("auth.backToSignIn")}
                </Button>
              </A>
            </>
          }
        >
          <h1 class="h3 text-center">{t("auth.resendVerification.title")}</h1>
          <p class="mt-2 text-center text-forest-600">
            {t("auth.resendVerification.subtitle")}
          </p>

          <Show when={errorMessage()}>
            <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMessage()}
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
                    error={field.error}
                    showErrorMessage={false}
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
              {submission.pending
                ? t("auth.resendVerification.sending")
                : t("auth.resendVerification.submit")}
            </Button>
          </Form>

          <p class="mt-6 text-center text-sm text-forest-600">
            <A href={loginHref()} class="font-semibold text-forest-700 hover:text-forest-800">
              {t("auth.backToSignIn")}
            </A>
          </p>
        </Show>
      </Card>
    </main>
  );
}
