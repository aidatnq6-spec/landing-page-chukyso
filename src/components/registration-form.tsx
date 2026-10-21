"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { planNames } from "@/lib/business";
import { registrationSchema } from "@/lib/registrations/schema";
import {
  readRegistrationResponse,
  RegistrationResponseError,
} from "@/lib/registrations/response";
const empty = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  planId: "consultation",
  website: "",
};
export default function RegistrationForm({ ready }: { ready: boolean }) {
  const [values, setValues] = useState(empty),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false);
  const pending = useRef<{ key: string; id: string } | null>(null),
    locked = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!Object.keys(errors).length) return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    firstInvalid?.focus({ preventScroll: true });
    firstInvalid?.scrollIntoView({
      block: "center",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [errors]);
  useEffect(() => {
    const sync = () => {
      const p = new URL(window.location.href).searchParams.get("plan");
      setValues((v) => ({
        ...v,
        planId: p && Object.hasOwn(planNames, p) ? p : "consultation",
      }));
    };
    sync();
    window.addEventListener("vitech:plan", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("vitech:plan", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (locked.current) return;
    setErrors({});
    setMessage("");
    const key = JSON.stringify(values);
    if (pending.current?.key !== key)
      pending.current = { key, id: crypto.randomUUID() };
    const parsed = registrationSchema.safeParse({
      ...values,
      requestId: pending.current.id,
    });
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
        ),
      );
      return;
    }
    locked.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, requestId: pending.current.id }),
      });
      await readRegistrationResponse(response);
      setDone(true);
      setValues(empty);
      pending.current = null;
    } catch (error) {
      if (error instanceof RegistrationResponseError) {
        setErrors(error.fields);
        if (error.status === 409) pending.current = null;
      }
      setMessage(
        error instanceof RegistrationResponseError
          ? error.message
          : "Kết nối bị gián đoạn. Vui lòng thử lại hoặc gọi 0968.273.868.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  if (done)
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={48} />
        <h3>VI-TECH đã nhận đăng ký của bạn.</h3>
        <p>Nhân viên sẽ liên hệ để tư vấn và hoàn tất đơn hàng.</p>
        <button
          className="button outline"
          onClick={() => {
            setDone(false);
            setMessage("");
          }}
        >
          Gửi đăng ký khác
        </button>
      </div>
    );
  return (
    <form
      ref={formRef}
      className="registration-form"
      onSubmit={submit}
      noValidate
      aria-label="Đăng ký mua chữ ký số"
    >
      <div className="form-heading">
        <h3>Thông tin đăng ký</h3>
        <span>Các trường đều bắt buộc</span>
      </div>
      <span
        id="registration-error-summary"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {Object.keys(errors).length
          ? `Vui lòng kiểm tra ${Object.keys(errors).length} trường thông tin chưa hợp lệ.`
          : ""}
      </span>
      <div className="form-grid">
        {(
          [
            {
              name: "fullName",
              label: "Họ và tên",
              auto: "name",
              type: "text",
              placeholder: "Nguyễn Văn An",
            },
            {
              name: "phone",
              label: "Số điện thoại",
              auto: "tel",
              type: "tel",
              placeholder: "Số điện thoại liên hệ",
            },
            {
              name: "email",
              label: "Email",
              auto: "email",
              type: "email",
              placeholder: "email@congty.vn",
            },
            {
              name: "address",
              label: "Địa chỉ",
              auto: "street-address",
              type: "text",
              placeholder: "Địa chỉ liên hệ",
            },
          ] as const
        ).map((field) => (
          <div
            className={
              field.name === "email" || field.name === "address" ? "span-2" : ""
            }
            key={field.name}
          >
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.auto}
              value={values[field.name]}
              placeholder={field.placeholder}
              required
              maxLength={
                field.name === "address"
                  ? 500
                  : field.name === "fullName"
                    ? 120
                    : field.name === "email"
                      ? 254
                      : 30
              }
              onChange={(e) =>
                setValues({ ...values, [field.name]: e.target.value })
              }
              aria-invalid={!!errors[field.name]}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            />
            {errors[field.name] ? (
              <small id={`${field.name}-error`} className="field-error">
                {errors[field.name]}
              </small>
            ) : null}
          </div>
        ))}
        <div className="span-2">
          <label htmlFor="planId">Gói quan tâm</label>
          <select
            id="planId"
            value={values.planId}
            onChange={(e) => setValues({ ...values, planId: e.target.value })}
          >
            {Object.entries(planNames).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => setValues({ ...values, website: e.target.value })}
        />
      </div>
      <p className="privacy">
        Thông tin của bạn được dùng để liên hệ tư vấn về yêu cầu đăng ký chữ ký
        số.
      </p>
      {!ready ? (
        <p className="notice">
          Form tạm chưa sẵn sàng. Vui lòng gọi{" "}
          <a href="tel:0968273868">0968.273.868</a> để đăng ký.
        </p>
      ) : null}
      {message ? (
        <p className="notice error" role="alert">
          {message}
        </p>
      ) : null}
      <button className="button submit" disabled={busy || !ready} type="submit">
        {busy ? "Đang gửi đăng ký…" : "Gửi đăng ký mua chữ ký số"}
        <ArrowRight size={18} />
      </button>
      <span className="sr-only" aria-live="polite">
        {busy ? "Đang gửi đăng ký" : ""}
      </span>
      <div className="form-bottom">
        <Phone size={14} /> Cần trao đổi ngay?{" "}
        <a href="tel:0968273868">0968.273.868</a>
      </div>
    </form>
  );
}
