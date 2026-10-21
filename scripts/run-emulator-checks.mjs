import { spawn } from "node:child_process";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
if (
  process.env.FIREBASE_PROJECT_ID !== "demo-vitech" ||
  process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080" ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9099"
)
  throw Error("Demo emulators required");
initializeApp({ projectId: "demo-vitech" });
const auth = getAuth();
for (const [uid, email] of [
  ["vitech-demo-admin", "admin@vitech.test"],
  ["vitech-demo-other", "other@vitech.test"],
]) {
  try {
    await auth.createUser({ uid, email, password: "Demo-only-password-123!" });
  } catch (error) {
    if (error.code !== "auth/uid-already-exists") throw error;
  }
}
function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(Error(`Check failed: ${args.join(" ")}`)),
    );
  });
}
await run(["node_modules/vitest/vitest.mjs", "run"]);
await run(["node_modules/@playwright/test/cli.js", "test"]);
