import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import type { UserProfile } from "@/types/auth";

const API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:8080";

type UserWithProfile = { profile?: UserProfile };

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
    // Runs once after Microsoft login. Returning false rejects the login.
    async signIn({ user, account }) {
      if (!account?.id_token) return false;

      try {
        const res = await fetch(`${API_URL}/v1/auth/sync`, {
          method: "POST",
          headers: { Authorization: `Bearer ${account.id_token}` },
        });
        if (!res.ok) return false; // 403 = not an SIT account

        // Hand the backend profile to the jwt callback below
        (user as UserWithProfile).profile = (await res.json()) as UserProfile;
        return true;
      } catch (error) {
        console.error("Error syncing auth with backend:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      const profile = (user as UserWithProfile | undefined)?.profile;
      if (profile) token.userProfile = profile;
      return token;
    },
    async session({ session, token }) {
      if (token.userProfile) {
        session.user = { ...session.user, ...token.userProfile };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // login rejected → /login?error=AccessDenied
  },
});
