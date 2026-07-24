"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng nhập thất bại.");
        return;
      }
      router.push("/feed");
    } catch {
      setError("Không kết nối được máy chủ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#14100F] text-[#F5EFE6] flex items-center justify-center px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#1E1815] border border-white/5 rounded-2xl p-8"
      >
        <h1 className="text-2xl font-extrabold mb-1">
          Đăng nhập Miu<span className="text-[#FF6A3D]">Mo</span>
        </h1>
        <p className="text-sm text-[#9C8F84] mb-6">Dùng tài khoản đã tạo trên app hoặc web.</p>

        <label className="block mb-4">
          <span className="block text-xs text-[#9C8F84] mb-1.5">Tên đăng nhập</span>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#14100F] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-[#F5EFE6] outline-none focus:border-[#FF6A3D] transition-colors"
          />
        </label>

        <label className="block mb-4">
          <span className="block text-xs text-[#9C8F84] mb-1.5">Mật khẩu</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#14100F] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-[#F5EFE6] outline-none focus:border-[#FF6A3D] transition-colors"
          />
        </label>

        {error && <p className="text-sm text-[#FF6A3D] mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF6A3D] hover:bg-[#FF7D51] disabled:opacity-50 text-[#14100F] font-semibold py-3 rounded-full transition-colors"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="text-sm text-[#9C8F84] mt-5 text-center">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-[#F5EFE6] underline underline-offset-2">
            Đăng ký
          </a>
        </p>
      </form>
    </main>
  );
                              }
