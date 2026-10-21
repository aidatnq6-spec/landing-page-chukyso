import { describe, it, expect } from "vitest";
import { registrationSchema, updateSchema } from "@/lib/registrations/schema";
import { nameKey, phoneKey } from "@/lib/registrations/search";
const valid = {
  requestId: "a3883e0c-4cbc-4b19-9adf-7aa279670523",
  fullName: "Nguyễn Văn An",
  email: "an@example.com",
  phone: "+84 968.273.868",
  address: "24 Thành Vinh 1",
  planId: "ica-3y",
  website: "",
};
describe("registration validation", () => {
  it("normalizes Vietnamese phone and whitespace", () =>
    expect(
      registrationSchema.parse({ ...valid, fullName: " An Nguyễn " }).phone,
    ).toBe("0968273868"));
  for (const invalid of [
    { email: "bad" },
    { phone: "123" },
    { fullName: "" },
    { address: "" },
    { planId: "fpt-3y" },
    { status: "completed" },
    { notes: "injected" },
  ])
    it(`rejects ${JSON.stringify(invalid)}`, () =>
      expect(
        registrationSchema.safeParse({ ...valid, ...invalid }).success,
      ).toBe(false));
  it("rejects oversized fields", () =>
    expect(
      registrationSchema.safeParse({ ...valid, address: "x".repeat(501) })
        .success,
    ).toBe(false));
  it("protects contact details from updates", () =>
    expect(
      updateSchema.safeParse({
        status: "new",
        notes: "",
        email: "changed@example.com",
      }).success,
    ).toBe(false));
  it("normalizes search keys", () => {
    expect(nameKey("  Đặng Ánh  ")).toBe("dang anh");
    expect(phoneKey("+84 968-273-868")).toBe("0968273868");
  });
});
