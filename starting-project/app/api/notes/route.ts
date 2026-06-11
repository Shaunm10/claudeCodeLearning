import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNoteSchema } from "@/lib/validation";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = db
    .query("SELECT id, title, isShared, createdAt, updatedAt FROM notes WHERE userId = ? ORDER BY updatedAt DESC")
    .all(session.user.id);

  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }

  const { title, content } = parsed.data;
  const id = crypto.randomUUID();
  const now = Date.now();

  db.run(
    "INSERT INTO notes (id, userId, title, content, isShared, createdAt, updatedAt) VALUES (?, ?, ?, ?, 0, ?, ?)",
    [id, session.user.id, title, content, now, now]
  );

  return NextResponse.json({ id }, { status: 201 });
}
