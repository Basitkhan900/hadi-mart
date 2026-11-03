import { NextResponse } from "next/server";
import { getProducts, addProduct, updateProduct, deleteProduct, clearAllProducts } from "@/lib/server-db";
import type { Product } from "@/lib/types";
import { sendNewProductNotification } from "@/lib/mailer";

// ─── Fallback images per category (used when a product has a broken/blob URL) ─
const CATEGORY_FALLBACKS: Record<string, string> = {
  c1: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80", // Fashion
  c2: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80", // Tech
  c3: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80", // Home & Decor
  c4: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80", // Skincare
  c5: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80", // Grocery
  c6: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80", // Sports
};
const GENERIC_FALLBACK =
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80";

function isBrokenUrl(url: string): boolean {
  if (!url) return true;
  if (url.startsWith("blob:")) return true;
  if (url.startsWith("data:")) return true;
  return false;
}

function sanitizeProduct(p: Product): Product {
  const fallback = CATEGORY_FALLBACKS[p.categoryId] ?? GENERIC_FALLBACK;
  const images = (p.images ?? []).map((img) =>
    isBrokenUrl(img) ? fallback : img
  );
  // Ensure at least 2 images
  while (images.length < 2) images.push(fallback);
  return { ...p, images };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";
  const cat = searchParams.get("cat") ?? "";

  let list = await getProducts();
  if (q) {
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  }
  if (cat) {
    list = list.filter((p) => p.categoryId === cat);
  }

  // Sanitize any blob: or broken image URLs before sending to the client
  return NextResponse.json(list.map(sanitizeProduct));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ error: "Name and price are required." }, { status: 400 });
    }

    const slug = (body.slug || body.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newProd: Product = {
      id: `p-${Date.now()}`,
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      name: body.name,
      brand: body.brand || "Hadi Mart",
      categoryId: body.categoryId || "c1",
      price: Number(body.price),
      salePrice: body.salePrice ? Number(body.salePrice) : undefined,
      stock: body.stock !== undefined ? Number(body.stock) : 10,
      images: [
        body.images?.[0] || body.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
        body.images?.[1] || body.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      ],
      rating: body.rating ? Number(body.rating) : 5.0,
      reviewCount: 0,
      sold: 0,
      description: body.description || "Premium quality product curated by Hadi Mart.",
      createdAt: new Date().toISOString(),
    };

    const saved = await addProduct(newProd);

    // Send Gmail alert to Admin in the background
    sendNewProductNotification({
      id: saved.id,
      name: saved.name,
      brand: saved.brand,
      price: saved.price,
      salePrice: saved.salePrice,
      stock: saved.stock,
      image: saved.images[0],
      description: saved.description,
    }).catch((e) => console.error("Product email notification error:", e));

    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...patch } = body;
    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const updated = await updateProduct(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("all") === "true") {
      await clearAllProducts();
      return NextResponse.json({ success: true, cleared: true });
    }

    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const success = await deleteProduct(id);
    if (!success) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete" }, { status: 500 });
  }
}
