import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: { query: vi.fn() },
}));

import { GET } from "@/app/api/public/notes/[id]/route";
import { db } from "@/lib/db";

const routeCtx = { params: Promise.resolve({ id: "note-abc" }) };

describe("GET /api/public/notes/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when note does not exist", async () => {
    vi.mocked(db.query).mockReturnValue({ get: vi.fn().mockReturnValue(null) } as any);
    const res = await GET(new Request("http://localhost"), routeCtx);
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: "Not found" });
  });

  it("returns 404 when note is not shared (isShared = 0)", async () => {
    // The SQL query filters by isShared = 1, so a private note returns null from the DB
    vi.mocked(db.query).mockReturnValue({ get: vi.fn().mockReturnValue(null) } as any);
    const res = await GET(new Request("http://localhost"), routeCtx);
    expect(res.status).toBe(404);
  });

  it("returns the note when it is shared", async () => {
    const note = { id: "note-abc", title: "Public Note", content: '{"type":"doc"}' };
    vi.mocked(db.query).mockReturnValue({ get: vi.fn().mockReturnValue(note) } as any);

    const res = await GET(new Request("http://localhost"), routeCtx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ note });
  });

  it("queries only shared notes (isShared = 1 in SQL)", async () => {
    const mockGet = vi.fn().mockReturnValue(null);
    vi.mocked(db.query).mockReturnValue({ get: mockGet } as any);

    await GET(new Request("http://localhost"), routeCtx);
    expect(vi.mocked(db.query)).toHaveBeenCalledWith(
      expect.stringContaining("isShared = 1"),
    );
  });

  it("does not require authentication", async () => {
    // No auth mock needed — the handler should work without a session
    const note = { id: "note-abc", title: "Public", content: "{}" };
    vi.mocked(db.query).mockReturnValue({ get: vi.fn().mockReturnValue(note) } as any);
    const res = await GET(new Request("http://localhost"), routeCtx);
    expect(res.status).toBe(200);
  });
});
