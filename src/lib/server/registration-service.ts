import "server-only";
import { createHmac } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { firebaseAdmin } from "@/lib/firebase/admin";
import { nameKey } from "@/lib/registrations/search";
import type { RegistrationInput } from "@/lib/registrations/schema";
import { secret } from "./config";
import { ApiError } from "./http";
export const digest = (value: string) =>
  createHmac("sha256", secret()).update(value).digest("hex");
export function sourceKey(request: Request) {
  const header = process.env.TRUSTED_CLIENT_IP_HEADER;
  const raw = header ? request.headers.get(header) : null;
  return raw && /^[a-fA-F0-9:.]{3,64}$/.test(raw) ? raw : "unknown";
}
export async function createRegistration(
  input: RegistrationInput,
  source: string,
) {
  const { db } = firebaseAdmin();
  const { requestId, website, ...contact } = input;
  void website;
  const payloadHash = digest(JSON.stringify(contact));
  const leadRef = db.collection("registrations").doc(requestId),
    metaRef = db.collection("registrationRequests").doc(requestId);
  const window = Math.floor(Date.now() / 600000);
  const limits = [
    ["ip", source],
    ["phone", input.phone],
  ].map(([kind, key]) =>
    db.collection("rateLimits").doc(digest(`${kind}:${key}:${window}`)),
  );
  return db.runTransaction(async (tx) => {
    const [meta, ...counters] = await tx.getAll(metaRef, ...limits);
    if (meta.exists) {
      if (meta.data()?.payloadHash !== payloadHash)
        throw new ApiError(
          409,
          "conflict",
          "Yêu cầu đã thay đổi. Vui lòng gửi lại với mã mới.",
        );
      return false;
    }
    if (counters.some((doc) => (doc.data()?.count ?? 0) >= 5))
      throw new ApiError(
        429,
        "rate-limit",
        "Bạn đã gửi nhiều lần. Vui lòng thử lại sau 10 phút hoặc gọi hotline.",
      );
    tx.create(leadRef, {
      ...contact,
      nameKey: nameKey(input.fullName),
      emailKey: input.email.toLowerCase(),
      phoneKey: input.phone,
      status: "new",
      notes: "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    tx.create(metaRef, {
      payloadHash,
      createdAt: FieldValue.serverTimestamp(),
    });
    limits.forEach((ref, i) =>
      tx.set(ref, {
        count: (counters[i].data()?.count ?? 0) + 1,
        expiresAt: Timestamp.fromMillis((window + 2) * 600000),
      }),
    );
    return true;
  });
}
