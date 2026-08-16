import { useNavigate } from "@solidjs/router";
import { createEffect, Show } from "solid-js";
import { safeReturnTo } from "~/lib/auth/return-to";
import { useSession } from "~/lib/auth";

export default function AuthLayout(props: { children: unknown }) {
  const user = useSession();
  const navigate = useNavigate();

  createEffect(() => {
    if (!user()) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const target = safeReturnTo(params.get("returnTo") ?? undefined);

    if (target.startsWith("http")) {
      window.location.assign(target);
      return;
    }

    navigate(target, { replace: true });
  });

  return <Show when={user() === null}>{props.children as never}</Show>;
}
