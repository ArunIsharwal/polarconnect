import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    authorized({
      auth,
      request: { nextUrl },
    }) {
      const isAdminRoute =
        nextUrl.pathname === "/admin" ||
        nextUrl.pathname.startsWith("/admin/");

      if (isAdminRoute) {
        return !!auth?.user;
      }

      return true;
    },
  },

  providers: [],
} satisfies NextAuthConfig;