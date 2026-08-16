import { useAction, useSubmission } from "@solidjs/router";
import { Show } from "solid-js";
import { Button, Card } from "~/components/ui";
import { logoutAction, useSession } from "~/lib/auth";
import { useI18n } from "~/i18n";

export default function AccountPage() {
  const { t } = useI18n();
  const user = useSession();
  const logout = useAction(logoutAction);
  const logoutSubmission = useSubmission(logoutAction);

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-md">
        <h1 class="h3 text-center">{t("account.title")}</h1>
        <p class="mt-2 text-center text-forest-600">{t("account.subtitle")}</p>

        <Show when={user()}>
          {(currentUser) => (
            <dl class="mt-8 space-y-3 rounded-xl bg-forest-50 px-4 py-4 text-sm">
              <div>
                <dt class="font-medium text-forest-700">{t("auth.email")}</dt>
                <dd class="text-forest-900">{currentUser().email}</dd>
              </div>
              <Show when={currentUser().displayName}>
                <div>
                  <dt class="font-medium text-forest-700">{t("account.name")}</dt>
                  <dd class="text-forest-900">{currentUser().displayName}</dd>
                </div>
              </Show>
            </dl>
          )}
        </Show>

        <Button
          type="button"
          variant="secondary"
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
