"use client";
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  browserSessionPersistence,
  setPersistence,
  type User,
} from "firebase/auth";
import { LogOut, ArrowLeft, ShieldCheck } from "lucide-react";
import { clientAuth } from "@/lib/firebase/client";
import Dashboard from "./dashboard";
import Link from "next/link";
export default function AdminApp() {
  const [user, setUser] = useState<User | null>(null),
    [checking, setChecking] = useState(true),
    [error, setError] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        unsubscribe = onAuthStateChanged(clientAuth(), (u) => {
          if (active) {
            setUser(u);
            setChecking(false);
          }
        });
      } catch {
        setError("Trang quản trị chưa được cấu hình Firebase.");
        setChecking(false);
      }
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const auth = clientAuth();
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
    } catch {
      setError(
        "Không đăng nhập được. Kiểm tra thông tin hoặc cấu hình Firebase và thử lại.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link href="/" className="admin-brand">
          VI-TECH <span>Quản lý đăng ký</span>
        </Link>
        {user ? (
          <button
            className="button outline compact"
            onClick={() => {
              setUser(null);
              void signOut(clientAuth());
            }}
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        ) : (
          <Link href="/" className="admin-back">
            <ArrowLeft size={16} />
            Về trang chủ
          </Link>
        )}
      </header>
      {checking ? (
        <p className="admin-loading" role="status">
          Đang kiểm tra đăng nhập…
        </p>
      ) : user ? (
        <Dashboard key={user.uid} user={user} />
      ) : (
        <main className="login-card">
          <ShieldCheck size={31} />
          <h1>Đăng nhập quản lý</h1>
          <p>
            Dùng tài khoản chung được VI-TECH cấp để theo dõi và chăm sóc khách
            hàng.
          </p>
          <form onSubmit={login}>
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="admin-password">Mật khẩu</label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? (
              <p role="alert" className="notice error">
                {error}
              </p>
            ) : null}
            <button className="button" disabled={busy}>
              {busy ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
          </form>
          <small>Tài khoản được tạo bởi người quản lý dự án Firebase.</small>
        </main>
      )}
    </div>
  );
}
