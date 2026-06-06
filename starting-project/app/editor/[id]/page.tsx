import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/ui/Header";
import { NoteEditForm } from "@/components/editor/NoteEditForm";

type NoteRow = { id: string; title: string; content: string };

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const note = db
    .query("SELECT id, title, content FROM notes WHERE id = ? AND userId = ?")
    .get(id, session.user.id) as NoteRow | undefined;

  if (!note) notFound();

  const initialContent = JSON.parse(note.content);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight">Edit note</h1>
        <NoteEditForm
          noteId={note.id}
          initialTitle={note.title}
          initialContent={initialContent}
        />
      </main>
    </>
  );
}
