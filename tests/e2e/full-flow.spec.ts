import { test, expect } from "@playwright/test";
test.beforeEach(async ({ request }) => {
  test.skip(
    process.env.USE_FIREBASE_EMULATORS !== "true",
    "Requires local Firebase emulator",
  );
  await request.delete(
    "http://127.0.0.1:8080/emulator/v1/projects/demo-vitech/databases/(default)/documents",
  );
});
test("customer registration reaches admin and follow-up persists", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Chọn gói 3 năm" }).click();
  await expect(page.getByLabel("Gói quan tâm")).toHaveValue("ica-3y");
  await page
    .getByLabel("Họ và tên", { exact: true })
    .fill("Nguyễn An Kiểm Thử");
  await page.getByLabel("Số điện thoại", { exact: true }).fill("0968273868");
  await page.getByLabel("Email", { exact: true }).fill("customer@example.test");
  await page
    .getByLabel("Địa chỉ", { exact: true })
    .fill("24 Thành Vinh 1, Đà Nẵng");
  await page.getByRole("button", { name: "Gửi đăng ký mua chữ ký số" }).click();
  await expect(
    page.getByText("VI-TECH đã nhận đăng ký của bạn."),
  ).toBeVisible();
  const stored = await request.get(
    "http://127.0.0.1:8080/v1/projects/demo-vitech/databases/(default)/documents/registrations",
    { headers: { Authorization: "Bearer owner" } },
  );
  expect((await stored.json()).documents).toHaveLength(1);
  await page.goto("/admin");
  await page.getByLabel("Email", { exact: true }).fill("admin@vitech.test");
  await page.getByLabel("Mật khẩu").fill("Demo-only-password-123!");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(
    page.getByText("Nguyễn An Kiểm Thử", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xem chi tiết" }).click();
  await page.getByLabel("Trạng thái liên hệ").selectOption("consulting");
  await page.getByLabel("Ghi chú tư vấn").fill("Khách cần gia hạn ICA.");
  await page.getByRole("button", { name: "Lưu trạng thái và ghi chú" }).click();
  await expect(page.getByText("Đã lưu trạng thái và ghi chú.")).toBeVisible();
  await page.getByRole("button", { name: "Đóng chi tiết" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Xem chi tiết" }).click();
  await expect(page.getByLabel("Ghi chú tư vấn")).toHaveValue(
    "Khách cần gia hạn ICA.",
  );
  await expect(page.getByLabel("Trạng thái liên hệ")).toHaveValue("consulting");
  await page.getByRole("button", { name: "Đóng chi tiết" }).click();
  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await expect(
    page.getByRole("heading", { name: "Đăng nhập quản lý" }),
  ).toBeVisible();
  await expect(
    page.getByText("Nguyễn An Kiểm Thử", { exact: true }),
  ).toHaveCount(0);
});
test("other authenticated account cannot see registrations", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByLabel("Email", { exact: true }).fill("other@vitech.test");
  await page.getByLabel("Mật khẩu").fill("Demo-only-password-123!");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(
    page.getByText("Tài khoản này không có quyền quản lý."),
  ).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
});
