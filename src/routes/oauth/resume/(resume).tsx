import { useNavigate, useSearchParams } from "@solidjs/router";
import { onMount } from "solid-js";
import { Card } from "~/components/ui";
import { isOidcInteractionReturnTo, safeReturnTo } from "~/lib/auth/return-to";
import { useI18n } from "~/i18n";

export default function OAuthResumePage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  onMount(() => {
    const target = safeReturnTo(searchParams.returnTo);

    if (!isOidcInteractionReturnTo(target)) {
      navigate(target, { replace: true });
      return;
    }

    window.location.replace(target);
  });

  return (
    <main class="flex min-h-screen items-center justify-center bg-cream-50 p-4">
      <Card class="w-full max-w-md text-center">
        <div
          class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-forest-200 border-t-forest-700"
          role="status"
          aria-label={t("oauthResume.loading")}
        />
        <h1 class="h3 mt-6">{t("oauthResume.title")}</h1>
        <p class="mt-2 text-forest-600">{t("oauthResume.message")}</p>
      </Card>
    </main>
  );
}
