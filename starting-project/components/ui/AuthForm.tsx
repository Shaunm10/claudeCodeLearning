"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Mode = "login" | "register";

type AuthFormProps = {
  defaultMode: Mode;
};

export function AuthForm({ defaultMode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  function handleModeToggle() {
    router.push(defaultMode === "login" ? "/login?mode=register" : "/login");
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      if (defaultMode === "login") {
        const { error: authError } = await authClient.signIn.email({
          email,
          password,
        });
        if (authError) {
          setError(authError.message ?? "Sign in failed.");
        } else {
          router.push("/dashboard");
        }
      } else {
        const { error: authError } = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0],
        });
        if (authError) {
          setError(authError.message ?? "Could not create account.");
        } else {
          router.push("/dashboard");
        }
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-black/[0.08] bg-background p-8 shadow-sm dark:border-white/[0.08]">
        <header className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight">
            {defaultMode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-foreground/50">
            {defaultMode === "login"
              ? "Welcome back. Enter your credentials to continue."
              : "Enter your email and choose a password."}
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-black/[0.12] bg-transparent px-3 py-2 text-sm placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/25 dark:border-white/[0.12]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={
                defaultMode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={handlePasswordChange}
              className="w-full rounded-lg border border-black/[0.12] bg-transparent px-3 py-2 text-sm placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/25 dark:border-white/[0.12]"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? defaultMode === "login"
                ? "Signing in…"
                : "Creating account…"
              : defaultMode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <footer className="mt-6 text-center text-sm text-foreground/50">
          {defaultMode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={handleModeToggle}
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            {defaultMode === "login" ? "Create one" : "Sign in"}
          </button>
        </footer>
      </div>
    </main>
  );
}
