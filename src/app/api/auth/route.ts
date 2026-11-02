import { NextResponse } from "next/server";
import { registerCustomer, authenticateCustomer, saveUser, findUserByEmail } from "@/lib/server-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, name, email, password, avatar } = body;

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    // ─── 1. SIGN UP FLOW ───
    if (action === "signup") {
      if (!name || !password) {
        return NextResponse.json(
          { error: "Full name and password are required for sign up." },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters." },
          { status: 400 }
        );
      }

      const res = await registerCustomer({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=2A4434&color=fff&size=128`,
      });

      if (res.error) {
        return NextResponse.json({ error: res.error }, { status: 409 });
      }

      const { password: _, ...safeUser } = res.user as any;
      return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
    }

    // ─── 2. SIGN IN / LOGIN FLOW ───
    if (action === "login") {
      if (!password) {
        return NextResponse.json({ error: "Password is required to sign in." }, { status: 400 });
      }

      const res = await authenticateCustomer(email.trim().toLowerCase(), password);
      if (res.error) {
        return NextResponse.json({ error: res.error }, { status: 401 });
      }

      const { password: _, ...safeUser } = res.user as any;
      return NextResponse.json({ success: true, user: safeUser });
    }

    // ─── 3. GOOGLE OAUTH FLOW ───
    if (action === "google") {
      let existing = await findUserByEmail(email.trim().toLowerCase());
      if (existing) {
        // Update avatar if provided
        if (avatar && avatar !== existing.avatar) {
          existing = await saveUser({ ...existing, avatar });
        }
        const { password: _, ...safeUser } = existing as any;
        return NextResponse.json({ success: true, user: safeUser });
      }

      // New Google User Registration
      const newUser = await saveUser({
        id: `u-${Date.now()}`,
        name: name?.trim() || email.split("@")[0],
        email: email.trim().toLowerCase(),
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=0D8ABC&color=fff`,
        role: "customer",
        createdAt: new Date().toISOString(),
      });

      const { password: _, ...safeUser } = newUser as any;
      return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    console.error("Auth API error:", err);
    return NextResponse.json({ error: err.message || "Authentication failed." }, { status: 500 });
  }
}
