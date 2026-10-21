import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
let connected = false;
export function clientAuth() {
  const emulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
  if (
    emulator &&
    (process.env.NODE_ENV === "production" ||
      !["localhost", "127.0.0.1"].includes(window.location.hostname))
  )
    throw new Error("Local emulator only");
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !emulator)
    throw new Error("Trang quản trị chưa được cấu hình Firebase.");
  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
  const auth = getAuth(app);
  if (emulator && !connected) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    connected = true;
  }
  return auth;
}
