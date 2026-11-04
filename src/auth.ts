import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import type { UserProfile } from "@/types/auth";

const API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:8080";

type BackendSyncResponse = {
  accessToken: string;
  user: UserProfile;
};

function isBackendSyncResponse(value: unknown): value is BackendSyncResponse {
  if (!value || typeof value !== "object") return false;

  const data = value as Partial<BackendSyncResponse>;
  return (
    typeof data.accessToken === "string" &&
    data.accessToken.length > 0 &&
    !!data.user &&
    typeof data.user === "object"
  );
}

function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
    .replace(
      /\b[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b/g,
      "[REDACTED]",
    )
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED]");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
      authorization: { params: { scope: "openid profile email" } },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const microsoftIdToken = account?.id_token;
      if (!microsoftIdToken) {
        console.error(
          "Microsoft login sync failed: missing ID token",
          "POST /v1/auth/sync",
        );
        return false;
      }

      try {
        const res = await fetch(`${API_URL}/v1/auth/sync`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${microsoftIdToken}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const responseMessage = sanitizeErrorMessage(
            (await res.text()).slice(0, 500),
          );
          console.error("Microsoft login sync failed", {
            endpoint: "POST /v1/auth/sync",
            status: res.status,
            message: responseMessage || "Backend returned an empty response",
          });
          return false;
        }

        const data: unknown = await res.json();
        if (!isBackendSyncResponse(data)) {
          console.error("Microsoft login sync failed", {
            endpoint: "POST /v1/auth/sync",
            status: res.status,
            message: "Backend response did not contain accessToken and user",
          });
          return false;
        }

        user.backendToken = data.accessToken;
        user.profile = data.user;
        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? sanitizeErrorMessage(error.message)
            : "Unknown error";
        console.error("Microsoft login sync failed", {
          endpoint: "POST /v1/auth/sync",
          message,
        });
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user?.backendToken) token.backendToken = user.backendToken;
      if (user?.profile) token.userProfile = user.profile;
      return token;
    },

    async session({ session, token }) {
      if (token.userProfile) {
        session.user = { ...session.user, ...token.userProfile };
      }
      if (token.backendToken) session.backendToken = token.backendToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
