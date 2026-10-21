import { z } from "zod";

const responseSchema = z.union([
  z.object({ ok: z.literal(true) }),
  z.object({
    error: z.object({
      message: z.string(),
      fields: z.record(z.string(), z.string()).optional(),
    }),
  }),
]);

export class RegistrationResponseError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

export async function readRegistrationResponse(response: Response) {
  const fallback = `Chưa xác nhận được đăng ký (HTTP ${response.status}). Vui lòng thử lại hoặc gọi 0968.273.868.`;
  const text = await response.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new RegistrationResponseError(fallback, response.status);
  }
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) {
    throw new RegistrationResponseError(fallback, response.status);
  }
  if ("error" in parsed.data) {
    throw new RegistrationResponseError(
      parsed.data.error.message,
      response.status,
      parsed.data.error.fields,
    );
  }
  if (!response.ok) {
    throw new RegistrationResponseError(fallback, response.status);
  }
}
