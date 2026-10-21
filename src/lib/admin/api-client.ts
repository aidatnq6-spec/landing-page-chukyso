import type { User } from "firebase/auth";
export class AdminApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function adminFetch<T>(
  user: User,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await user.getIdToken(attempt === 1);
    const response = await fetch(path, {
      ...options,
      cache: "no-store",
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
    if (response.status === 401 && attempt === 0) continue;
    const data = await response.json();
    if (!response.ok)
      throw new AdminApiError(
        response.status,
        data.error?.message || "Không thể tải dữ liệu. Vui lòng thử lại.",
      );
    return data;
  }
  throw new AdminApiError(401, "Vui lòng đăng nhập lại.");
}
