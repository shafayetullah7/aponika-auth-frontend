import { createSignal, onMount, Show } from "solid-js";
import type { JSX } from "solid-js";
import { getHealth } from "~/lib/api/health.api";
import { ApiError } from "~/lib/api/types";
import { config } from "~/lib/config";
import { useI18n, type Translator } from "~/i18n";

type HealthResult =
  | Awaited<ReturnType<typeof getHealth>>
  | { error: unknown };

function isErrorResult(
  value: HealthResult,
): value is { error: unknown } {
  return "error" in value;
}

function HealthStatusBadge(props: {
  result: HealthResult;
  t: Translator;
  class?: string;
}): JSX.Element {
  const { result, t } = props;

  if (isErrorResult(result)) {
    return (
      <div
        class={`rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ${props.class ?? ""}`}
      >
        <span>
          {t("common.apiUnreachable")}
          {result.error instanceof ApiError && result.error.status > 0
            ? ` (${result.error.status})`
            : ""}
        </span>
      </div>
    );
  }

  return (
    <div
      class={`rounded-xl px-4 py-3 text-sm ${props.class ?? ""}`}
      classList={{
        "bg-forest-50 text-forest-700": result.db === "ok",
        "bg-amber-50 text-amber-900": result.db !== "ok",
      }}
    >
      <span>
        {t("common.apiReachable")} · {t("common.apiStatus")}: {result.status} ·{" "}
        {t("common.apiDb")}:{" "}
        {result.db === "ok" ? t("common.apiDbOk") : t("common.apiDbDown")}
      </span>
    </div>
  );
}

function ApiHealthStatusInner(props: { class?: string }) {
  const { t } = useI18n();
  const [health, setHealth] = createSignal<HealthResult | undefined>();

  onMount(() => {
    void getHealth()
      .then((result) => setHealth(result))
      .catch((error: unknown) => setHealth({ error }));
  });

  return (
    <Show when={health()}>
      {(result) => (
        <HealthStatusBadge result={result()} t={t} class={props.class} />
      )}
    </Show>
  );
}

export function ApiHealthStatus(props: { class?: string }) {
  return (
    <Show when={config.isDev}>
      <ApiHealthStatusInner class={props.class} />
    </Show>
  );
}
