import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { notifyNewRegistration } from "@/lib/server/telegram";

const input = {
  requestId: "00000000-0000-4000-8000-000000000001",
  fullName: "Nguyễn An\nQuản trị viên",
  phone: "0968273868",
  email: "an@example.test",
  address: "24 Thành Vinh 1",
  planId: "ica-3y" as const,
  website: "",
};
const at = new Date("2026-10-21T03:00:00Z");
const send = vi.fn();
beforeEach(() => {
  vi.stubEnv("TELEGRAM_BOT_TOKEN", "test-token-never-real");
  vi.stubEnv("TELEGRAM_CHAT_ID", "-1001234567890");
  vi.stubEnv("SITE_ORIGIN", "https://example.test");
  vi.stubGlobal("fetch", send);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  send.mockReset();
});
it("stays inactive until a token and group ID are configured", async () => {
  vi.stubEnv("TELEGRAM_CHAT_ID", "");
  expect(await notifyNewRegistration(input, at)).toBe("skipped");
  vi.stubEnv("TELEGRAM_CHAT_ID", "-1001234567890");
  vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
  expect(await notifyNewRegistration(input, at)).toBe("skipped");
  expect(send).not.toHaveBeenCalled();
});
it("sends the contact details and admin link as plain text to the configured group", async () => {
  send.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
  expect(await notifyNewRegistration(input, at)).toBe("sent");
  const [url, options] = send.mock.calls[0];
  expect(url).toBe(
    "https://api.telegram.org/bottest-token-never-real/sendMessage",
  );
  const body = JSON.parse(options.body);
  expect(body.chat_id).toBe("-1001234567890");
  expect(body.text).toContain("Họ và tên: Nguyễn An Quản trị viên");
  for (const value of [
    input.phone,
    input.email,
    input.address,
    "ICA 3 năm + 6 tháng",
    "10:00:00",
    input.requestId,
    "https://example.test/admin",
  ])
    expect(body.text).toContain(value);
  expect(body).not.toHaveProperty("parse_mode");
  expect(options.signal).toBeInstanceOf(AbortSignal);
  expect(options.redirect).toBe("error");
  expect(send).toHaveBeenCalledTimes(1);
});
it("rejects an invalid group ID without sending", async () => {
  vi.stubEnv("TELEGRAM_CHAT_ID", "https://untrusted.test");
  expect(await notifyNewRegistration(input, at)).toBe("skipped");
  expect(send).not.toHaveBeenCalled();
});
it.each([
  [
    "HTTP error",
    () => Promise.resolve(new Response("private response", { status: 429 })),
  ],
  [
    "API error",
    () => Promise.resolve(new Response(JSON.stringify({ ok: false }))),
  ],
  ["invalid JSON", () => Promise.resolve(new Response("invalid"))],
  [
    "timeout or network error",
    () => Promise.reject(new Error("secret token URL")),
  ],
])("contains %s without leaking secrets or contact data", async (_, result) => {
  send.mockImplementation(result);
  expect(await notifyNewRegistration(input, at)).toBe("failed");
  const log = JSON.stringify(vi.mocked(console.warn).mock.calls);
  expect(log).toContain(input.requestId);
  for (const privateValue of [
    "test-token-never-real",
    "secret token URL",
    "private response",
    input.email,
    input.phone,
  ])
    expect(log).not.toContain(privateValue);
});
