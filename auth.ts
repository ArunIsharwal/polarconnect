import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "./auth.config";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Admin Login",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email = String(
          credentials?.email || "",
        ).trim();

        const password = String(
          credentials?.password || "",
        );

        const adminEmail =
          process.env.ADMIN_EMAIL || "";

        const adminPassword =
          process.env.ADMIN_PASSWORD || "";

        if (!adminEmail || !adminPassword) {
          console.error(
            "ADMIN_EMAIL or ADMIN_PASSWORD is missing from .env.local",
          );

          return null;
        }

        if (
          email !== adminEmail ||
          password !== adminPassword
        ) {
          return null;
        }

        return {
          id: "polarconnect-admin",
          name: "PolarConnect Admin",
          email: adminEmail,
        };
      },
    }),
  ],
});