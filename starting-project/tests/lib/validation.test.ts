import { describe, it, expect } from "vitest";
import { createNoteSchema, updateNoteSchema } from "@/lib/validation";

describe("createNoteSchema", () => {
  it("accepts valid input", () => {
    const result = createNoteSchema.safeParse({ title: "Hello", content: "{}" });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createNoteSchema.safeParse({ title: "", content: "{}" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Title is required");
  });

  it("rejects empty content", () => {
    const result = createNoteSchema.safeParse({ title: "Hello", content: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Content is required");
  });

  it("rejects missing fields", () => {
    const result = createNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateNoteSchema", () => {
  it("accepts valid input", () => {
    const result = updateNoteSchema.safeParse({ title: "Hello", content: "{}", isShared: true });
    expect(result.success).toBe(true);
    expect(result.data?.isShared).toBe(true);
  });

  it("defaults isShared to false when omitted", () => {
    const result = updateNoteSchema.safeParse({ title: "Hello", content: "{}" });
    expect(result.success).toBe(true);
    expect(result.data?.isShared).toBe(false);
  });

  it("rejects empty title", () => {
    const result = updateNoteSchema.safeParse({ title: "", content: "{}", isShared: false });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Title is required");
  });

  it("rejects empty content", () => {
    const result = updateNoteSchema.safeParse({ title: "Hello", content: "", isShared: false });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Content is required");
  });

  it("rejects non-boolean isShared", () => {
    const result = updateNoteSchema.safeParse({ title: "Hello", content: "{}", isShared: "yes" });
    expect(result.success).toBe(false);
  });
});
