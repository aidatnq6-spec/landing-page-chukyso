import { z } from "zod";
import { phoneKey } from "./search";
export const planIdSchema = z.enum([
  "ica-1y",
  "ica-2y",
  "ica-3y",
  "consultation",
]);
export const statusSchema = z.enum([
  "new",
  "contacted",
  "consulting",
  "completed",
  "not-interested",
]);
export const registrationSchema = z
  .object({
    requestId: z.uuid(),
    fullName: z
      .string()
      .trim()
      .min(2, "Nhập họ và tên (ít nhất 2 ký tự).")
      .max(120),
    email: z
      .email("Nhập email hợp lệ.")
      .max(254)
      .transform((s) => s.toLowerCase()),
    phone: z
      .string()
      .max(30)
      .transform(phoneKey)
      .pipe(
        z.string().regex(/^0\d{9,10}$/, "Nhập số điện thoại Việt Nam hợp lệ."),
      ),
    address: z
      .string()
      .trim()
      .min(5, "Nhập địa chỉ (ít nhất 5 ký tự).")
      .max(500),
    planId: planIdSchema,
    website: z.string().max(0),
  })
  .strict();
export const updateSchema = z
  .object({ status: statusSchema, notes: z.string().trim().max(2000) })
  .strict();
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LeadStatus = z.infer<typeof statusSchema>;
