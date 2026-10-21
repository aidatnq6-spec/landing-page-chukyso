import { test, expect } from "@playwright/test";
test("package selection and mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  for (const [years, id] of [
    [1, "ica-1y"],
    [2, "ica-2y"],
    [3, "ica-3y"],
  ] as const) {
    await page.getByRole("link", { name: `Chọn gói ${years} năm` }).click();
    await expect(page.getByLabel("Gói quan tâm")).toHaveValue(id);
  }
  await page.getByRole("link", { name: "Đăng ký tư vấn", exact: true }).click();
  await expect(page.getByLabel("Gói quan tâm")).toHaveValue("consultation");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("server errors preserve contact data; success follows response", async ({
  page,
}) => {
  test.skip(
    process.env.USE_FIREBASE_EMULATORS !== "true",
    "Requires form-ready configuration",
  );
  await page.goto("/");
  await page.getByLabel("Họ và tên", { exact: true }).fill("Nguyễn An");
  await page.getByLabel("Số điện thoại", { exact: true }).fill("0968273868");
  await page.getByLabel("Email", { exact: true }).fill("an@example.test");
  await page.getByLabel("Địa chỉ", { exact: true }).fill("24 Thành Vinh 1");
  const requests: string[] = [];
  await page.route("**/api/registrations", async (route) => {
    requests.push(route.request().postDataJSON().requestId);
    await route.fulfill({
      status: 503,
      json: { error: { message: "Lỗi thử nghiệm. Vui lòng thử lại." } },
    });
  });
  await page.getByRole("button", { name: "Gửi đăng ký mua chữ ký số" }).click();
  await expect(
    page.getByText("Lỗi thử nghiệm. Vui lòng thử lại.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Họ và tên", { exact: true })).toHaveValue(
    "Nguyễn An",
  );
  await page.getByRole("button", { name: "Gửi đăng ký mua chữ ký số" }).click();
  await expect.poll(() => requests.length).toBe(2);
  expect(requests[0]).toBe(requests[1]);
  await page.unroute("**/api/registrations");
  await page.route("**/api/registrations", (route) =>
    route.fulfill({ status: 201, json: { ok: true } }),
  );
  await page.getByRole("button", { name: "Gửi đăng ký mua chữ ký số" }).click();
  await expect(
    page.getByText("VI-TECH đã nhận đăng ký của bạn."),
  ).toBeVisible();
});
