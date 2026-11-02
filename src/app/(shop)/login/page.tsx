"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/store";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, X, Check, Key, ExternalLink, AlertCircle, UserPlus, LogIn } from "lucide-react";

type Mode = "login" | "signup";

declare global {
  interface Window {
    google?: any;
  }
}

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

// Parse Real Google JWT ID Token
function parseGoogleJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to parse Google JWT:", err);
    return null;
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Real Google GSI State
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [clientId, setClientId] = useState(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [inputClientId, setInputClientId] = useState("");
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Load Google Identity Services script
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedId = localStorage.getItem("hm_google_client_id");
    if (savedId && !clientId) {
      setClientId(savedId);
    }

    if (window.google?.accounts?.id) {
      setGsiLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiLoaded(true);
    document.body.appendChild(script);
  }, [clientId]);

  // Handle Real Google Login response
  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setLoading(true);
    setError("");

    const payload = parseGoogleJwt(response.credential);
    if (!payload || !payload.email) {
      setError("Unable to get account details from Google.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google",
          name: payload.name || payload.email.split("@")[0],
          email: payload.email,
          avatar: payload.picture,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Google sign-in failed.");
        return;
      }

      login(data.user.name, data.user.email, data.user.avatar, data.user.role);
      router.push(redirectTo);
    } catch (err) {
      console.error("Google sign in error:", err);
      setError("Failed to connect with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initialize Real Google Button when GSI + ClientId are ready
  useEffect(() => {
    if (!gsiLoaded || !clientId || !window.google?.accounts?.id || !googleBtnContainerRef.current) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      googleBtnContainerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: 380,
        logo_alignment: "center",
      });
    } catch (err) {
      console.error("Failed to initialize Google GSI:", err);
    }
  }, [gsiLoaded, clientId]);

  const handleGoogleBtnClick = () => {
    if (!clientId) {
      setShowSetupModal(true);
      return;
    }
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputClientId.trim()) return;
    const cleanId = inputClientId.trim();
    setClientId(cleanId);
    localStorage.setItem("hm_google_client_id", cleanId);
    setShowSetupModal(false);
  };

  // ─── AUTH FORM SUBMIT (REAL VERIFICATION) ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      return setError("Please provide email and password.");
    }

    if (mode === "signup" && !name.trim()) {
      return setError("Please provide your full name.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        return;
      }

      if (mode === "signup") {
        // Step 1: User creates account -> Show success & switch to Login
        setSuccessMsg("✓ Account created successfully! Please sign in with your password to continue.");
        setMode("login");
        setPassword("");
      } else {
        // Step 2: User signs in with verified credentials
        login(data.user.name, data.user.email, data.user.avatar, data.user.role);
        router.push(redirectTo);
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError("An unexpected error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card space-y-6 bg-white dark:bg-[#141E18] border border-stone-200 dark:border-stone-800 shadow-xl rounded-3xl p-6 sm:p-8">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="font-serif text-2xl font-extrabold uppercase tracking-wider text-[#1E3926] dark:text-[#E2EFE7]">
              🌿 HADI MART
            </Link>
            <h1 className="mt-4 font-serif text-2xl font-extrabold text-stone-900 dark:text-stone-100">
              {mode === "login" ? "Sign In to Your Account" : "Create New Account"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500">
              {redirectTo === "/checkout"
                ? "Sign in or create an account to complete your order securely."
                : mode === "login"
                ? "Enter your email and password to access your profile & orders."
                : "Create an account first to enjoy verified shopping & tracking."}
            </p>
          </div>

          {/* Google OAuth Quick Sign In */}
          <div className="space-y-2">
            {clientId ? (
              <div className="flex flex-col items-center justify-center">
                <div ref={googleBtnContainerRef} className="w-full flex justify-center min-h-[44px]" />
                <button
                  type="button"
                  onClick={() => setShowSetupModal(true)}
                  className="mt-1 text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 underline"
                >
                  Change Google Client ID
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleBtnClick}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#18241D] py-3 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-200 shadow-xs transition hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-98 cursor-pointer"
              >
                <GoogleIcon size={18} />
                <span>Continue with Google</span>
              </button>
            )}
          </div>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800" />
            </div>
            <span className="relative bg-white dark:bg-[#141E18] px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Or with email &amp; password
            </span>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-2xl border border-stone-200 dark:border-stone-700 p-1">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
              className={`flex-1 rounded-xl py-2 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5
                ${mode === "login" ? "bg-[#2A4434] text-white shadow-xs dark:bg-[#A4B896] dark:text-[#0f1a17]" : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"}`}
            >
              <LogIn size={14} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); setSuccessMsg(""); }}
              className={`flex-1 rounded-xl py-2 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5
                ${mode === "signup" ? "bg-[#2A4434] text-white shadow-xs dark:bg-[#A4B896] dark:text-[#0f1a17]" : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"}`}
            >
              <UserPlus size={14} /> Create Account
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
              <Check size={16} className="shrink-0 text-emerald-600 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Error Banner with helpful action */}
          {error && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
                {error.includes("sign up first") && mode === "login" && (
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setError(""); }}
                    className="mt-1.5 inline-flex items-center gap-1 font-bold text-emerald-700 underline dark:text-emerald-300"
                  >
                    Click here to Create an Account →
                  </button>
                )}
                {error.includes("already exists") && mode === "signup" && (
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(""); }}
                    className="mt-1.5 inline-flex items-center gap-1 font-bold text-emerald-700 underline dark:text-emerald-300"
                  >
                    Click here to Sign In instead →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up only) */}
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-500">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Muhammad Basit"
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-500">Email Address *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-stone-500">
                  Password * {mode === "signup" && <span className="font-normal text-stone-400">(min 6 chars)</span>}
                </label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  required
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 py-2.5 pl-10 pr-11 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#2A4434] py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#1C2F24] transition disabled:opacity-60 dark:bg-[#A4B896] dark:text-[#0f1a17] cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {mode === "login" ? "Verifying Credentials…" : "Creating Account…"}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {mode === "login" ? "Sign In" : "Register Account"} <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          {/* ─── TWO-WAY TOGGLE BUTTONS AS REQUESTED ─── */}
          <div className="border-t border-stone-100 dark:border-stone-800/80 pt-4 text-center">
            {mode === "signup" ? (
              <p className="text-xs text-stone-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="font-bold text-[#2A4434] dark:text-[#A4B896] hover:underline cursor-pointer ml-1"
                >
                  Log in here →
                </button>
              </p>
            ) : (
              <p className="text-xs text-stone-500">
                Don&apos;t have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="font-bold text-[#2A4434] dark:text-[#A4B896] hover:underline cursor-pointer ml-1"
                >
                  Create an account →
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Admin Link */}
        <p className="mt-6 text-center text-xs text-stone-400">
          Store Manager?{" "}
          <Link href="/admin/login" className="text-[#2A4434] hover:underline dark:text-[#A4B896] font-semibold">
            Admin Sign In
          </Link>
        </p>
      </div>

      {/* ─── GOOGLE CLIENT ID SETUP MODAL ─── */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-[#141E18] border border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setShowSetupModal(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-xs border border-stone-100 dark:bg-stone-900 dark:border-stone-800 shrink-0">
                <GoogleIcon size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Connect Real Google OAuth
                </h3>
                <p className="text-xs text-stone-500">
                  Google requires an OAuth Client ID to show your real browser Gmail accounts.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-stone-50 dark:bg-stone-900/60 p-4 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-2">
                <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Key size={14} className="text-[#2A4434] dark:text-[#A4B896]" /> Free 1-Minute Setup Guide:
                </p>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                  <li>
                    Go to{" "}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2A4434] dark:text-[#A4B896] font-bold underline inline-flex items-center gap-0.5"
                    >
                      Google Cloud Console Credentials <ExternalLink size={10} />
                    </a>
                  </li>
                  <li>Click <strong>&quot;Create Credentials&quot; → &quot;OAuth client ID&quot;</strong>.</li>
                  <li>Application type: <strong>Web application</strong>.</li>
                  <li>
                    In <strong>Authorized JavaScript origins</strong>, add:
                    <div className="mt-1 flex flex-wrap gap-1 font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
                      <span className="bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                        http://localhost:3000
                      </span>
                      <span className="bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                        http://localhost:3001
                      </span>
                    </div>
                  </li>
                  <li>Copy your <strong>Client ID</strong> and paste it below!</li>
                </ol>
              </div>

              <form onSubmit={handleSaveClientId} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Your Google Client ID:
                  </label>
                  <input
                    required
                    value={inputClientId}
                    onChange={(e) => setInputClientId(e.target.value)}
                    placeholder="e.g. 123456789-abcdefghijk.apps.googleusercontent.com"
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-2.5 text-xs outline-none focus:border-[#2A4434] dark:text-white font-mono"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSetupModal(false)}
                    className="flex-1 rounded-xl border border-stone-300 py-2.5 text-xs font-semibold hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#2A4434] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1C2F24] transition dark:bg-[#A4B896] dark:text-[#0f1a17]"
                  >
                    Save &amp; Activate Real Google
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2A4434] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
