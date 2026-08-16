import { action, createAsync, query, redirect } from "@solidjs/router";
import { authApi } from "~/lib/api/auth.api";

export const getSession = query(async () => {
  "use server";
  try {
    return await authApi.checkAuth();
  } catch {
    return null;
  }
}, "user-session");

export const logoutAction = action(async () => {
  "use server";
  try {
    await authApi.logout();
  } catch (error: unknown) {
    const status =
      error &&
      typeof error === "object" &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : undefined;
    if (status !== 401) {
      console.error("[Auth] Logout error:", error);
    }
  }

  throw redirect("/login", {
    revalidate: "user-session",
  });
}, "user-logout");

export const useSession = () => createAsync(() => getSession());
