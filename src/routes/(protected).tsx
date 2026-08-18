import { useNavigate } from "@solidjs/router";
import { createEffect, Show, Suspense, type JSX } from "solid-js";
import { LocaleToggle } from "~/components/LocaleToggle";
import { LoadingFallback } from "~/components/ui";
import { safeReturnTo } from "~/lib/auth/return-to";
import { useSession } from "~/lib/auth";

export default function ProtectedLayout(props: { children: JSX.Element }) {
  const user = useSession();
  const navigate = useNavigate();

  createEffect(() => {
    const userData = user();
    if (userData === null) {
      if (
        typeof window !== "undefined" &&
        window.location.pathname === "/consent"
      ) {
        window.location.replace("/oauth/error?error=interaction_expired");
        return;
      }
      const returnTo =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/account";
      const params = new URLSearchParams();
      const safeTarget = safeReturnTo(returnTo);
      if (safeTarget !== "/account" || returnTo.startsWith("/account")) {
        params.set("returnTo", safeTarget);
      }
      const query = params.toString();
      navigate(query ? `/login?${query}` : "/login", { replace: true });
    }
  });

  return (
    <Show when={user()} fallback={<LoadingFallback />}>
      <div class="relative min-h-screen">
        <div class="absolute right-4 top-4 z-10">
          <LocaleToggle />
        </div>
        <Suspense fallback={<LoadingFallback />}>{props.children}</Suspense>
      </div>
    </Show>
  );
}
