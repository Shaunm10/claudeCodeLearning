"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TipTapEditor } from "./TipTapEditor";

type Props = {
  noteId: string;
  initialTitle: string;
  initialContent: object;
};

export function NoteEditForm({ noteId, initialTitle, initialContent }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const contentRef = useRef<object>(initialContent);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: JSON.stringify(contentRef.current),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save.");
        return;
      }

      router.push(`/notes/${noteId}`);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  return (
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
          initialContent={initialContent}
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
          onClick={() => router.push(`/notes/${noteId}`)}
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
