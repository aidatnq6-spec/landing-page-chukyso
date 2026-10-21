import { it, expect } from "vitest";
import { verifyAdmin } from "@/lib/server/admin-auth";
const request = (token?: string) =>
  new Request("http://localhost", {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
it("rejects missing token", async () =>
  expect(
    verifyAdmin(request(), async () => ({ uid: "admin" }), "admin"),
  ).rejects.toMatchObject({ status: 401 }));
it("rejects revoked token", async () =>
  expect(
    verifyAdmin(
      request("revoked"),
      async () => {
        throw Error();
      },
      "admin",
    ),
  ).rejects.toMatchObject({ status: 401 }));
it("rejects another authenticated user", async () =>
  expect(
    verifyAdmin(request("other"), async () => ({ uid: "other" }), "admin"),
  ).rejects.toMatchObject({ status: 403 }));
it("accepts only allowed UID", async () =>
  expect(
    verifyAdmin(request("valid"), async () => ({ uid: "admin" }), "admin"),
  ).resolves.toEqual({ uid: "admin" }));
