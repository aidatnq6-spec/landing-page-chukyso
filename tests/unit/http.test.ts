import { it, expect } from "vitest";
import { readJson } from "@/lib/server/http";
it("rejects lookalike content types", async () =>
  expect(
    readJson(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/jsonx" },
        body: "{}",
      }),
    ),
  ).rejects.toMatchObject({ status: 415 }));
it("checks actual streamed size", async () =>
  expect(
    readJson(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: "a".repeat(9000) }),
      }),
    ),
  ).rejects.toMatchObject({ status: 413 }));
it("rejects non JSON", async () =>
  expect(
    readJson(new Request("http://localhost", { method: "POST", body: "x" })),
  ).rejects.toMatchObject({ status: 415 }));
it("rejects invalid JSON", async () =>
  expect(
    readJson(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    ),
  ).rejects.toMatchObject({ status: 400 }));
