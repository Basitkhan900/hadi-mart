import { NextResponse } from "next/server";
import { getOrders, addOrder, updateOrderStatus } from "@/lib/server-db";
import type { Order } from "@/lib/types";
import { sendNewOrderNotification } from "@/lib/mailer";

export async function GET() {
  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newOrder: Order = {
      id: `ord-${Date.now().toString(36).toUpperCase()}`,
      userId: body.userId || "guest",
      items: body.items || [],
      total: Number(body.total) || 0,
      status: "pending",
      payment: body.payment || "COD",
      address: body.address || { name: "Customer", phone: "", street: "", city: "" },
      createdAt: new Date().toISOString(),
    };

    const saved = await addOrder(newOrder);

    // Send Gmail alert to Admin in the background
    sendNewOrderNotification(saved).catch((e) =>
      console.error("Order email notification error:", e)
    );

    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to place order" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "Order ID and status required" }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update order" }, { status: 500 });
  }
}
