import { A, useAction, useSearchParams, useSubmission } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { createForm } from "@modular-forms/solid";
import { Button, Card, FieldGroup, Input, PasswordInput } from "~/components/ui";
import { ApiError } from "~/lib/api/types";
import { buildAuthPathWithReturnTo } from "~/lib/auth/return-to";
import { useI18n } from "~/i18n";
import {
  confirmResetSchema,
  requestResetSchema,
  verifyResetOtpSchema,
  type ConfirmResetFormData,
  type RequestResetFormData,
  type VerifyResetOtpFormData,
} from "~/schemas/password-reset.schema";
import {
  confirmResetAction,
  requestResetAction,
  verifyResetOtpAction,
} from "./forgot-password.actions";

type Step = "email" | "otp" | "password" | "success";

function isRateLimitError(error: ApiError): boolean {
  const data = error.data as { errorCode?: string } | undefined;
  return error.status === 429 || data?.errorCode === "TOO_MANY_REQUESTS";
}

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [step, setStep] = createSignal<Step>("email");
  const [requestToken, setRequestToken] = createSignal<string | null>(null);
  const [accessToken, setAccessToken] = createSignal<string | null>(null);
  const [email, setEmail] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const requestReset = useAction(requestResetAction);
  const requestSubmission = useSubmission(requestResetAction);
  const verifyOtp = useAction(verifyResetOtpAction);
  const verifySubmission = useSubmission(verifyResetOtpAction);
  const confirmReset = useAction(confirmResetAction);
  const confirmSubmission = useSubmission(confirmResetAction);

  const [, { Form: EmailForm, Field: EmailField }] = createForm<RequestResetFormData>({
    validate: (values) => {
      const result = requestResetSchema.safeParse(values);
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

  const [, { Form: OtpForm, Field: OtpField }] = createForm<VerifyResetOtpFormData>({
    validate: (values) => {
      const result = verifyResetOtpSchema.safeParse(values);
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

  const [, { Form: PasswordForm, Field: PasswordField }] =
    createForm<ConfirmResetFormData>({
      validate: (values) => {
        const result = confirmResetSchema.safeParse(values);
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

  const handleApiError = (error: unknown) => {
    if (error instanceof ApiError) {
      if (isRateLimitError(error)) {
        setErrorMessage(t("auth.passwordReset.rateLimited"));
        return;
      }
      const data = error.data as { message?: string } | undefined;
      setErrorMessage(data?.message || error.message);
      return;
    }
    if (error instanceof Error) {
      setErrorMessage(error.message);
    }
  };

  createEffect(() => {
    if (requestSubmission.result?.success) {
      setRequestToken(requestSubmission.result.token);
      setStep("otp");
      setErrorMessage(null);
    }
  });

  createEffect(() => {
    if (verifySubmission.result?.success) {
      setAccessToken(verifySubmission.result.token);
      setStep("password");
      setErrorMessage(null);
    }
  });

  createEffect(() => {
    if (confirmSubmission.result?.success) {
      setStep("success");
      setErrorMessage(null);
    }
  });

  createEffect(() => {
    const error =
      requestSubmission.error || verifySubmission.error || confirmSubmission.error;
    if (error) handleApiError(error);
  });

  const loginHref = () => buildAuthPathWithReturnTo("/login", searchParams.returnTo);

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-md">
        <Show when={step() === "success"}>
          <h1 class="h3 text-center">{t("auth.passwordReset.successTitle")}</h1>
          <p class="mt-4 text-center text-forest-600">
            {t("auth.passwordReset.successMessage")}
          </p>
          <A href={loginHref()} class="mt-8 block">
            <Button type="button" class="w-full">
              {t("auth.backToSignIn")}
            </Button>
          </A>
        </Show>

        <Show when={step() !== "success"}>
          <h1 class="h3 text-center">{t("auth.forgotPasswordTitle")}</h1>
          <p class="mt-2 text-center text-forest-600">
            {step() === "email" && t("auth.passwordReset.emailSubtitle")}
            {step() === "otp" && t("auth.passwordReset.otpSubtitle")}
            {step() === "password" && t("auth.passwordReset.passwordSubtitle")}
          </p>

          <Show when={errorMessage()}>
            <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMessage()}
            </div>
          </Show>

          <Show when={step() === "email"}>
            <EmailForm
              class="mt-8 space-y-4"
              onSubmit={(values) => {
                setErrorMessage(null);
                setEmail(values.email);
                requestReset(values);
              }}
            >
              <EmailField name="email" type="string">
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
                      value={field.value}
                      error={field.error}
                      showErrorMessage={false}
                      disabled={requestSubmission.pending}
                    />
                  </FieldGroup>
                )}
              </EmailField>

              <Button type="submit" class="w-full" loading={requestSubmission.pending}>
                {t("auth.passwordReset.sendCode")}
              </Button>
            </EmailForm>
          </Show>

          <Show when={step() === "otp"}>
            <p class="mt-4 text-center text-sm text-forest-700">{email()}</p>
            <OtpForm
              class="mt-6 space-y-4"
              onSubmit={(values) => {
                const token = requestToken();
                if (!token) {
                  setStep("email");
                  return;
                }
                setErrorMessage(null);
                verifyOtp({ ...values, requestToken: token });
              }}
            >
              <OtpField name="otp" type="string">
                {(field, props) => (
                  <FieldGroup
                    label={t("auth.passwordReset.otpLabel")}
                    requirement="required"
                    error={field.error}
                  >
                    <Input
                      {...props}
                      inputmode="numeric"
                      maxlength={6}
                      placeholder="123456"
                      value={field.value}
                      error={field.error}
                      showErrorMessage={false}
                      disabled={verifySubmission.pending}
                    />
                  </FieldGroup>
                )}
              </OtpField>

              <div class="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  class="flex-1"
                  onClick={() => setStep("email")}
                >
                  {t("auth.passwordReset.back")}
                </Button>
                <Button type="submit" class="flex-1" loading={verifySubmission.pending}>
                  {t("auth.passwordReset.verifyCode")}
                </Button>
              </div>
            </OtpForm>
          </Show>

          <Show when={step() === "password"}>
            <PasswordForm
              class="mt-8 space-y-4"
              onSubmit={(values) => {
                const token = accessToken();
                if (!token) {
                  setStep("otp");
                  return;
                }
                setErrorMessage(null);
                confirmReset({ ...values, accessToken: token });
              }}
            >
              <PasswordField name="password" type="string">
                {(field, props) => (
                  <FieldGroup
                    label={t("account.newPassword")}
                    requirement="required"
                    hint={t("auth.passwordHint")}
                    error={field.error}
                  >
                    <PasswordInput
                      {...props}
                      autocomplete="new-password"
                      value={field.value}
                      error={field.error}
                      showPasswordLabel={t("auth.showPassword")}
                      hidePasswordLabel={t("auth.hidePassword")}
                      disabled={confirmSubmission.pending}
                    />
                  </FieldGroup>
                )}
              </PasswordField>

              <PasswordField name="confirmPassword" type="string">
                {(field, props) => (
                  <FieldGroup
                    label={t("auth.confirmPassword")}
                    requirement="required"
                    error={field.error}
                  >
                    <PasswordInput
                      {...props}
                      autocomplete="new-password"
                      value={field.value}
                      error={field.error}
                      showPasswordLabel={t("auth.showPassword")}
                      hidePasswordLabel={t("auth.hidePassword")}
                      disabled={confirmSubmission.pending}
                    />
                  </FieldGroup>
                )}
              </PasswordField>

              <Button type="submit" class="w-full" loading={confirmSubmission.pending}>
                {t("auth.passwordReset.resetPassword")}
              </Button>
            </PasswordForm>
          </Show>

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
