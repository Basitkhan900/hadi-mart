export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  price: number;
  salePrice?: number;
  stock: number;
  images: [string, string];
  rating: number;
  reviewCount: number;
  sold: number;
  description: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  password?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  createdAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

export interface OrderItem {
  productId: string;
  qty: number;
  price: number;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Address {
  name: string;
  phone: string;
  street: string;
  city: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment: "COD" | "JazzCash" | "Easypaisa" | "Card";
  address: Address;
  createdAt: string;
}

export interface Coupon {
  code: string;
  percent: number;
  active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  href: string;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

// Formatter
export const pkr = (n: number) =>
  `Rs. ${n.toLocaleString("en-PK")}`;

// Order status helpers
export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped:    "bg-purple-100 text-purple-800",
  delivered:  "bg-emerald-100 text-emerald-800",
  cancelled:  "bg-red-100 text-red-800",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    "Pending",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};
