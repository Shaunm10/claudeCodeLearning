import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { NoteRenderer } from "@/components/editor/NoteRenderer";

type NoteRow = { id: string; title: string; content: string };

export default async function SharedNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = db
    .query("SELECT id, title, content FROM notes WHERE id = ? AND isShared = 1")
    .get(id) as NoteRow | undefined;

  if (!note) notFound();

  const doc = JSON.parse(note.content);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="mb-6 text-xs uppercase tracking-widest text-foreground/40">
        Shared note
      </p>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{note.title}</h1>
      <NoteRenderer doc={doc} />
    </main>
  );
}
