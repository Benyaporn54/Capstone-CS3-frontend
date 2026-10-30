// src/auth.ts
import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // เมื่อทำการ Login ผ่าน Provider สำเร็จ ให้ยิงไป Sync กับ Backend
      if (account && account.access_token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${account.access_token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            token.userProfile = userData; // เก็บข้อมูล User Profile จาก Backend
          }
        } catch (error) {
          console.error("Error syncing auth with backend:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userProfile) {
        session.user = {
          ...session.user,
          ...token.userProfile,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});