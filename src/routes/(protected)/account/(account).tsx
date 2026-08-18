import { useAction, useSubmission } from "@solidjs/router";
import { createEffect, createSignal, For, onMount, Show } from "solid-js";
import { createForm } from "@modular-forms/solid";
import { Button, Card, FieldGroup, Input, PasswordInput } from "~/components/ui";
import { ApiError } from "~/lib/api/types";
import { logoutAction, useSession } from "~/lib/auth";
import { useI18n } from "~/i18n";
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordFormData,
  type UpdateProfileFormData,
} from "~/schemas/account.schema";
import { changePasswordAction, updateProfileAction } from "./account.actions";
import {
  oauthConsentApi,
  type OidcRememberedConsent,
} from "~/lib/api/oauth-consent.api";

export default function AccountPage() {
  const { t } = useI18n();
  const user = useSession();
  const logout = useAction(logoutAction);
  const logoutSubmission = useSubmission(logoutAction);
  const updateProfile = useAction(updateProfileAction);
  const updateProfileSubmission = useSubmission(updateProfileAction);
  const changePassword = useAction(changePasswordAction);
  const changePasswordSubmission = useSubmission(changePasswordAction);

  const [profileMessage, setProfileMessage] = createSignal<string | null>(null);
  const [profileError, setProfileError] = createSignal<string | null>(null);
  const [passwordMessage, setPasswordMessage] = createSignal<string | null>(null);
  const [passwordError, setPasswordError] = createSignal<string | null>(null);
  const [consents, setConsents] = createSignal<OidcRememberedConsent[]>([]);
  const [consentsError, setConsentsError] = createSignal<string | null>(null);
  const [consentsMessage, setConsentsMessage] = createSignal<string | null>(null);
  const [revokingClientId, setRevokingClientId] = createSignal<string | null>(
    null,
  );

  onMount(() => {
    void oauthConsentApi
      .list()
      .then((rows) => {
        setConsents(rows);
        setConsentsError(null);
      })
      .catch(() => setConsentsError(t("account.appsLoadFailed")));
  });

  const handleRevokeConsent = (clientId: string) => {
    setConsentsMessage(null);
    setRevokingClientId(clientId);
    void oauthConsentApi
      .revoke(clientId)
      .then(() => {
        setConsents((current) =>
          current.filter((row) => row.clientId !== clientId),
        );
        setConsentsMessage(t("account.appsRevoked"));
      })
      .catch(() => setConsentsError(t("account.appsLoadFailed")))
      .finally(() => setRevokingClientId(null));
  };

  const [, { Form: ProfileForm, Field: ProfileField }] =
    createForm<UpdateProfileFormData>({
      validate: (values) => {
        const result = updateProfileSchema.safeParse(values);
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
    createForm<ChangePasswordFormData>({
      validate: (values) => {
        const result = changePasswordSchema.safeParse(values);
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
    const currentUser = user();
    if (currentUser?.displayName) {
      // Profile form initial values are set once; user can edit from session.
    }
  });

  createEffect(() => {
    if (updateProfileSubmission.result?.success) {
      setProfileMessage(t("account.profileUpdated"));
      setProfileError(null);
    }
  });

  createEffect(() => {
    if (!updateProfileSubmission.error) return;
    const error = updateProfileSubmission.error as ApiError | Error;
    if (error instanceof ApiError) {
      const data = error.data as { message?: string } | undefined;
      setProfileError(data?.message || error.message);
      return;
    }
    setProfileError(error.message);
  });

  createEffect(() => {
    if (changePasswordSubmission.result?.success) {
      setPasswordMessage(t("account.passwordChanged"));
      setPasswordError(null);
    }
  });

  createEffect(() => {
    if (!changePasswordSubmission.error) return;
    const error = changePasswordSubmission.error as ApiError | Error;
    if (error instanceof ApiError) {
      const data = error.data as { message?: string } | undefined;
      if (error.status === 401) {
        setPasswordError(t("account.wrongCurrentPassword"));
        return;
      }
      setPasswordError(data?.message || error.message);
      return;
    }
    setPasswordError(error.message);
  });

  const handleProfileSubmit = (values: UpdateProfileFormData) => {
    setProfileMessage(null);
    setProfileError(null);
    updateProfile(values);
  };

  const handlePasswordSubmit = (values: ChangePasswordFormData) => {
    setPasswordMessage(null);
    setPasswordError(null);
    changePassword(values);
  };

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-lg">
        <h1 class="h3 text-center">{t("account.title")}</h1>
        <p class="mt-2 text-center text-forest-600">{t("account.subtitle")}</p>

        <Show when={user()}>
          {(currentUser) => (
            <p class="mt-4 text-center text-sm text-forest-700">
              {currentUser().email}
            </p>
          )}
        </Show>

        <section class="mt-8 space-y-4 rounded-xl border border-forest-200 bg-white p-4">
          <h2 class="text-sm font-semibold text-forest-900">{t("account.profileSection")}</h2>

          <Show when={profileMessage()}>
            <div class="rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-sm text-forest-800">
              {profileMessage()}
            </div>
          </Show>

          <Show when={profileError()}>
            <div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {profileError()}
            </div>
          </Show>

          <ProfileForm onSubmit={handleProfileSubmit} class="space-y-4">
            <ProfileField name="name" type="string">
              {(field, props) => (
                <FieldGroup
                  label={t("account.name")}
                  requirement="required"
                  error={field.error}
                >
                  <Input
                    {...props}
                    autocomplete="name"
                    value={field.value ?? user()?.displayName ?? ""}
                    error={field.error}
                    showErrorMessage={false}
                    disabled={updateProfileSubmission.pending}
                  />
                </FieldGroup>
              )}
            </ProfileField>

            <Button
              type="submit"
              loading={updateProfileSubmission.pending}
              disabled={updateProfileSubmission.pending}
            >
              {t("account.saveProfile")}
            </Button>
          </ProfileForm>
        </section>

        <section class="mt-6 space-y-4 rounded-xl border border-forest-200 bg-white p-4">
          <h2 class="text-sm font-semibold text-forest-900">{t("account.passwordSection")}</h2>

          <Show when={passwordMessage()}>
            <div class="rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-sm text-forest-800">
              {passwordMessage()}
            </div>
          </Show>

          <Show when={passwordError()}>
            <div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {passwordError()}
            </div>
          </Show>

          <PasswordForm onSubmit={handlePasswordSubmit} class="space-y-4">
            <PasswordField name="currentPassword" type="string">
              {(field, props) => (
                <FieldGroup
                  label={t("account.currentPassword")}
                  requirement="required"
                  error={field.error}
                >
                  <PasswordInput
                    {...props}
                    autocomplete="current-password"
                    value={field.value}
                    error={field.error}
                    showPasswordLabel={t("auth.showPassword")}
                    hidePasswordLabel={t("auth.hidePassword")}
                    disabled={changePasswordSubmission.pending}
                  />
                </FieldGroup>
              )}
            </PasswordField>

            <PasswordField name="newPassword" type="string">
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
                    disabled={changePasswordSubmission.pending}
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
                    disabled={changePasswordSubmission.pending}
                  />
                </FieldGroup>
              )}
            </PasswordField>

            <Button
              type="submit"
              variant="secondary"
              loading={changePasswordSubmission.pending}
              disabled={changePasswordSubmission.pending}
            >
              {t("account.changePassword")}
            </Button>
          </PasswordForm>
        </section>

        <section class="mt-6 space-y-4 rounded-xl border border-forest-200 bg-white p-4">
          <h2 class="text-sm font-semibold text-forest-900">{t("account.appsSection")}</h2>

          <Show when={consentsMessage()}>
            <div class="rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-sm text-forest-800">
              {consentsMessage()}
            </div>
          </Show>

          <Show when={consentsError()}>
            <div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {consentsError()}
            </div>
          </Show>

          <Show
            when={consents().length > 0}
            fallback={
              <p class="text-sm text-forest-600">{t("account.appsEmpty")}</p>
            }
          >
            <ul class="space-y-3">
              <For each={consents()}>
                {(row) => (
                  <li class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm font-medium text-forest-900">
                        {row.clientName}
                      </p>
                      <p class="text-xs text-forest-600">{row.clientId}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRevokeConsent(row.clientId)}
                      loading={revokingClientId() === row.clientId}
                      disabled={revokingClientId() !== null}
                    >
                      {t("account.appsRevoke")}
                    </Button>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </section>

        <Button
          type="button"
          variant="outline"
          class="mt-8 w-full"
          disabled={logoutSubmission.pending}
          onClick={() => logout()}
        >
          {t("account.signOut")}
        </Button>
      </Card>
    </main>
  );
}
