import { fetcher } from "./api-client";

export type OidcConsentPromptDetails = {
  interactionUid: string;
  clientId: string;
  clientName: string;
  clientDescription: string | null;
  scopes: string[];
  /** Set when the client is trusted first-party; consent is completed server-side. */
  autoRedirectUrl?: string;
};

export type OidcConsentDecisionResult = {
  redirectUrl: string;
};

export const oauthConsentApi = {
  getInteraction(uid: string): Promise<OidcConsentPromptDetails> {
    return fetcher<OidcConsentPromptDetails>(
      `/oauth/consent/interactions/${encodeURIComponent(uid)}`,
      { strict: false },
    );
  },

  allow(
    uid: string,
    body: { remember: boolean },
  ): Promise<OidcConsentDecisionResult> {
    return fetcher<OidcConsentDecisionResult>(
      `/oauth/consent/interactions/${encodeURIComponent(uid)}/allow`,
      {
        method: "POST",
        body: JSON.stringify(body),
        strict: false,
      },
    );
  },

  deny(uid: string): Promise<OidcConsentDecisionResult> {
    return fetcher<OidcConsentDecisionResult>(
      `/oauth/consent/interactions/${encodeURIComponent(uid)}/deny`,
      {
        method: "POST",
        strict: false,
      },
    );
  },
};
