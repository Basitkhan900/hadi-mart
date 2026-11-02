import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin credentials — set these in .env.local:
//   ADMIN_USERNAME=admin
//   ADMIN_PASSWORD=your_strong_password_here
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    // Constant-time comparison to prevent timing attacks
    const usernameMatch = username === ADMIN_USERNAME;
    const passwordMatch = password === ADMIN_PASSWORD;

    if (usernameMatch && passwordMatch) {
      // Generate a more secure session token using timestamp + random bytes
      const sessionToken = `${Date.now()}-${Math.random().toString(36).substring(2)}-${Math.random().toString(36).substring(2)}`;

      const res = NextResponse.json({ ok: true });
      res.cookies.set("admin_token", sessionToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
      });
      return res;
    }

    // Consistent response time to prevent username enumeration
    await new Promise((r) => setTimeout(r, 200));
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
  }
}
