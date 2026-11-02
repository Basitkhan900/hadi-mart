"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { Lock, User, Shield, ArrowLeft } from "lucide-react";

const schema = z.object({
  username: z.string().min(1, "Enter your username"),
  password: z.string().min(1, "Enter your password"),
});

export default function AdminLogin() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const submit = handleSubmit(async (v) => {
    setLoading(true);
    setErr("");
    const res = await fetch("/api/login", { method: "POST", body: JSON.stringify(v) });
    if (res.ok) router.push("/admin");
    else {
      const data = await res.json();
      setErr(data.error ?? "Login failed");
    }
    setLoading(false);
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-4xl bg-white p-8 shadow-2xl dark:bg-[#0f1a17]">
          {/* Icon */}
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-3xl bg-emerald/10">
            <Shield size={26} className="text-emerald" />
          </div>

          <h1 className="font-display text-2xl font-extrabold">Admin Access</h1>
          <p className="mt-1 text-sm text-ink/50">Sign in to manage Hadi Mart.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Username */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" />
                <input
                  {...register("username")}
                  placeholder="admin"
                  className="input pl-10"
                  autoComplete="username"
                />
              </div>
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" />
                <input
                  type="password"
                  {...register("password")}
                  placeholder="admin123"
                  className="input pl-10"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {err && (
              <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-900/20">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-emerald w-full disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in…
                </span>
              ) : (
                "Sign in to Admin"
              )}
            </button>
          </form>
        </div>

        <Link href="/" className="mt-6 flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft size={14} /> Back to store
        </Link>
      </div>
    </main>
  );
}
