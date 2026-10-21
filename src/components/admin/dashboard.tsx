"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { ArrowLeft, ArrowRight, Search, RefreshCw } from "lucide-react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { planNames, statusNames } from "@/lib/business";
import type { Lead } from "@/lib/registrations/types";
import RegistrationDetail from "./registration-detail";
const date = (s: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(s));
type Result = { items: Lead[]; nextCursor: string | null };
export default function Dashboard({ user }: { user: User }) {
  const [status, setStatus] = useState(""),
    [searchBy, setSearchBy] = useState("name"),
    [q, setQ] = useState(""),
    [search, setSearch] = useState(""),
    [cursors, setCursors] = useState<(string | null)[]>([null]),
    [result, setResult] = useState<Result>({ items: [], nextCursor: null }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<Lead | null>(null),
    [refresh, setRefresh] = useState(0),
    [denied, setDenied] = useState(false);
  const filters = useRef({ status, searchBy, search });
  useEffect(() => {
    const t = setTimeout(() => setSearch(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    if (denied) return;
    const previous = filters.current;
    const changed =
      previous.status !== status ||
      previous.searchBy !== searchBy ||
      previous.search !== search;
    filters.current = { status, searchBy, search };
    if (changed && cursors.length !== 1) {
      setCursors([null]);
      return;
    }
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ status, searchBy, q: search });
    const cursor = cursors.at(-1);
    if (cursor && !changed) params.set("cursor", cursor);
    adminFetch<Result>(user, `/api/admin/registrations?${params}`, {
      signal: controller.signal,
    })
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((err) => {
        if (!active) return;
        setResult({ items: [], nextCursor: null });
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu.");
        if (err instanceof AdminApiError && [401, 403].includes(err.status))
          setDenied(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [user, status, searchBy, search, cursors, refresh, denied]);
  const saved = useCallback((lead: Lead) => {
    setSelected(lead);
    setCursors([null]);
    setRefresh((v) => v + 1);
  }, []);
  return (
    <main className="dashboard">
      <div className="dashboard-title">
        <div>
          <span className="kicker">Theo dõi & chăm sóc khách hàng</span>
          <h1>Đăng ký chữ ký số</h1>
          <p>Quản lý thông tin đăng ký và tiến độ liên hệ.</p>
        </div>
        <button
          className="button outline compact"
          disabled={loading || denied}
          onClick={() => setRefresh((v) => v + 1)}
        >
          <RefreshCw size={15} />
          Tải lại
        </button>
      </div>
      {!denied ? (
        <>
          <div className="admin-filters">
            <div>
              <label htmlFor="status-filter">Trạng thái</label>
              <select
                id="status-filter"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCursors([null]);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(statusNames).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="search-by">Tìm theo</label>
              <select
                id="search-by"
                value={searchBy}
                onChange={(e) => {
                  setSearchBy(e.target.value);
                  setCursors([null]);
                }}
              >
                <option value="name">Họ và tên</option>
                <option value="phone">Số điện thoại</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div className="admin-search">
              <label htmlFor="search">Từ khóa</label>
              <div>
                <Search size={17} />
                <input
                  id="search"
                  placeholder="Nhập phần đầu thông tin cần tìm"
                  value={q}
                  maxLength={120}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
          </div>
          <p className="search-hint">
            Tìm từ đầu tên, email hoặc số điện thoại; tên có thể nhập không dấu.{" "}
            {search
              ? "Kết quả sắp theo khóa tìm kiếm."
              : "Danh sách sắp theo thời điểm mới nhất."}
          </p>
        </>
      ) : null}
      {error ? (
        <p className="notice error" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? (
        <div className="admin-empty" role="status">
          Đang tải danh sách…
        </div>
      ) : !error && result.items.length === 0 ? (
        <div className="admin-empty">
          <h2>Chưa có đăng ký phù hợp</h2>
          <p>
            Khách hàng gửi thông tin trên landing page sẽ xuất hiện tại đây. Thử
            thay đổi bộ lọc nếu cần.
          </p>
        </div>
      ) : !error ? (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Gói quan tâm</th>
                  <th>Thời điểm đăng ký</th>
                  <th>Trạng thái</th>
                  <th>
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <strong>{lead.fullName}</strong>
                    </td>
                    <td>
                      <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                      <small>{lead.email}</small>
                    </td>
                    <td>{planNames[lead.planId] || lead.planId}</td>
                    <td>{date(lead.createdAt)}</td>
                    <td>
                      <span className={`status-badge status-${lead.status}`}>
                        {statusNames[lead.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        className="detail-button"
                        onClick={() => setSelected(lead)}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>
              Trang {cursors.length} · {result.items.length} đăng ký
            </span>
            <div>
              <button
                className="button outline compact"
                disabled={cursors.length === 1}
                onClick={() => setCursors((c) => c.slice(0, -1))}
              >
                <ArrowLeft size={15} />
                Trước
              </button>
              <button
                className="button outline compact"
                disabled={!result.nextCursor}
                onClick={() => setCursors((c) => [...c, result.nextCursor])}
              >
                Tiếp
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </>
      ) : null}
      {selected ? (
        <RegistrationDetail
          key={selected.id}
          user={user}
          lead={selected}
          onClose={() => setSelected(null)}
          onSaved={saved}
        />
      ) : null}
    </main>
  );
}
