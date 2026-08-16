import { A } from "@solidjs/router";
import { Button, Card } from "~/components/ui";
import { useI18n } from "~/i18n";

export default function ForgotPasswordPage() {
  const { t } = useI18n();

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-md text-center">
        <h1 class="h3">{t("auth.forgotPasswordTitle")}</h1>
        <p class="mt-4 text-forest-600">{t("auth.forgotPasswordStub")}</p>
        <A href="/login" class="mt-8 block">
          <Button type="button" class="w-full">
            {t("auth.backToSignIn")}
          </Button>
        </A>
      </Card>
    </main>
  );
}
