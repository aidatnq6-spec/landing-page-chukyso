import { beforeAll, beforeEach, describe, it, expect, vi } from "vitest";
// These tests invoke route handlers outside the Next.js request lifecycle.
// Real post-response execution is covered by the browser flow and unit tests.
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: vi.fn(),
}));
import { randomUUID } from "node:crypto";
import { firebaseAdmin } from "@/lib/firebase/admin";
import { registrationSchema } from "@/lib/registrations/schema";
import { createRegistration } from "@/lib/server/registration-service";
import {
  listRegistrations,
  updateRegistration,
  getRegistration,
} from "@/lib/server/admin-registrations";
import { GET as adminGET } from "@/app/api/admin/registrations/route";
import { POST } from "@/app/api/registrations/route";
import { Timestamp } from "firebase-admin/firestore";
const input = () =>
  registrationSchema.parse({
    requestId: randomUUID(),
    fullName: "Đặng Ánh",
    email: "anh@example.test",
    phone: "0968273868",
    address: "24 Thành Vinh 1",
    planId: "ica-3y",
    website: "",
  });
beforeAll(() => {
  if (
    process.env.FIREBASE_PROJECT_ID !== "demo-vitech" ||
    process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080"
  )
    throw Error("Only local demo emulator allowed");
});
beforeEach(async () => {
  const response = await fetch(
    "http://127.0.0.1:8080/emulator/v1/projects/demo-vitech/databases/(default)/documents",
    { method: "DELETE" },
  );
  expect(response.ok).toBe(true);
});
describe("Firestore registration flow", () => {
  it("creates once for concurrent retry and preserves follow-up", async () => {
    const data = input();
    const results = await Promise.all([
      createRegistration(data, "test"),
      createRegistration(data, "test"),
    ]);
    expect(results.sort()).toEqual([false, true]);
    expect(
      (await firebaseAdmin().db.collection("registrations").get()).size,
    ).toBe(1);
    await updateRegistration(data.requestId, {
      status: "consulting",
      notes: "Gọi lại ngày mai",
    });
    await createRegistration(data, "test");
    expect(await getRegistration(data.requestId)).toMatchObject({
      status: "consulting",
      notes: "Gọi lại ngày mai",
    });
    await expect(
      createRegistration({ ...data, email: "changed@example.test" }, "test"),
    ).rejects.toMatchObject({ status: 409 });
  });
  it("limits new registrations but not exact retries", async () => {
    for (let i = 0; i < 5; i++) await createRegistration(input(), "source");
    await expect(createRegistration(input(), "source")).rejects.toMatchObject({
      status: 429,
    });
  });
  it("rejects public invalid payload, origin and extra fields", async () => {
    const request = (body: unknown, origin = process.env.SITE_ORIGIN!) =>
      new Request("http://127.0.0.1:3000/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json", origin },
        body: JSON.stringify(body),
      });
    expect(
      (await POST(request({ ...input(), status: "completed" }))).status,
    ).toBe(400);
    expect((await POST(request(input(), "https://invalid.test"))).status).toBe(
      403,
    );
    expect((await POST(request({ ...input(), website: "spam" }))).status).toBe(
      400,
    );
    const lead = input();
    expect((await POST(request(lead))).status).toBe(201);
    expect((await POST(request(lead))).status).toBe(200);
  });
  it("paginates tied timestamps and signs cursors", async () => {
    const { db } = firebaseAdmin();
    const batch = db.batch();
    for (let i = 0; i < 45; i++) {
      const data = input();
      batch.set(db.collection("registrations").doc(data.requestId), {
        fullName: `Đặng Ánh ${i}`,
        email: `anh${i}@example.test`,
        phone: data.phone,
        address: data.address,
        planId: data.planId,
        status: i < 25 ? "new" : "contacted",
        notes: "",
        nameKey: `dang anh ${i}`,
        emailKey: `anh${i}@example.test`,
        phoneKey: data.phone,
        createdAt: Timestamp.fromMillis(1000000),
        updatedAt: Timestamp.fromMillis(1000000),
      });
    }
    await batch.commit();
    const seen = new Set<string>();
    let cursor: string | null = null;
    do {
      const p = new URLSearchParams();
      if (cursor) p.set("cursor", cursor);
      const result = await listRegistrations(p);
      result.items.forEach((d) => {
        expect(seen.has(d.id)).toBe(false);
        seen.add(d.id);
      });
      cursor = result.nextCursor;
    } while (cursor);
    expect(seen.size).toBe(45);
    const first = await listRegistrations(new URLSearchParams());
    await expect(
      listRegistrations(
        new URLSearchParams({ cursor: first.nextCursor + "x" }),
      ),
    ).rejects.toMatchObject({ status: 400 });
    for (const [searchBy, q] of [
      ["name", "Đặng"],
      ["email", "anh"],
      ["phone", "+84968"],
    ]) {
      const result = await listRegistrations(
        new URLSearchParams({ status: "new", searchBy, q }),
      );
      expect(result.items.length).toBe(20);
      expect(result.items.every((d) => d.status === "new")).toBe(true);
    }
  });
  it("requires authentication and the configured UID", async () => {
    expect(
      (await adminGET(new Request("http://localhost/api/admin/registrations")))
        .status,
    ).toBe(401);
    for (const [email, expected] of [
      ["other@vitech.test", 403],
      ["admin@vitech.test", 200],
    ] as const) {
      const response = await fetch(
        "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password: "Demo-only-password-123!",
            returnSecureToken: true,
          }),
        },
      );
      const { idToken } = await response.json();
      expect(
        (
          await adminGET(
            new Request("http://localhost/api/admin/registrations", {
              headers: { authorization: `Bearer ${idToken}` },
            }),
          )
        ).status,
      ).toBe(expected);
    }
  });
  it("allows only status and notes updates", async () => {
    const data = input();
    await createRegistration(data, "source");
    await expect(
      updateRegistration(data.requestId, {
        status: "new",
        notes: "",
        email: "hijack@example.test",
      }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(getRegistration(randomUUID())).rejects.toMatchObject({
      status: 404,
    });
  });
});
