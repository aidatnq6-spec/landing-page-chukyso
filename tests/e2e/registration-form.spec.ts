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
  const name = page.locator("#fullName");
  const phone = page.locator("#phone");
  await expect(name).toHaveCSS("font-size", "16px");
  await expect(page.locator('label[for="fullName"]')).toHaveCSS(
    "font-size",
    "14px",
  );
  await expect(page.locator(".privacy")).toHaveCSS("font-size", "12px");
  await expect(page.locator(".site-header")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  const nameBox = (await name.boundingBox())!;
  const phoneBox = (await phone.boundingBox())!;
  expect(phoneBox.y).toBeGreaterThan(nameBox.y + nameBox.height);
  expect(phoneBox.x).toBe(nameBox.x);
  expect(phoneBox.width).toBe(nameBox.width);
});

test("validation focuses the first invalid field in visual order", async ({
  page,
}) => {
  test.skip(
    process.env.USE_FIREBASE_EMULATORS !== "true",
    "Requires form-ready configuration",
  );
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  let requests = 0;
  await page.route("**/api/registrations", async (route) => {
    requests++;
    await route.fulfill({
      status: 400,
      json: {
        error: {
          message: "Vui lòng kiểm tra số điện thoại.",
          fields: { phone: "Số điện thoại chưa hợp lệ." },
        },
      },
    });
  });
  const submit = page.locator('.registration-form button[type="submit"]');
  await submit.click();
  await expect(page.locator("#fullName")).toBeFocused();
  await expect(
    page.locator('.registration-form [aria-invalid="true"]'),
  ).toHaveCount(4);
  await expect(page.locator("#registration-error-summary")).toContainText(
    "4 trường",
  );
  await expect(page.locator("#fullName")).toHaveAttribute(
    "aria-describedby",
    "fullName-error",
  );
  const headerBox = (await page.locator(".site-header").boundingBox())!;
  const fieldBox = (await page.locator("#fullName").boundingBox())!;
  expect(fieldBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
  await page.locator("#fullName").fill("Nguyễn An");
  await submit.click();
  await expect(page.locator("#phone")).toBeFocused();
  expect(requests).toBe(0);
  await page.locator("#phone").fill("0968273868");
  await page.locator("#email").fill("an@example.test");
  await page.locator("#address").fill("24 Thành Vinh 1");
  await submit.click();
  await expect(page.locator("#phone")).toBeFocused();
  await expect(page.locator("#phone-error")).toHaveText(
    "Số điện thoại chưa hợp lệ.",
  );
  await expect(page.locator("#fullName")).toHaveValue("Nguyễn An");
  expect(requests).toBe(1);
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
    if (requests.length === 1) {
      await route.fulfill({ status: 500, body: "" });
      return;
    }
    await route.fulfill({
      status: 503,
      json: { error: { message: "Lỗi thử nghiệm. Vui lòng thử lại." } },
    });
  });
  await page.getByRole("button", { name: "Gửi đăng ký mua chữ ký số" }).click();
  await expect(
    page.getByText(/Chưa xác nhận được đăng ký \(HTTP 500\)/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Gửi đăng ký mua chữ ký số" }).click();
  await expect(
    page.getByText("Lỗi thử nghiệm. Vui lòng thử lại.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Họ và tên", { exact: true })).toHaveValue(
    "Nguyễn An",
  );
  await page.getByRole("button", { name: "Gửi đăng ký mua chữ ký số" }).click();
  await expect.poll(() => requests.length).toBe(3);
  expect(requests[0]).toBe(requests[1]);
  expect(requests[1]).toBe(requests[2]);
  await page.unroute("**/api/registrations");
  await page.route("**/api/registrations", (route) =>
    route.fulfill({ status: 201, json: { ok: true } }),
  );
  await page.getByRole("button", { name: "Gửi đăng ký mua chữ ký số" }).click();
  await expect(
    page.getByText("VI-TECH đã nhận đăng ký của bạn."),
  ).toBeVisible();
});
