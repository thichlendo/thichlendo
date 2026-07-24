"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng ký thất bại.");
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
          Tạo tài khoản Miu<span className="text-[#FF6A3D]">Mo</span>
        </h1>
        <p className="text-sm text-[#9C8F84] mb-6">
          Dùng chung tài khoản với ứng dụng Android.
        </p>

        <Field
          label="Tên đăng nhập"
          value={username}
          onChange={setUsername}
          placeholder="chữ, số, gạch dưới"
        />
        <Field
          label="Tên hiển thị"
          value={displayName}
          onChange={setDisplayName}
          placeholder="Tên hiển thị công khai"
        />
        <Field label="Mật khẩu" value={password} onChange={setPassword} type="password" />
        <Field label="Nhập lại mật khẩu" value={confirm} onChange={setConfirm} type="password" />

        {error && <p className="text-sm text-[#FF6A3D] mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF6A3D] hover:bg-[#FF7D51] disabled:opacity-50 text-[#14100F] font-semibold py-3 rounded-full transition-colors"
        >
          {loading ? "Đang tạo..." : "Đăng ký"}
        </button>

        <p className="text-sm text-[#9C8F84] mt-5 text-center">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-[#F5EFE6] underline underline-offset-2">
            Đăng nhập
          </a>
        </p>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block mb-4">
      <span className="block text-xs text-[#9C8F84] mb-1.5">{label}</span>
      <input
        type={type}
        required
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#14100F] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-[#F5EFE6] outline-none focus:border-[#FF6A3D] transition-colors"
      />
    </label>
  );
      }
