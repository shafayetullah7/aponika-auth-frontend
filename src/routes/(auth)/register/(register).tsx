import { A } from "@solidjs/router";
import { useI18n } from "~/i18n";

export default function RegisterPage() {
  const { t } = useI18n();

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <div class="flat-card w-full max-w-md p-8 text-center">
        <h1 class="h3">{t("auth.registerTitle")}</h1>
        <p class="mt-2 text-forest-600">{t("auth.registerSubtitle")}</p>
        <p class="mt-6 rounded-xl bg-sage-50 px-4 py-3 text-sm text-sage-600">
          {t("auth.placeholder")}
        </p>
        <p class="mt-6 text-sm text-forest-600">
          <A href="/login" class="font-semibold text-forest-700 hover:text-forest-800">
            {t("auth.signIn")}
          </A>
        </p>
      </div>
    </main>
  );
}
