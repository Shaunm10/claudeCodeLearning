import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type NoteRow = { id: string; title: string; content: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const note = db
    .query("SELECT id, title, content FROM notes WHERE id = ? AND isShared = 1")
    .get(id) as NoteRow | undefined;

  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ note });
}
