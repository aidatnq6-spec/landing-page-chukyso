import { afterEach, it, expect, vi } from "vitest";
import { emulatorEnabled, isConfigured } from "@/lib/server/config";
afterEach(() => vi.unstubAllEnvs());
it("never enables emulator in production", () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("USE_FIREBASE_EMULATORS", "true");
  expect(emulatorEnabled).toThrow("production");
  expect(isConfigured()).toBe(false);
});
it("requires explicit opt-in for emulator hosts", () => {
  vi.stubEnv("USE_FIREBASE_EMULATORS", "false");
  vi.stubEnv("FIRESTORE_EMULATOR_HOST", "127.0.0.1:8080");
  expect(emulatorEnabled).toThrow("opt-in");
});
it("rejects a real project in emulator mode", () => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("USE_FIREBASE_EMULATORS", "true");
  vi.stubEnv("FIREBASE_PROJECT_ID", "real-project");
  expect(emulatorEnabled).toThrow("demo-vitech");
});
