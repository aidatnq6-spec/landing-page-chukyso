import { registrationSchema } from "@/lib/registrations/schema";
import { ApiError, failure, json, readJson } from "@/lib/server/http";
import {
  createRegistration,
  sourceKey,
} from "@/lib/server/registration-service";
import { isConfigured } from "@/lib/server/config";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (!isConfigured())
      throw new ApiError(
        503,
        "configuration",
        "Form tạm chưa sẵn sàng. Vui lòng gọi 0968.273.868 để đăng ký.",
      );
    if (
      request.headers.get("origin") !== new URL(process.env.SITE_ORIGIN!).origin
    )
      throw new ApiError(403, "origin", "Yêu cầu không hợp lệ.");
    const parsed = registrationSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      const fields = Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
      );
      throw new ApiError(
        400,
        "validation",
        "Vui lòng kiểm tra thông tin đã nhập.",
        fields,
      );
    }
    const created = await createRegistration(parsed.data, sourceKey(request));
    return json({ ok: true }, created ? 201 : 200);
  } catch (error) {
    return failure(error);
  }
}
