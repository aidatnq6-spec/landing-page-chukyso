"use client";
import { useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { X } from "lucide-react";
import { adminFetch } from "@/lib/admin/api-client";
import type { Lead } from "@/lib/registrations/types";
import type { LeadStatus } from "@/lib/registrations/schema";
import { planNames, statusNames } from "@/lib/business";
export default function RegistrationDetail({
  user,
  lead,
  onClose,
  onSaved,
}: {
  user: User;
  lead: Lead;
  onClose: () => void;
  onSaved: (lead: Lead) => void;
}) {
  const [status, setStatus] = useState(lead.status),
    [notes, setNotes] = useState(lead.notes),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null),
    controller = useRef<AbortController | null>(null);
  useEffect(() => {
    const element = dialog.current;
    const focused = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => {
      controller.current?.abort();
      element?.close();
      focused?.focus();
    };
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    setError("");
    controller.current = new AbortController();
    try {
      const data = await adminFetch<Lead>(
        user,
        `/api/admin/registrations/${lead.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, notes }),
          signal: controller.current.signal,
        },
      );
      setMessage("Đã lưu trạng thái và ghi chú.");
      onSaved(data);
    } catch (err) {
      if (!controller.current.signal.aborted)
        setError(
          err instanceof Error
            ? err.message
            : "Chưa lưu được. Vui lòng thử lại.",
        );
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="detail-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="detail-heading"
    >
      <div className="detail-heading">
        <div>
          <span className="kicker">Thông tin đăng ký</span>
          <h2 id="detail-heading">{lead.fullName}</h2>
        </div>
        <button
          aria-label="Đóng chi tiết"
          className="icon-button"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </div>
      <dl className="detail-data">
        <dt>Email</dt>
        <dd>
          <a href={`mailto:${lead.email}`}>{lead.email}</a>
        </dd>
        <dt>Số điện thoại</dt>
        <dd>
          <a href={`tel:${lead.phone}`}>{lead.phone}</a>
        </dd>
        <dt>Địa chỉ</dt>
        <dd>{lead.address}</dd>
        <dt>Gói quan tâm</dt>
        <dd>{planNames[lead.planId]}</dd>
        <dt>Thời điểm đăng ký</dt>
        <dd>
          {new Date(lead.createdAt).toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
          })}
        </dd>
      </dl>
      <form onSubmit={save}>
        <label htmlFor="detail-status">Trạng thái liên hệ</label>
        <select
          id="detail-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus)}
        >
          {Object.entries(statusNames).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <label htmlFor="notes">Ghi chú tư vấn</label>
        <textarea
          id="notes"
          rows={5}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Nội dung trao đổi, nhu cầu và việc cần theo dõi…"
        />
        <p className="search-hint">{notes.length}/2000 ký tự</p>
        {message ? (
          <p role="status" className="notice">
            {message}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="notice error">
            {error}
          </p>
        ) : null}
        <button className="button" disabled={busy}>
          {busy ? "Đang lưu…" : "Lưu trạng thái và ghi chú"}
        </button>
      </form>
    </dialog>
  );
}
