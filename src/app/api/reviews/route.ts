import { NextResponse } from "next/server";
import { getReviews, addReview, updateReviewStatus } from "@/lib/server-db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const status = searchParams.get("status");

    let reviews = await getReviews();

    if (productId) {
      reviews = reviews.filter((r) => r.productId === productId);
    }

    if (status) {
      reviews = reviews.filter((r) => r.status === status);
    }

    return NextResponse.json(reviews);
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productName, author, rating, body: reviewBody } = body;

    if (!productId || !author || !rating || !reviewBody) {
      return NextResponse.json(
        { error: "Product ID, author, rating and review text are required" },
        { status: 400 }
      );
    }

    const newReview = await addReview({
      productId,
      productName: productName || "Product",
      author,
      rating: Number(rating),
      body: reviewBody,
      status: "pending",
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Valid ID and status (pending | approved | rejected) required" },
        { status: 400 }
      );
    }

    const updated = await updateReviewStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/reviews error:", err);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
