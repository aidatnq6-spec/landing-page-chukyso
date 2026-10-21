import "server-only";
export function emulatorEnabled() {
  const enabled = process.env.USE_FIREBASE_EMULATORS === "true";
  const hasHosts = !!(
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST
  );
  if ((enabled || hasHosts) && process.env.NODE_ENV === "production")
    throw new Error("Emulators are forbidden in production");
  if (hasHosts && !enabled)
    throw new Error("Explicit emulator opt-in required");
  if (enabled) {
    if (process.env.FIREBASE_PROJECT_ID !== "demo-vitech")
      throw new Error("Emulator requires demo-vitech");
    if (
      process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080" ||
      process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9099"
    )
      throw new Error("Emulator hosts must be local");
  }
  return enabled;
}
export function isConfigured() {
  try {
    return (
      !!(
        emulatorEnabled() ||
        (process.env.FIREBASE_PROJECT_ID &&
          process.env.FIREBASE_CLIENT_EMAIL &&
          process.env.FIREBASE_PRIVATE_KEY)
      ) &&
      !!process.env.SITE_ORIGIN &&
      !!process.env.REGISTRATION_HMAC_SECRET &&
      process.env.REGISTRATION_HMAC_SECRET.length >= 32
    );
  } catch {
    return false;
  }
}
export function secret() {
  if (!isConfigured()) throw new Error("Server not configured");
  return process.env.REGISTRATION_HMAC_SECRET!;
}
