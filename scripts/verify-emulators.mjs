import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
const env = {
  // Do not pass unrelated account secrets or DEBUG settings into CLI subprocesses.
  ...Object.fromEntries(
    Object.entries(process.env).filter(([key]) =>
      /^(PATH|PATHEXT|SYSTEMROOT|WINDIR|COMSPEC|TEMP|TMP|HOME|USERPROFILE|APPDATA|LOCALAPPDATA|PROGRAMDATA|JAVA_HOME|HTTP_PROXY|HTTPS_PROXY|NO_PROXY|SSL_CERT_FILE|CURL_CA_BUNDLE|PLAYWRIGHT_BROWSERS_PATH)$/i.test(
        key,
      ),
    ),
  ),
  CI: "true",
  GCLOUD_PROJECT: "demo-vitech",
  FIREBASE_PROJECT_ID: "demo-vitech",
  FIREBASE_ADMIN_UID: "vitech-demo-admin",
  REGISTRATION_HMAC_SECRET: "local-test-secret-never-use-in-production-123456",
  SITE_ORIGIN: "http://127.0.0.1:3100",
  USE_FIREBASE_EMULATORS: "true",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
  FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true",
  NEXT_PUBLIC_FIREBASE_API_KEY: "demo-api-key",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-vitech",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-vitech.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_APP_ID: "demo-vitech-app",
  TRUSTED_CLIENT_IP_HEADER: "",
};
if (process.env.NODE_ENV === "production")
  throw Error("Do not run emulator checks in production");
// A portable Java runtime may be supplied inside the ignored .tools directory.
const javaRoot = path.resolve(".tools/java21");
if (existsSync(javaRoot)) {
  const directory = readdirSync(javaRoot).find((name) =>
    existsSync(
      path.join(
        javaRoot,
        name,
        "bin",
        process.platform === "win32" ? "java.exe" : "java",
      ),
    ),
  );
  if (directory) {
    env.JAVA_HOME = path.join(javaRoot, directory);
    env.PATH =
      path.join(env.JAVA_HOME, "bin") + path.delimiter + (env.PATH ?? "");
  }
}
const child = spawn(
  process.execPath,
  [
    "node_modules/firebase-tools/lib/bin/firebase.js",
    "emulators:exec",
    "--only",
    "auth,firestore",
    "--project",
    "demo-vitech",
    "node scripts/run-emulator-checks.mjs",
  ],
  { stdio: "inherit", env },
);
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
