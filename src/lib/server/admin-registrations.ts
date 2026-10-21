import "server-only";
import {
  FieldPath,
  FieldValue,
  Timestamp,
  type Query,
  type DocumentSnapshot,
} from "firebase-admin/firestore";
import { timingSafeEqual } from "node:crypto";
import { firebaseAdmin } from "@/lib/firebase/admin";
import { statusSchema, updateSchema } from "@/lib/registrations/schema";
import { nameKey, phoneKey } from "@/lib/registrations/search";
import { digest } from "./registration-service";
import { ApiError } from "./http";
export function serialize(doc: DocumentSnapshot) {
  const d = doc.data()!;
  return {
    id: doc.id,
    fullName: d.fullName,
    email: d.email,
    phone: d.phone,
    address: d.address,
    planId: d.planId,
    status: d.status,
    notes: d.notes,
    createdAt: d.createdAt.toDate().toISOString(),
    updatedAt: d.updatedAt.toDate().toISOString(),
  };
}
export function checkId(id: string) {
  if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id))
    throw new ApiError(400, "id", "Mã đăng ký không hợp lệ.");
}
export async function listRegistrations(params: URLSearchParams) {
  const status = params.get("status") || "",
    by = params.get("searchBy") || "name",
    raw = params.get("q")?.trim() || "";
  if (status && !statusSchema.safeParse(status).success)
    throw new ApiError(400, "status", "Trạng thái không hợp lệ.");
  if (!["name", "email", "phone"].includes(by) || raw.length > 120)
    throw new ApiError(400, "search", "Điều kiện tìm kiếm không hợp lệ.");
  const q =
    by === "name"
      ? nameKey(raw)
      : by === "phone"
        ? phoneKey(raw)
        : raw.toLowerCase();
  const field =
    by === "name" ? "nameKey" : by === "phone" ? "phoneKey" : "emailKey";
  const fingerprint = digest(JSON.stringify({ status, by, q }));
  let query: Query = firebaseAdmin().db.collection("registrations");
  if (status) query = query.where("status", "==", status);
  if (q)
    query = query
      .where(field, ">=", q)
      .where(field, "<", q + "\uf8ff")
      .orderBy(field, "asc");
  query = query
    .orderBy("createdAt", "desc")
    .orderBy(FieldPath.documentId(), "desc");
  const cursor = params.get("cursor");
  if (cursor) {
    try {
      if (cursor.length > 4096) throw Error();
      const [data, sig, ...extra] = cursor.split(".");
      if (extra.length || !sig) throw Error();
      const expected = Buffer.from(digest(data));
      const actual = Buffer.from(sig);
      if (
        actual.length !== expected.length ||
        !timingSafeEqual(actual, expected)
      )
        throw Error();
      const c = JSON.parse(Buffer.from(data, "base64url").toString());
      if (
        c.fp !== fingerprint ||
        !Number.isInteger(c.seconds) ||
        !Number.isInteger(c.nanoseconds) ||
        c.nanoseconds < 0 ||
        c.nanoseconds > 999999999
      )
        throw Error();
      checkId(c.id);
      const time = new Timestamp(c.seconds, c.nanoseconds);
      query = q
        ? query.startAfter(c.key, time, c.id)
        : query.startAfter(time, c.id);
    } catch {
      throw new ApiError(
        400,
        "cursor",
        "Trang dữ liệu không hợp lệ. Vui lòng tìm kiếm lại.",
      );
    }
  }
  const snapshot = await query.limit(21).get();
  const docs = snapshot.docs.slice(0, 20);
  let nextCursor: string | null = null;
  if (snapshot.docs.length > 20) {
    const last = docs[19],
      d = last.data();
    const data = Buffer.from(
      JSON.stringify({
        fp: fingerprint,
        id: last.id,
        seconds: d.createdAt.seconds,
        nanoseconds: d.createdAt.nanoseconds,
        key: q ? d[field] : null,
      }),
    ).toString("base64url");
    nextCursor = `${data}.${digest(data)}`;
  }
  return { items: docs.map(serialize), nextCursor };
}
export async function getRegistration(id: string) {
  checkId(id);
  const doc = await firebaseAdmin()
    .db.collection("registrations")
    .doc(id)
    .get();
  if (!doc.exists)
    throw new ApiError(404, "not-found", "Không tìm thấy đăng ký.");
  return serialize(doc);
}
export async function updateRegistration(id: string, body: unknown) {
  checkId(id);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    throw new ApiError(
      400,
      "validation",
      "Trạng thái hoặc ghi chú không hợp lệ.",
    );
  const ref = firebaseAdmin().db.collection("registrations").doc(id);
  await firebaseAdmin().db.runTransaction(async (tx) => {
    if (!(await tx.get(ref)).exists)
      throw new ApiError(404, "not-found", "Không tìm thấy đăng ký.");
    tx.update(ref, { ...parsed.data, updatedAt: FieldValue.serverTimestamp() });
  });
  return getRegistration(id);
}
