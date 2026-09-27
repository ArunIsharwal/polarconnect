"use client";

import {
  FormEvent,
  useState,
} from "react";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Enter your admin email.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(
        "credentials",
        {
          email: email.trim(),
          password,
          redirect: false,
        },
      );

      if (
        !result ||
        result.error
      ) {
        setError(
          "Invalid admin email or password.",
        );

        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(
        "Admin login error:",
        error,
      );

      setError(
        "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <section className="w-full max-w-md border border-neutral-200">
        {/* HEADER */}
        <div className="border-b border-neutral-200 p-6">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            POLARCONNECT / ADMIN ACCESS
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Admin Sign In
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Sign in to manage uploads, review
            scientific records and approve repository
            content.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-6"
        >
          <div>
            <label
              htmlFor="email"
              className="font-mono text-[9px] uppercase tracking-widest text-neutral-400"
            >
              Admin email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="admin@example.com"
              className="mt-2 h-10 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="password"
              className="font-mono text-[9px] uppercase tracking-widest text-neutral-400"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="Enter admin password"
              className="mt-2 h-10 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-black"
            />
          </div>

          {error && (
            <div className="mt-4 border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex h-10 w-full items-center justify-center bg-black px-4 text-xs font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            ACCESS CONTROL
          </div>

          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Administrative access is restricted to
            authorized PolarConnect administrators.
          </p>
        </div>
      </section>
    </main>
  );
}