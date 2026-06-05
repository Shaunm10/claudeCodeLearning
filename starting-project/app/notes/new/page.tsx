"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Header } from "@/components/ui/Header";
import { TipTapEditor } from "@/components/editor/TipTapEditor";

export default function NewNotePage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const contentRef = useRef<object>({});

  if (!sessionPending && !session) {
    router.replace("/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: JSON.stringify(contentRef.current),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create note.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight">New note</h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled note"
              className="w-full rounded-lg border border-black/[0.12] bg-transparent px-3 py-2 text-sm placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/25 dark:border-white/[0.12]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium" id="content-label">
              Content
            </span>
            <TipTapEditor
              onUpdate={(json) => {
                contentRef.current = json;
              }}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save note"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
