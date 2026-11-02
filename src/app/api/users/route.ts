import { NextResponse } from "next/server";
import { getUsers, saveUser, deleteUser } from "@/lib/server-db";
import type { User } from "@/lib/types";

export async function GET() {
  const users = await getUsers();
  // Strip sensitive hashed/plaintext passwords from user list
  const sanitizedUsers = users.map((u) => {
    const { password, ...safeUser } = u as any;
    return safeUser;
  });
  return NextResponse.json(sanitizedUsers);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const newUser: User = {
      id: body.id || `u-${Date.now()}`,
      name: body.name || body.email.split("@")[0],
      email: body.email,
      role: body.role || "customer",
      avatar: body.avatar,
      phone: body.phone,
      address: body.address,
      city: body.city,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const saved = await saveUser(newUser);
    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const success = await deleteUser(id);
    if (!success) {
      return NextResponse.json(
        { error: "User not found or admin user cannot be deleted." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete user." }, { status: 500 });
  }
}
