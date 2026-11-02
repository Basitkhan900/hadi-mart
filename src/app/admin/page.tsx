"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, Cell, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp, Plus,
  Moon, Sun, ExternalLink, Trash2, AlertTriangle, Search,
  MessageSquare, Users, CheckCircle, Mail, Phone, Calendar,
  X, Image as ImageIcon, RefreshCw, UploadCloud, Star, Check, XCircle, Pencil,
  UserPlus, Shield, MapPin, Menu, LogOut, Printer
} from "lucide-react";
import { categories } from "@/lib/db";
import { useCatalog } from "@/lib/store";
import type { Product, Order, User, ContactMessage, Review } from "@/lib/types";
import { pkr, STATUS_COLORS, STATUS_LABELS } from "@/lib/types";

const PIE_COLORS = ["#0F766E", "#14B8A6", "#5EEAD4", "#111827", "#9CA3AF"];

type AdminSection = "dashboard" | "products" | "orders" | "messages" | "users" | "reviews";

export default function AdminPage() {
  const router = useRouter();
  const { products: storeProducts, setProducts: setStoreProducts, add: addStoreProduct, update: updateStoreProduct, remove: removeStoreProduct, clear: clearCatalog } = useCatalog();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real API State
  const [loading, setLoading] = useState(true);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [reviewFilter, setReviewFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newProd, setNewProd] = useState({
    name: "",
    brand: "Hadi Mart",
    categoryId: "c1",
    price: "",
    salePrice: "",
    stock: "20",
    image: "",
    description: "",
  });

  // Edit Product Modal State
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [updatingProduct, setUpdatingProduct] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Users Management State
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "customer" | "admin">("all");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer" as "customer" | "admin",
    phone: "",
    city: "",
  });

  const handleAdminSignOut = async () => {
    try {
      await fetch("/api/admin-logout", { method: "POST" });
    } catch (e) {
      console.error("Signout error:", e);
    }
    router.push("/admin/login");
    router.refresh();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediately show local preview
    const localUrl = URL.createObjectURL(file);
    setNewProd((prev) => ({ ...prev, image: localUrl }));
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setNewProd((prev) => ({ ...prev, image: data.url }));
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenEdit = (p: Product) => {
    setEditProd({ ...p });
  };

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editProd) return;

    const localUrl = URL.createObjectURL(file);
    setEditProd((prev) => (prev ? { ...prev, images: [localUrl, localUrl] } : null));
    setUploadingEditImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setEditProd((prev) => (prev ? { ...prev, images: [data.url, data.url] } : null));
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploadingEditImage(false);
    }
  };

  const handleSaveUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProd || !editProd.name || !editProd.price) {
      alert("Please provide product title and price.");
      return;
    }

    setUpdatingProduct(true);
    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editProd.id,
          name: editProd.name,
          brand: editProd.brand,
          categoryId: editProd.categoryId,
          price: Number(editProd.price),
          salePrice: editProd.salePrice ? Number(editProd.salePrice) : undefined,
          stock: Number(editProd.stock),
          images: editProd.images,
          description: editProd.description,
        }),
      });

      if (res.ok) {
        const updated: Product = await res.json();
        setProductsList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        updateStoreProduct(updated.id, updated);
        setEditProd(null);
        alert(`Success! "${updated.name}" has been updated.`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update product");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Error updating product. Please try again.");
    } finally {
      setUpdatingProduct(false);
    }
  };

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  };

  // Fetch real data from all APIs
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [prodsRes, ordsRes, msgsRes, usrsRes, revsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/contact"),
        fetch("/api/users"),
        fetch("/api/reviews"),
      ]);

      if (prodsRes.ok) {
        const prods = await prodsRes.json();
        setProductsList(prods);
        setStoreProducts(prods);
      } else {
        setProductsList([]);
      }

      if (ordsRes.ok) {
        const ords = await ordsRes.json();
        setOrdersList(ords);
      }

      if (msgsRes.ok) {
        const msgs = await msgsRes.json();
        setMessagesList(msgs);
      }

      if (usrsRes.ok) {
        const usrs = await usrsRes.json();
        setUsersList(usrs);
      }

      if (revsRes.ok) {
        const revs = await revsRes.json();
        setReviewsList(revs);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
      setProductsList(storeProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Always use the real API list
  const currentProducts = productsList;

  const handleClearAllProducts = async () => {
    if (!confirm("Are you sure you want to remove all products to keep it completely clean?")) return;
    try {
      await fetch("/api/products?all=true", { method: "DELETE" });
      setProductsList([]);
      clearCatalog();
    } catch (err) {
      console.error("Failed to clear products:", err);
    }
  };

  // Real Calculated Metrics
  const revenue = ordersList.reduce((a, o) => a + o.total, 0);
  const salesData = ordersList.length > 0
    ? ordersList.slice(0, 7).reverse().map((o, i) => ({ d: `Ord ${i + 1}`, v: o.total }))
    : [{ d: "Ready", v: 0 }];

  const statusMap = ordersList.reduce<Record<string, number>>(
    (a, o) => ({ ...a, [o.status]: (a[o.status] ?? 0) + 1 }),
    {}
  );
  const statusData = Object.keys(statusMap).length > 0
    ? Object.entries(statusMap).map(([name, value]) => ({ name, value }))
    : [{ name: "No Orders", value: 1 }];

  const lowStock = currentProducts.filter((p) => p.stock <= 10);
  const filteredProducts = currentProducts.filter(
    (p) => `${p.name} ${p.brand}`.toLowerCase().includes(search.toLowerCase())
  );

  const unreadMessagesCount = messagesList.filter((m) => !m.read).length;

  // ── Handlers ──
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      alert("Please provide product name and price.");
      return;
    }

    setSavingProduct(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProd.name,
          brand: newProd.brand,
          categoryId: newProd.categoryId,
          price: parseFloat(newProd.price),
          salePrice: newProd.salePrice ? parseFloat(newProd.salePrice) : undefined,
          stock: parseInt(newProd.stock) || 10,
          image: newProd.image,
          description: newProd.description,
        }),
      });

      if (res.ok) {
        const created: Product = await res.json();
        // Update both local list and client Zustand store so store reflects it immediately!
        setProductsList((prev) => [created, ...prev]);
        addStoreProduct(created);
        setShowAddModal(false);
        setNewProd({
          name: "",
          brand: "Hadi Mart",
          categoryId: "c1",
          price: "",
          salePrice: "",
          stock: "20",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
          description: "",
        });
        alert(`Success! "${created.name}" is now live on the website.`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add product");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding product. Please try again.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    // Optimistic update
    setProductsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );
    updateStoreProduct(id, { stock: newStock });

    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stock: newStock }),
      });
    } catch (err) {
      console.error("Failed to update stock:", err);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the store?`)) return;

    setProductsList((prev) => prev.filter((p) => p.id !== id));
    removeStoreProduct(id);

    try {
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    setOrdersList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handleMarkMessageRead = async (msgId: string) => {
    setMessagesList((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, read: true } : m))
    );

    try {
      await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msgId }),
      });
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    setMessagesList((prev) => prev.filter((m) => m.id !== msgId));

    try {
      await fetch(`/api/contact?id=${msgId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const getGmailReplyUrl = (msg: ContactMessage) => {
    const subject = `Re: ${msg.subject || "Your Inquiry at Hadi Mart"}`;
    const body = `Hello ${msg.name},\n\nThank you for reaching out to Hadi Mart.\n\nIn response to your message:\n"${msg.message}"\n\nKind regards,\nHadi Mart Support\nsupport@hadimart.pk`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(msg.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleUpdateReviewStatus = async (id: string, status: "approved" | "rejected") => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

    try {
      await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch (err) {
      console.error("Failed to update review status:", err);
    }
  };

  const pendingReviewsCount = reviewsList.filter((r) => r.status === "pending").length;

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove user "${userName}"? This will permanently delete their account.`)) return;

    setUsersList((prev) => prev.filter((u) => u.id !== userId));

    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete user.");
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      fetchAllData();
    }
  };

  const printInvoice = (order: Order) => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) {
      alert("Please allow pop-ups to print the invoice.");
      return;
    }

    const orderItemsHtml = order.items
      .map((item, idx) => {
        const prod = storeProducts.find((p) => p.id === item.productId);
        const name = prod?.name || `Product (${item.productId})`;
        const itemTotal = item.price * item.qty;
        return `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 8px; text-align: center; color: #6b7280; font-size: 13px;">${idx + 1}</td>
            <td style="padding: 12px 8px;">
              <div style="font-weight: 600; font-size: 13px; color: #111827;">${name}</div>
              <div style="font-size: 11px; color: #9ca3af; font-family: monospace;">SKU: ${item.productId}</div>
            </td>
            <td style="padding: 12px 8px; text-align: center; font-size: 13px; color: #374151;">${item.qty}</td>
            <td style="padding: 12px 8px; text-align: right; font-size: 13px; color: #374151;">Rs. ${item.price.toLocaleString()}</td>
            <td style="padding: 12px 8px; text-align: right; font-size: 13px; font-weight: 700; color: #166534;">Rs. ${itemTotal.toLocaleString()}</td>
          </tr>
        `;
      })
      .join("");

    const dateFormatted = new Date(order.createdAt).toLocaleDateString("en-PK", {
      dateStyle: "long",
    });

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${order.id} - Hadi Mart</title>
          <meta charset="utf-8" />
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
              @page { margin: 15mm; }
              .no-print { display: none !important; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1f2937;
              background-color: #ffffff;
              padding: 24px;
              max-width: 750px;
              margin: 0 auto;
            }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            .items-table th {
              background-color: #f8fafc;
              border-bottom: 2px solid #e2e8f0;
              padding: 10px 8px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px 18px; border-radius: 12px;">
            <div style="font-size: 13px; color: #166534; font-weight: 600;">Invoice generated for order #${order.id}</div>
            <button onclick="window.print()" style="background: #2A4434; color: white; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer;">Print / Save as PDF</button>
          </div>

          <table class="header-table">
            <tr>
              <td style="vertical-align: top;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 26px;">🌿</span>
                  <span style="font-size: 24px; font-weight: 900; letter-spacing: 0.05em; color: #166534;">HADI MART</span>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 6px; line-height: 1.4;">
                  Pakistan's Premium Online Superstore<br />
                  support@hadimart.pk · www.hadimart.pk
                </div>
              </td>
              <td style="vertical-align: top; text-align: right;">
                <div style="font-size: 24px; font-weight: 900; color: #0f172a; text-transform: uppercase;">INVOICE</div>
                <div style="font-size: 13px; font-family: monospace; font-weight: 700; color: #166534; margin-top: 4px;">#${order.id}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Date: ${dateFormatted}</div>
                <div style="display: inline-block; margin-top: 6px; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #f1f5f9; color: #334155;">Status: ${order.status}</div>
              </td>
            </tr>
          </table>

          <table class="info-table" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
            <tr>
              <td style="padding: 16px; width: 50%; vertical-align: top; border-right: 1px solid #e2e8f0;">
                <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">BILL TO / DELIVER TO</div>
                <div style="font-weight: 700; font-size: 14px; color: #0f172a;">${order.address?.name || "Customer"}</div>
                <div style="font-size: 12px; color: #475569; margin-top: 4px;">Phone: ${order.address?.phone || "N/A"}</div>
                <div style="font-size: 12px; color: #475569; margin-top: 2px;">${order.address?.street || ""}, ${order.address?.city || ""}</div>
              </td>
              <td style="padding: 16px; width: 50%; vertical-align: top;">
                <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">PAYMENT DETAILS</div>
                <div style="font-weight: 700; font-size: 13px; color: #0f172a;">Method: ${order.payment || "COD"}</div>
                <div style="font-size: 12px; color: #475569; margin-top: 4px;">Currency: PKR (Rs.)</div>
                <div style="font-size: 12px; color: #166534; font-weight: 600; margin-top: 2px;">Delivery: Standard Courier Service</div>
              </td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: center; width: 40px;">#</th>
                <th style="text-align: left;">Item Description</th>
                <th style="text-align: center; width: 70px;">Qty</th>
                <th style="text-align: right; width: 110px;">Unit Price</th>
                <th style="text-align: right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
          </table>

          <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
            <table style="width: 280px; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 13px;">Rs. ${order.total.toLocaleString()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Shipping:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 13px; color: #166534;">FREE</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 16px; font-weight: 800; color: #0f172a;">Grand Total:</td>
                <td style="padding: 10px 0; text-align: right; font-size: 18px; font-weight: 900; color: #166534;">Rs. ${order.total.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="border-top: 1px dashed #cbd5e1; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            Thank you for shopping with Hadi Mart!<br />
            For inquiries, returns, or support, please contact us at support@hadimart.pk or call our helpline.<br />
            <em>This is a computer-generated invoice and requires no physical signature.</em>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 350);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim()) {
      alert("Please provide both name and email address.");
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserForm.name.trim(),
          email: newUserForm.email.trim().toLowerCase(),
          password: newUserForm.password,
          role: newUserForm.role,
          phone: newUserForm.phone.trim(),
          city: newUserForm.city.trim(),
          createdAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const created: User = await res.json();
        setUsersList((prev) => [created, ...prev]);
        setShowAddUserModal(false);
        setNewUserForm({ name: "", email: "", password: "", role: "customer", phone: "", city: "" });
        alert(`User "${created.name}" created successfully!`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create user.");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Network error while creating user.");
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      `${u.name || ""} ${u.email || ""} ${u.phone || ""} ${u.city || ""}`
        .toLowerCase()
        .includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const navItems: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard",  icon: <LayoutDashboard size={17} /> },
    { id: "products",  label: "Products",   icon: <Package size={17} /> },
    { id: "orders",    label: "Orders",     icon: <ShoppingCart size={17} />, badge: ordersList.length },
    { id: "reviews",   label: "Reviews",    icon: <Star size={17} />, badge: pendingReviewsCount },
    { id: "messages",  label: "Messages",   icon: <MessageSquare size={17} />, badge: unreadMessagesCount },
    { id: "users",     label: "Users",      icon: <Users size={17} />, badge: usersList.length },
  ];

  return (
    <div className="flex min-h-screen bg-[#f6f7f5] dark:bg-[#0a0f0d] font-sans">
      {/* ─── Sidebar ─── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-white dark:bg-[#0f1a17] md:flex">
        <div className="flex h-16 items-center justify-between border-b px-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-display text-lg font-extrabold tracking-wide">
              <span className="text-[#2A4434] dark:text-[#A4B896]">HADI</span> MART
            </span>
          </div>
          <span className="rounded-full bg-[#2A4434]/10 dark:bg-[#A4B896]/20 px-2 py-0.5 text-[10px] font-bold text-[#2A4434] dark:text-[#A4B896]">
            ADMIN
          </span>
        </div>

        <nav className="flex-1 space-y-1.5 p-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition
                ${section === item.id
                  ? "bg-[#2A4434] text-white shadow-xs dark:bg-[#A4B896] dark:text-[#0f1a17]"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"}`}
            >
              <div className="flex items-center gap-3">
                {item.icon} {item.label}
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[10px] font-bold
                  ${section === item.id ? "bg-white text-[#2A4434] dark:bg-[#0f1a17] dark:text-white" : "bg-[#2A4434] text-white dark:bg-[#A4B896] dark:text-[#0f1a17]"}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t p-3 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition"
          >
            <ExternalLink size={15} /> Open Storefront ↗
          </Link>
          <button
            onClick={toggleDark}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />} {dark ? "Light Theme" : "Dark Theme"}
          </button>
          <button
            onClick={handleAdminSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition cursor-pointer"
          >
            <LogOut size={15} /> Sign Out Admin
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/90 px-4 sm:px-6 backdrop-blur dark:bg-[#0f1a17]/90">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <h1 className="font-display text-lg sm:text-xl font-bold capitalize text-stone-900 dark:text-stone-100 truncate max-w-[180px] sm:max-w-none">
              {section === "users" ? "Registered Customers" : section === "messages" ? "Contact Inquiries" : section === "reviews" ? "Customer Reviews" : section}
            </h1>
            <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500">
              Real API Connected
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchAllData}
              title="Refresh Real API Data"
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#141E18] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-50 transition"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {section === "products" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#2A4434] px-3 sm:px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1C2F24] transition dark:bg-[#A4B896] dark:text-[#0f1a17]"
              >
                <Plus size={15} /> <span className="hidden sm:inline">Add New </span>Product
              </button>
            )}

            {/* Quick Header Sign Out */}
            <button
              onClick={handleAdminSignOut}
              title="Sign Out of Admin"
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 transition cursor-pointer"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex w-72 max-w-[80vw] flex-1 flex-col bg-white dark:bg-[#0f1a17] p-4 shadow-2xl">
              <div className="flex h-12 items-center justify-between border-b pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌿</span>
                  <span className="font-display text-base font-extrabold tracking-wide">
                    <span className="text-[#2A4434] dark:text-[#A4B896]">HADI</span> MART
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition
                      ${section === item.id
                        ? "bg-[#2A4434] text-white shadow-xs dark:bg-[#A4B896] dark:text-[#0f1a17]"
                        : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"}`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon} {item.label}
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[10px] font-bold
                        ${section === item.id ? "bg-white text-[#2A4434] dark:bg-[#0f1a17] dark:text-white" : "bg-[#2A4434] text-white dark:bg-[#A4B896] dark:text-[#0f1a17]"}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="border-t pt-3 space-y-1 mt-auto">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition"
                >
                  <ExternalLink size={15} /> Open Storefront ↗
                </Link>
                <button
                  onClick={toggleDark}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition"
                >
                  {dark ? <Sun size={15} /> : <Moon size={15} />} {dark ? "Light Theme" : "Dark Theme"}
                </button>
                <button
                  onClick={handleAdminSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition cursor-pointer"
                >
                  <LogOut size={15} /> Sign Out Admin
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-6">
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* 1. DASHBOARD OVERVIEW */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {section === "dashboard" && (
            <>
              {/* Real Metrics Cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Total Revenue (Real)", value: pkr(revenue), icon: <TrendingUp size={20} />, color: "text-[#2A4434] dark:text-[#A4B896]" },
                  { label: "Active Orders", value: ordersList.length, icon: <ShoppingCart size={20} />, color: "text-blue-600" },
                  { label: "Total Products Live", value: currentProducts.length, icon: <Package size={20} />, color: "text-purple-600" },
                  { label: "Customer Inquiries", value: messagesList.length, icon: <MessageSquare size={20} />, color: "text-amber-600" },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-[#141E18]">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{label}</p>
                      <span className={color}>{icon}</span>
                    </div>
                    <p className="mt-3 font-display text-2xl font-extrabold text-stone-900 dark:text-stone-100">{value}</p>
                  </div>
                ))}
              </div>

              {/* Charts & Analytics */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="col-span-2 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-[#141E18]">
                  <p className="mb-4 font-bold text-sm text-stone-800 dark:text-stone-200">Revenue Distribution (Real Orders)</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#8882" />
                      <XAxis dataKey="d" tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [pkr(v as number), "Revenue"]} />
                      <Bar dataKey="v" fill="#2A4434" radius={6} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-[#141E18]">
                  <p className="mb-4 font-bold text-sm text-stone-800 dark:text-stone-200">Order Status Breakdown</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                        {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex flex-wrap gap-2 justify-center">
                    {statusData.map((s, i) => (
                      <span key={s.name} className="flex items-center gap-1 text-[11px] font-medium capitalize text-stone-600 dark:text-stone-300">
                        <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {s.name} ({s.value})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Real Inquiries Box */}
              {messagesList.length > 0 && (
                <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-[#141E18]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">Latest Contact Messages from Site</h3>
                    <button onClick={() => setSection("messages")} className="text-xs font-semibold text-[#2A4434] hover:underline dark:text-[#A4B896]">
                      View All Messages →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {messagesList.slice(0, 3).map((m) => (
                      <div key={m.id} className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{m.name} ({m.email})</p>
                          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 line-clamp-1">{m.message}</p>
                        </div>
                        <span className="text-[10px] text-stone-400 whitespace-nowrap">{new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Reviews Notification in Dashboard */}
              {pendingReviewsCount > 0 && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500 text-white font-bold shrink-0">
                      <Star size={20} className="fill-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        {pendingReviewsCount} Customer Review{pendingReviewsCount > 1 ? "s" : ""} Waiting for Approval
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                        Approve them to make them live on the Product page and Home page testimonials.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSection("reviews"); setReviewFilter("pending"); }}
                    className="rounded-xl bg-[#2A4434] hover:bg-[#1f3327] dark:bg-[#A4B896] dark:text-[#0f1a17] text-white px-4 py-2 text-xs font-bold transition whitespace-nowrap"
                  >
                    Moderate Reviews →
                  </button>
                </div>
              )}

              {/* Low Stock Notification */}
              {lowStock.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={18} className="text-amber-600" />
                    <p className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400">Low Stock Alert ({lowStock.length} items)</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lowStock.map((p) => (
                      <span key={p.id} className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-stone-700 shadow-xs border border-amber-200 dark:bg-stone-800 dark:text-stone-200 dark:border-amber-900">
                        {p.name} — <span className="text-amber-600 font-bold">{p.stock} remaining</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* 2. REAL PRODUCTS MANAGEMENT */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {section === "products" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search live products by title or brand…"
                    className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:border-stone-700 dark:bg-[#141E18] dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-semibold text-stone-500">
                    Showing {filteredProducts.length} of {currentProducts.length} live products
                  </div>
                  {currentProducts.length > 0 && (
                    <button
                      onClick={handleClearAllProducts}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 dark:border-rose-900/60 transition"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-[#141E18]">
                {filteredProducts.length === 0 ? (
                  <div className="p-12 text-center text-stone-500">
                    <Package size={40} className="mx-auto mb-3 opacity-30 text-[#2A4434] dark:text-[#A4B896]" />
                    <p className="font-semibold text-sm text-stone-800 dark:text-stone-200">Catalog is Clean &amp; Empty</p>
                    <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                      All dummy products have been removed. Click <strong>&quot;+ Add New Product&quot;</strong> above to upload your own real products with device photos.
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#2A4434] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1C2F24] transition dark:bg-[#A4B896] dark:text-[#0f1a17]"
                    >
                      <Plus size={15} /> Add First Product
                    </button>
                  </div>
                ) : (
                <table className="w-full text-sm text-left">
                  <thead className="border-b border-stone-200 bg-stone-50/80 dark:border-stone-800 dark:bg-stone-800/40 text-xs font-bold uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="px-4 py-3.5">Product</th>
                      <th className="px-4 py-3.5 hidden md:table-cell">Brand</th>
                      <th className="px-4 py-3.5">Price</th>
                      <th className="px-4 py-3.5">Live Stock</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 text-xs sm:text-sm">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <img src={p.images[0]} alt="" className="h-11 w-10 rounded-xl object-cover shrink-0 border border-stone-200 dark:border-stone-700" />
                            <div className="min-w-0">
                              <p className="font-semibold text-stone-900 dark:text-stone-100 truncate max-w-xs">{p.name}</p>
                              <span className="text-[10px] text-stone-400 uppercase font-mono">{p.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-stone-600 dark:text-stone-400 hidden md:table-cell font-medium">{p.brand}</td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-[#2A4434] dark:text-[#A4B896]">{pkr(p.salePrice ?? p.price)}</span>
                          {p.salePrice && <span className="block text-[11px] text-stone-400 line-through">{pkr(p.price)}</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              value={p.stock}
                              onChange={(e) => handleUpdateStock(p.id, parseInt(e.target.value) || 0)}
                              className={`w-20 rounded-lg border px-2 py-1 text-xs font-semibold outline-none transition focus:border-[#2A4434] dark:bg-transparent
                                ${p.stock <= 10 ? "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-300" : "border-stone-300 dark:border-stone-700"}`}
                            />
                            <span className="text-[11px] text-stone-400">units</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              title="Edit & Update Product"
                              className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-[#2A4434] dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-[#A4B896]"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              title="Delete product"
                              className="rounded-lg p-2 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* 3. REAL CUSTOMER ORDERS */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {section === "orders" && (
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-[#141E18]">
              {ordersList.length === 0 ? (
                <div className="p-12 text-center text-stone-500">
                  <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-sm">No customer orders placed yet.</p>
                  <p className="text-xs text-stone-400 mt-1">Real orders will automatically appear here once customers checkout on the store.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="border-b border-stone-200 bg-stone-50/80 dark:border-stone-800 dark:bg-stone-800/40 text-xs font-bold uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="px-4 py-3.5">Order ID</th>
                      <th className="px-4 py-3.5">Customer & City</th>
                      <th className="px-4 py-3.5">Items</th>
                      <th className="px-4 py-3.5">Total Amount</th>
                      <th className="px-4 py-3.5">Payment</th>
                      <th className="px-4 py-3.5">Status & Action</th>
                      <th className="px-4 py-3.5 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 text-xs sm:text-sm">
                    {ordersList.map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition">
                        <td className="px-4 py-3.5 font-mono font-bold text-[#2A4434] dark:text-[#A4B896]">{o.id}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-stone-900 dark:text-stone-100">{o.address?.name || "Guest User"}</p>
                          <p className="text-xs text-stone-400">{o.address?.city || "Pakistan"} · {o.address?.phone}</p>
                        </td>
                        <td className="px-4 py-3.5 font-medium">{o.items.reduce((a, i) => a + i.qty, 0)} items</td>
                        <td className="px-4 py-3.5 font-bold">{pkr(o.total)}</td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                            {o.payment}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as Order["status"])}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold outline-none cursor-pointer border ${STATUS_COLORS[o.status]}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => printInvoice(o)}
                            title="Print Customer Invoice / Packaging Slip"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/60 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-200 shadow-xs hover:border-[#2A4434] hover:bg-stone-50 dark:hover:border-[#A4B896] transition cursor-pointer"
                          >
                            <Printer size={13} className="text-[#2A4434] dark:text-[#A4B896]" />
                            <span>Print Invoice</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* 4. REAL CONTACT INQUIRIES FROM WEBSITE */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {section === "messages" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
                  Customer Contact Form Submissions ({messagesList.length})
                </p>
              </div>

              {messagesList.length === 0 ? (
                <div className="rounded-2xl border border-stone-200/80 bg-white p-12 text-center text-stone-500 dark:border-stone-800 dark:bg-[#141E18]">
                  <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-sm">No inquiries received yet.</p>
                  <p className="text-xs text-stone-400 mt-1">When users submit the Contact form on your website, their messages will appear here in real-time.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {messagesList.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-2xl border p-5 shadow-xs transition bg-white dark:bg-[#141E18]
                        ${m.read ? "border-stone-200 dark:border-stone-800 opacity-80" : "border-[#2A4434]/40 dark:border-[#A4B896]/40 shadow-sm"}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{m.name}</span>
                          {!m.read ? (
                            <span className="rounded-full bg-[#2A4434] px-2 py-0.5 text-[9px] font-bold text-white uppercase">New</span>
                          ) : (
                            <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[9px] font-bold text-stone-500 uppercase">Read</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-stone-400">
                          <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(m.createdAt).toLocaleString()}</span>
                          {!m.read && (
                            <button
                              onClick={() => handleMarkMessageRead(m.id)}
                              className="text-xs font-semibold text-[#2A4434] hover:underline dark:text-[#A4B896]"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(m.id)}
                            title="Delete this message"
                            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                        <p><strong className="text-stone-700 dark:text-stone-300">Email:</strong> {m.email}</p>
                        {m.phone && <p><strong className="text-stone-700 dark:text-stone-300">Phone:</strong> {m.phone}</p>}
                        {m.subject && <p><strong className="text-stone-700 dark:text-stone-300">Subject:</strong> {m.subject}</p>}
                      </div>

                      <div className="mt-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 p-3.5 text-xs text-stone-800 dark:text-stone-200 leading-relaxed">
                        {m.message}
                      </div>

                      {/* Reply & Action Bar */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 dark:border-stone-800/80 pt-3">
                        <div className="flex items-center gap-2">
                          {/* Gmail Web Compose */}
                          <a
                            href={getGmailReplyUrl(m)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              if (!m.read) handleMarkMessageRead(m.id);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition"
                          >
                            <Mail size={13} /> Reply on Gmail ↗
                          </a>

                          {/* Default Mail Client Fallback */}
                          <a
                            href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "Your Inquiry at Hadi Mart"))}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#141E18] px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                          >
                            Open Email App
                          </a>
                        </div>

                        <button
                          onClick={() => handleDeleteMessage(m.id)}
                          className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-rose-600 transition font-medium"
                        >
                          <Trash2 size={13} /> Delete Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* 5. REAL REGISTERED / LOGGED-IN CUSTOMERS */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {section === "users" && (
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-[#141E18]">
              <table className="w-full text-sm text-left">
                <thead className="border-b border-stone-200 bg-stone-50/80 dark:border-stone-800 dark:bg-stone-800/40 text-xs font-bold uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="px-4 py-3.5">Customer Name</th>
                    <th className="px-4 py-3.5">Email Address</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 text-xs sm:text-sm">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#2A4434]/10 dark:bg-[#A4B896]/20 font-bold text-[#2A4434] dark:text-[#A4B896] text-xs uppercase">
                            {u.name?.charAt(0) || "U"}
                          </div>
                          <span className="font-semibold text-stone-900 dark:text-stone-100">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-stone-600 dark:text-stone-300 font-medium">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase
                          ${u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-emerald-100 text-emerald-800"}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-stone-400 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* 6. REAL CUSTOMER REVIEWS (APPROVAL & MODERATION) */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {section === "reviews" && (
            <div className="space-y-4">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 rounded-xl bg-stone-200/70 dark:bg-stone-800 p-1 text-xs font-semibold">
                  {(["all", "pending", "approved", "rejected"] as const).map((st) => {
                    const count =
                      st === "all"
                        ? reviewsList.length
                        : reviewsList.filter((r) => r.status === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setReviewFilter(st)}
                        className={`capitalize px-3.5 py-1.5 rounded-lg transition ${
                          reviewFilter === st
                            ? "bg-white text-stone-900 dark:bg-[#141E18] dark:text-white shadow-xs font-bold"
                            : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
                        }`}
                      >
                        {st} ({count})
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-stone-500">
                  Reviews marked as <strong className="text-emerald-600">Approved</strong> will appear publicly on the Product page and Home page.
                </p>
              </div>

              {/* Table of Reviews */}
              <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-[#141E18]">
                {reviewsList.filter((r) => reviewFilter === "all" || r.status === reviewFilter).length === 0 ? (
                  <div className="p-12 text-center text-stone-500">
                    <Star size={40} className="mx-auto mb-3 opacity-30 text-amber-500" />
                    <p className="font-semibold text-sm">No reviews in this view.</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Customer reviews submitted on product detail pages will appear here.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="border-b border-stone-200 bg-stone-50/80 dark:border-stone-800 dark:bg-stone-800/40 text-xs font-bold uppercase tracking-wider text-stone-500">
                      <tr>
                        <th className="px-4 py-3.5">Reviewer &amp; Product</th>
                        <th className="px-4 py-3.5">Rating</th>
                        <th className="px-4 py-3.5">Review Feedback</th>
                        <th className="px-4 py-3.5">Date</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5 text-right">Moderation Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 text-xs sm:text-sm">
                      {reviewsList
                        .filter((r) => reviewFilter === "all" || r.status === reviewFilter)
                        .map((r) => (
                          <tr key={r.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition">
                            <td className="px-4 py-3.5">
                              <p className="font-semibold text-stone-900 dark:text-stone-100">{r.author}</p>
                              <p className="text-xs text-stone-400">{r.productName || r.productId}</p>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-1 text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={13}
                                    className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-700"}
                                  />
                                ))}
                                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 ml-1">({r.rating})</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 max-w-sm">
                              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                                {r.body}
                              </p>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-stone-400 whitespace-nowrap">
                              {new Date(r.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase
                                  ${
                                    r.status === "approved"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                      : r.status === "rejected"
                                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                  }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {r.status !== "approved" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateReviewStatus(r.id, "approved")}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-xs font-bold shadow-xs transition"
                                  >
                                    <Check size={13} /> Approve
                                  </button>
                                )}
                                {r.status !== "rejected" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateReviewStatus(r.id, "rejected")}
                                    className="inline-flex items-center gap-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 text-xs font-bold shadow-xs transition"
                                  >
                                    <XCircle size={13} /> Reject
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── ADD NEW PRODUCT MODAL ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-[#141E18] border border-stone-200 dark:border-stone-800 my-8">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Add New Product</h3>
                <p className="text-xs text-stone-400">Instantly publishes to Hadi Mart online shop.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Product Title *</label>
                <input
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Brand Name</label>
                  <input
                    value={newProd.brand}
                    onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                    placeholder="e.g. Hadi Mart, Sony"
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Category *</label>
                  <select
                    value={newProd.categoryId}
                    onChange={(e) => setNewProd({ ...newProd, categoryId: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Price (PKR) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    placeholder="4500"
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Sale Price</label>
                  <input
                    type="number"
                    min="0"
                    value={newProd.salePrice}
                    onChange={(e) => setNewProd({ ...newProd, salePrice: e.target.value })}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    placeholder="20"
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-1.5">
                  Product Image (Upload from Computer / Phone) *
                </label>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-900/60 p-5 text-center transition hover:border-[#2A4434] hover:bg-[#2A4434]/5 dark:hover:border-[#A4B896] cursor-pointer"
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2 py-3">
                      <RefreshCw size={24} className="animate-spin text-[#2A4434] dark:text-[#A4B896]" />
                      <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Uploading image from device...
                      </p>
                    </div>
                  ) : newProd.image ? (
                    <div className="flex items-center gap-4 w-full">
                      <img
                        src={newProd.image}
                        alt="Preview"
                        className="h-20 w-20 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shadow-xs shrink-0 bg-white"
                      />
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <CheckCircle size={14} className="text-emerald-600" /> Photo Selected from Device
                        </p>
                        <p className="text-[11px] text-stone-400 truncate mt-0.5">{newProd.image}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 shadow-xs transition"
                        >
                          <UploadCloud size={12} /> Choose another photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2A4434]/10 dark:bg-[#A4B896]/20 text-[#2A4434] dark:text-[#A4B896] transition group-hover:scale-110">
                        <UploadCloud size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                          Click to choose photo from your Device
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5">Supports JPG, PNG, WEBP, JFIF</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Web URL fallback */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">Or enter image URL:</span>
                  <input
                    value={newProd.image.startsWith("/uploads/") ? "" : newProd.image}
                    onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-2.5 py-1 text-xs outline-none focus:border-[#2A4434] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  placeholder="Details about product quality, materials, or features..."
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-stone-300 py-2.5 text-xs font-bold hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="flex-1 rounded-xl bg-[#2A4434] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1C2F24] transition disabled:opacity-50 dark:bg-[#A4B896] dark:text-[#0f1a17]"
                >
                  {savingProduct ? "Publishing..." : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT & UPDATE PRODUCT MODAL ─── */}
      {editProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-[#141E18] border border-stone-200 dark:border-stone-800 my-8">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Pencil size={18} className="text-[#2A4434] dark:text-[#A4B896]" /> Update Product
                </h3>
                <p className="text-xs text-stone-400">Modify details, price, sale price, or images.</p>
              </div>
              <button
                onClick={() => setEditProd(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Product Title *</label>
                <input
                  required
                  value={editProd.name}
                  onChange={(e) => setEditProd({ ...editProd, name: e.target.value })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Brand Name</label>
                  <input
                    value={editProd.brand}
                    onChange={(e) => setEditProd({ ...editProd, brand: e.target.value })}
                    placeholder="e.g. Hadi Mart, Sony"
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Category *</label>
                  <select
                    value={editProd.categoryId}
                    onChange={(e) => setEditProd({ ...editProd, categoryId: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Price (PKR) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={editProd.price}
                    onChange={(e) => setEditProd({ ...editProd, price: Number(e.target.value) })}
                    placeholder="4500"
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Sale Price</label>
                  <input
                    type="number"
                    min="0"
                    value={editProd.salePrice ?? ""}
                    onChange={(e) =>
                      setEditProd({
                        ...editProd,
                        salePrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Optional"
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    value={editProd.stock}
                    onChange={(e) => setEditProd({ ...editProd, stock: Number(e.target.value) || 0 })}
                    placeholder="20"
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-1.5">
                  Product Image
                </label>

                {/* Hidden File Input for Editing */}
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditFileUpload}
                />

                {/* Upload Box */}
                <div
                  onClick={() => editFileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-900/60 p-4 text-center transition hover:border-[#2A4434] hover:bg-[#2A4434]/5 dark:hover:border-[#A4B896] cursor-pointer"
                >
                  {uploadingEditImage ? (
                    <div className="flex flex-col items-center gap-2 py-3">
                      <RefreshCw size={24} className="animate-spin text-[#2A4434] dark:text-[#A4B896]" />
                      <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Uploading new image...
                      </p>
                    </div>
                  ) : editProd.images?.[0] ? (
                    <div className="flex items-center gap-4 w-full">
                      <img
                        src={editProd.images[0]}
                        alt="Preview"
                        className="h-20 w-20 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shadow-xs shrink-0 bg-white"
                      />
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <CheckCircle size={14} className="text-emerald-600" /> Current Photo
                        </p>
                        <p className="text-[11px] text-stone-400 truncate mt-0.5">{editProd.images[0]}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            editFileInputRef.current?.click();
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 shadow-xs transition"
                        >
                          <UploadCloud size={12} /> Replace Photo from Device
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-3">
                      <UploadCloud size={24} className="text-[#2A4434] dark:text-[#A4B896]" />
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        Click to select photo from Device
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editProd.description}
                  onChange={(e) => setEditProd({ ...editProd, description: e.target.value })}
                  placeholder="Details about product quality, materials, or features..."
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#2A4434] dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditProd(null)}
                  className="flex-1 rounded-xl border border-stone-300 py-2.5 text-xs font-bold hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProduct}
                  className="flex-1 rounded-xl bg-[#2A4434] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1C2F24] transition disabled:opacity-50 dark:bg-[#A4B896] dark:text-[#0f1a17]"
                >
                  {updatingProduct ? "Updating..." : "Save & Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
