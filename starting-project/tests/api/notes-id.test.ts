import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock("@/lib/db", () => ({
  db: { query: vi.fn(), run: vi.fn() },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import { GET, PUT, DELETE } from "@/app/api/notes/[id]/route";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockSession = { user: { id: "user-1", name: "Test", email: "t@t.com" } };
const routeCtx = { params: Promise.resolve({ id: "note-abc" }) };

describe("GET /api/notes/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as any);
    const res = await GET(new Request("http://localhost"), routeCtx);
    expect(res.status).toBe(401);
  });

  it("returns 404 when note not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    vi.mocked(db.query).mockReturnValue({ get: vi.fn().mockReturnValue(null) } as any);
    const res = await GET(new Request("http://localhost"), routeCtx);
    expect(res.status).toBe(404);
  });

  it("returns the note when found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    const note = { id: "note-abc", title: "Hello", content: "{}", isShared: 0 };
    vi.mocked(db.query).mockReturnValue({ get: vi.fn().mockReturnValue(note) } as any);

    const res = await GET(new Request("http://localhost"), routeCtx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ note });
  });
});

describe("PUT /api/notes/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  function makeRequest(body: object) {
    return new Request("http://localhost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as any);
    const res = await PUT(makeRequest({ title: "T", content: "{}" }), routeCtx);
    expect(res.status).toBe(401);
  });

  it("returns 422 for invalid body", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    const res = await PUT(makeRequest({ title: "", content: "" }), routeCtx);
    expect(res.status).toBe(422);
  });

  it("returns 404 when note not owned by user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    vi.mocked(db.run).mockReturnValue({ changes: 0 } as any);
    const res = await PUT(makeRequest({ title: "T", content: "{}", isShared: false }), routeCtx);
    expect(res.status).toBe(404);
  });

  it("updates the note and returns ok", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    vi.mocked(db.run).mockReturnValue({ changes: 1 } as any);
    const res = await PUT(makeRequest({ title: "Updated", content: "{}", isShared: true }), routeCtx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("maps isShared boolean to integer in the SQL call", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    vi.mocked(db.run).mockReturnValue({ changes: 1 } as any);
    await PUT(makeRequest({ title: "T", content: "{}", isShared: true }), routeCtx);
    expect(vi.mocked(db.run)).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE notes"),
      expect.arrayContaining([1]),
    );
  });
});

describe("DELETE /api/notes/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  const req = new Request("http://localhost", { method: "DELETE" });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as any);
    const res = await DELETE(req, routeCtx);
    expect(res.status).toBe(401);
  });

  it("returns 404 when note not owned by user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    vi.mocked(db.run).mockReturnValue({ changes: 0 } as any);
    const res = await DELETE(req, routeCtx);
    expect(res.status).toBe(404);
  });

  it("deletes the note and returns 204", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    vi.mocked(db.run).mockReturnValue({ changes: 1 } as any);
    const res = await DELETE(req, routeCtx);
    expect(res.status).toBe(204);
  });
});
