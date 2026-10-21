import "server-only";
import { planNames } from "@/lib/business";
import type { RegistrationInput } from "@/lib/registrations/schema";

// Keep user-provided line breaks from impersonating message field labels.
const line = (value: string) => value.replace(/\s+/g, " ").trim();

export async function notifyNewRegistration(
  input: RegistrationInput,
  registeredAt: Date,
): Promise<"skipped" | "sent" | "failed"> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return "skipped";
  if (!/^-\d+$/.test(chatId)) {
    console.warn("Telegram group ID is invalid; notification skipped.");
    return "skipped";
  }
  try {
    const text = [
      "VI-TECH · Đăng ký chữ ký số mới",
      "",
      `Họ và tên: ${line(input.fullName)}`,
      `Số điện thoại: ${line(input.phone)}`,
      `Email: ${line(input.email)}`,
      `Địa chỉ: ${line(input.address)}`,
      `Gói quan tâm: ${planNames[input.planId]}`,
      `Thời gian: ${new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "medium",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(registeredAt)}`,
      `Mã đăng ký: ${input.requestId}`,
      "",
      `Quản lý khách hàng: ${new URL("/admin", process.env.SITE_ORIGIN).href}`,
    ].join("\n");
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          link_preview_options: { is_disabled: true },
        }),
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
        redirect: "error",
      },
    );
    const body: unknown = response.ok ? await response.json() : null;
    if (
      !response.ok ||
      typeof body !== "object" ||
      body === null ||
      !("ok" in body) ||
      body.ok !== true
    ) {
      console.warn("Telegram notification failed", {
        requestId: input.requestId,
        status: response.status,
      });
      return "failed";
    }
    return "sent";
  } catch {
    // Fetch errors may contain the token-bearing URL. Never log the exception.
    console.warn("Telegram notification failed", {
      requestId: input.requestId,
    });
    return "failed";
  }
}
