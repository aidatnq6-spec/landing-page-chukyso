import { NextResponse } from "next/server";
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}
export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export function failure(error: unknown) {
  if (error instanceof ApiError)
    return json(
      {
        error: {
          code: error.code,
          message: error.message,
          fields: error.fields,
        },
      },
      error.status,
    );
  return json(
    {
      error: {
        code: "unavailable",
        message:
          "Dịch vụ tạm chưa sẵn sàng. Vui lòng thử lại hoặc gọi 0968.273.868.",
      },
    },
    503,
  );
}
export async function readJson(request: Request) {
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    throw new ApiError(415, "content-type", "Yêu cầu phải có định dạng JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "body", "Thiếu thông tin.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 8192) {
      await reader.cancel();
      throw new ApiError(
        413,
        "body-size",
        "Thông tin vượt quá độ dài cho phép.",
      );
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError(400, "json", "Thông tin không hợp lệ.");
  }
}
