import { useNavigate } from "@solidjs/router";
import { createEffect, Show, Suspense, type JSX } from "solid-js";
import { safeReturnTo } from "~/lib/auth/return-to";
import { useSession } from "~/lib/auth";

function LoadingFallback() {
  return (
    <div class="flex min-h-screen items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-forest-600 border-t-transparent" />
    </div>
  );
}

export default function ProtectedLayout(props: { children: JSX.Element }) {
  const user = useSession();
  const navigate = useNavigate();

  createEffect(() => {
    const userData = user();
    if (userData === null) {
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
      <Suspense fallback={<LoadingFallback />}>{props.children}</Suspense>
    </Show>
  );
}
