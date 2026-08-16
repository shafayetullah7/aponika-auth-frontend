import { action } from "@solidjs/router";
import { oauthConsentApi } from "~/lib/api/oauth-consent.api";

export const allowConsentAction = action(
  async (data: { uid: string; remember: boolean }) => {
    "use server";

    return oauthConsentApi.allow(data.uid, { remember: data.remember });
  },
  "oauth-consent-allow",
);

export const denyConsentAction = action(async (data: { uid: string }) => {
  "use server";

  return oauthConsentApi.deny(data.uid);
}, "oauth-consent-deny");
