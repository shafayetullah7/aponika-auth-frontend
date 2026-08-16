import { A } from "@solidjs/router";
import { Button, Card, FieldGroup, Input } from "~/components/ui";
import { useI18n } from "~/i18n";

export default function LoginPage() {
  const { t } = useI18n();

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-md">
        <h1 class="h3 text-center">{t("auth.loginTitle")}</h1>
        <p class="mt-2 text-center text-forest-600">{t("auth.loginSubtitle")}</p>

        <div class="mt-8 space-y-4">
          <FieldGroup
            label={t("auth.email")}
            requirement="required"
            hint={t("auth.emailHint")}
          >
            <Input
              type="email"
              name="email"
              autocomplete="email"
              placeholder="you@example.com"
              disabled
            />
          </FieldGroup>

          <FieldGroup label={t("auth.password")} requirement="required">
            <Input
              type="password"
              name="password"
              autocomplete="current-password"
              placeholder="••••••••"
              disabled
            />
          </FieldGroup>

          <Button type="button" class="w-full" disabled>
            {t("auth.signIn")}
          </Button>
        </div>

        <p class="mt-6 rounded-xl bg-forest-50 px-4 py-3 text-center text-sm text-forest-700">
          {t("auth.placeholder")}
        </p>

        <p class="mt-6 text-center text-sm text-forest-600">
          {t("auth.signUp")}?{" "}
          <A href="/register" class="font-semibold text-forest-700 hover:text-forest-800">
            {t("auth.signUp")}
          </A>
        </p>
      </Card>
    </main>
  );
}
