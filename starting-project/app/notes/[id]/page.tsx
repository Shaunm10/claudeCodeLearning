import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/ui/Header";
import { NoteRenderer } from "@/components/editor/NoteRenderer";

type NoteRow = {
  id: string;
  title: string;
  content: string;
  isShared: number;
  createdAt: number;
  updatedAt: number;
};

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const note = db
    .query(
      "SELECT id, title, content, isShared, createdAt, updatedAt FROM notes WHERE id = ? AND userId = ?",
    )
    .get(id, session.user.id) as NoteRow | undefined;

  if (!note) notFound();

  const doc = JSON.parse(note.content);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            ← Dashboard
          </Link>
          <span className="text-foreground/20">|</span>
          <span className="text-xs text-foreground/40">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="mb-8 text-3xl font-bold tracking-tight">{note.title}</h1>

        <NoteRenderer doc={doc} />
      </main>
    </>
  );
}
