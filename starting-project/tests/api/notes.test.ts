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

import { GET, POST } from "@/app/api/notes/route";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockSession = { user: { id: "user-1", name: "Test", email: "t@t.com" } };

describe("GET /api/notes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as any);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  it("returns the user's notes", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    const notes = [{ id: "1", title: "Note", isShared: 0, createdAt: 1000, updatedAt: 1000 }];
    vi.mocked(db.query).mockReturnValue({ all: vi.fn().mockReturnValue(notes) } as any);

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ notes });
  });

  it("queries only the authenticated user's notes", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    const mockAll = vi.fn().mockReturnValue([]);
    vi.mocked(db.query).mockReturnValue({ all: mockAll } as any);

    await GET();
    expect(mockAll).toHaveBeenCalledWith("user-1");
  });
});

describe("POST /api/notes", () => {
  beforeEach(() => vi.clearAllMocks());

  function makeRequest(body: object) {
    return new Request("http://localhost/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as any);
    const res = await POST(makeRequest({ title: "T", content: "{}" }));
    expect(res.status).toBe(401);
  });

  it("returns 422 when title is empty", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    const res = await POST(makeRequest({ title: "", content: "{}" }));
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: "Title is required" });
  });

  it("returns 422 when content is empty", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    const res = await POST(makeRequest({ title: "Title", content: "" }));
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: "Content is required" });
  });

  it("creates a note and returns 201 with an id", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    vi.mocked(db.run).mockReturnValue(undefined as any);

    const res = await POST(makeRequest({ title: "My Note", content: '{"type":"doc"}' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(typeof body.id).toBe("string");
    expect(body.id.length).toBeGreaterThan(0);
  });

  it("inserts the note with the correct user id", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

    await POST(makeRequest({ title: "My Note", content: '{"type":"doc"}' }));
    expect(vi.mocked(db.run)).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO notes"),
      expect.arrayContaining(["user-1"]),
    );
  });
});
