import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/ui/Header";

type NoteRow = { id: string; title: string; createdAt: number };

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const notes = db
    .query(
      "SELECT id, title, createdAt FROM notes WHERE userId = ? ORDER BY updatedAt DESC",
    )
    .all(session.user.id) as NoteRow[];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome, {session.user.name}
          </h1>
          <Link
            href="/notes/new"
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            New note
          </Link>
        </div>

        {notes.length === 0 ? (
          <p className="text-sm text-foreground/50">No notes yet. Create your first one above.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {notes.map((note) => (
              <li key={note.id}>
                <Link
                  href={`/notes/${note.id}`}
                  className="flex items-center justify-between rounded-xl border border-black/[0.08] px-5 py-4 transition-colors hover:bg-foreground/[0.04] dark:border-white/[0.08]"
                >
                  <span className="font-medium">{note.title || "Untitled"}</span>
                  <span className="text-xs text-foreground/40">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
