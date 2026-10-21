import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  notify: vi.fn(),
  after: vi.fn(),
}));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: mocks.after,
}));
vi.mock("@/lib/server/config", () => ({ isConfigured: () => true }));
vi.mock("@/lib/server/registration-service", () => ({
  createRegistration: mocks.create,
  sourceKey: () => "test-source",
}));
vi.mock("@/lib/server/telegram", () => ({
  notifyNewRegistration: mocks.notify,
}));
import { POST } from "@/app/api/registrations/route";

const contact = {
  requestId: "00000000-0000-4000-8000-000000000001",
  fullName: "Nguyễn An",
  phone: "0968273868",
  email: "an@example.test",
  address: "24 Thành Vinh 1",
  planId: "ica-1y",
  website: "",
};
const request = () =>
  new Request("https://example.test/api/registrations", {
    method: "POST",
    headers: {
      Origin: "https://example.test",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  });
beforeEach(() => vi.stubEnv("SITE_ORIGIN", "https://example.test"));
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});
it("schedules notification after creating the lead; notification failure leaves success intact", async () => {
  mocks.create.mockResolvedValue(true);
  mocks.notify.mockResolvedValue("failed");
  const response = await POST(request());
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ ok: true });
  expect(mocks.notify).not.toHaveBeenCalled();
  expect(mocks.after).toHaveBeenCalledTimes(1);
  await mocks.after.mock.calls[0][0]();
  expect(mocks.notify).toHaveBeenCalledWith(contact, expect.any(Date));
});
it("does not notify again on an idempotent retry", async () => {
  mocks.create.mockResolvedValue(false);
  expect((await POST(request())).status).toBe(200);
  expect(mocks.after).not.toHaveBeenCalled();
});
it("does not notify when persistence fails", async () => {
  mocks.create.mockRejectedValue(new Error("simulated failure"));
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    expect((await POST(request())).status).toBe(503);
    expect(mocks.after).not.toHaveBeenCalled();
  } finally {
    log.mockRestore();
  }
});
