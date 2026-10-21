import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { emulatorEnabled, isConfigured } from "@/lib/server/config";
export function firebaseAdmin() {
  if (!isConfigured()) throw new Error("Firebase not configured");
  const emulator = emulatorEnabled();
  const app =
    getApps()[0] ??
    initializeApp(
      emulator
        ? { projectId: "demo-vitech" }
        : {
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(
                /\\n/g,
                "\n",
              ),
            }),
          },
    );
  return { db: getFirestore(app), auth: getAuth(app) };
}
