import "server-only";
import { firebaseAdmin } from "@/lib/firebase/admin";
import { ApiError } from "./http";
export async function verifyAdmin(
  request: Request,
  verify: (token: string) => Promise<{ uid: string }>,
  allowedUid: string | undefined,
) {
  if (!allowedUid)
    throw new ApiError(
      503,
      "configuration",
      "Trang quản trị chưa được cấu hình.",
    );
  const match = request.headers
    .get("authorization")
    ?.match(/^Bearer ([^\s]+)$/);
  if (!match) throw new ApiError(401, "unauthorized", "Vui lòng đăng nhập.");
  let user;
  try {
    user = await verify(match[1]);
  } catch {
    throw new ApiError(401, "unauthorized", "Phiên đăng nhập đã hết hạn.");
  }
  if (user.uid !== allowedUid)
    throw new ApiError(
      403,
      "forbidden",
      "Tài khoản này không có quyền quản lý.",
    );
  return user;
}
export async function requireAdmin(request: Request) {
  return verifyAdmin(
    request,
    (token) => firebaseAdmin().auth.verifyIdToken(token, true),
    process.env.FIREBASE_ADMIN_UID,
  );
}
