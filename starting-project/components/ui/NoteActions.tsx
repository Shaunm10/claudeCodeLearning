"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function NoteActions({ noteId }: { noteId: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);
    try {
      await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      router.push("/dashboard");
    } catch {
      setIsPending(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href={`/editor/${noteId}`}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
        >
          Delete
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="rounded-xl border border-black/10 bg-white p-6 shadow-xl dark:bg-neutral-900 dark:border-white/10 backdrop:bg-black/40 w-full max-w-sm"
      >
        <h2 className="mb-2 text-base font-semibold">Delete note?</h2>
        <p className="mb-6 text-sm text-foreground/60">
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
