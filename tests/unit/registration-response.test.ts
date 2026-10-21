import { expect, it } from "vitest";
import { readRegistrationResponse } from "@/lib/registrations/response";

it("accepts only an explicit successful confirmation", async () => {
  await expect(
    readRegistrationResponse(Response.json({ ok: true }, { status: 201 })),
  ).resolves.toBeUndefined();
  await expect(
    readRegistrationResponse(Response.json({}, { status: 200 })),
  ).rejects.toMatchObject({ status: 200 });
});
it("handles an empty server error without exposing JSON parsing errors", async () => {
  await expect(
    readRegistrationResponse(new Response("", { status: 500 })),
  ).rejects.toMatchObject({
    status: 500,
    message: expect.stringContaining("HTTP 500"),
  });
});
it("handles an HTML proxy error", async () => {
  await expect(
    readRegistrationResponse(
      new Response("<h1>Bad gateway</h1>", { status: 502 }),
    ),
  ).rejects.toMatchObject({
    status: 502,
    message: expect.stringContaining("HTTP 502"),
  });
});
it("keeps server validation messages and field errors", async () => {
  await expect(
    readRegistrationResponse(
      Response.json(
        {
          error: {
            message: "Kiểm tra email.",
            fields: { email: "Email không hợp lệ." },
          },
        },
        { status: 400 },
      ),
    ),
  ).rejects.toMatchObject({
    status: 400,
    fields: { email: "Email không hợp lệ." },
  });
});
it("never accepts an error HTTP status as success", async () => {
  await expect(
    readRegistrationResponse(Response.json({ ok: true }, { status: 500 })),
  ).rejects.toMatchObject({ status: 500 });
});
