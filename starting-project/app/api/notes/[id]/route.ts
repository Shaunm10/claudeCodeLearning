import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = db
    .query(
      "SELECT id, title, content, isShared, createdAt, updatedAt FROM notes WHERE id = ? AND userId = ?",
    )
    .get(id, session.user.id);

  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ note });
}

const updateNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  isShared: z.boolean().default(false),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }

  const { title, content, isShared } = parsed.data;
  const now = Date.now();

  const result = db.run(
    "UPDATE notes SET title = ?, content = ?, isShared = ?, updatedAt = ? WHERE id = ? AND userId = ?",
    [title, content, isShared ? 1 : 0, now, id, session.user.id],
  );

  if (result.changes === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const result = db.run(
    "DELETE FROM notes WHERE id = ? AND userId = ?",
    [id, session.user.id],
  );

  if (result.changes === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
