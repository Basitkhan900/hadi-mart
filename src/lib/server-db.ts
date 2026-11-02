import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getMongoDb } from "./mongodb";
import { products as initialProducts } from "./db";
import type { Product, Order, User, ContactMessage, Review, NewsletterSubscriber } from "./types";

// ─── Password Hashing (SHA-256 + salt, native crypto) ────────────────────────
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored.includes(":")) {
    return stored === password; // legacy fallback
  }
  const [salt, hash] = stored.split(":");
  const check = crypto.createHmac("sha256", salt).update(password).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(check, "hex"));
}

// ─── Local JSON Fallback / Migration Source ──────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "src", "data");
const DATA_FILE = path.join(DATA_DIR, "store-data.json");

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  users: User[];
  messages: ContactMessage[];
  reviews: Review[];
  newsletterSubscribers: NewsletterSubscriber[];
}

function getInitialLocalData(): DatabaseSchema {
  return {
    products: initialProducts && initialProducts.length > 0 ? initialProducts : [],
    orders: [],
    users: [
      {
        id: "u-admin",
        name: "Hadi Admin",
        email: "admin@hadimart.pk",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
    ],
    messages: [],
    reviews: [],
    newsletterSubscribers: [],
  };
}

let localCache: DatabaseSchema | null = null;

function readLocalFile(): DatabaseSchema {
  if (localCache) return localCache;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      localCache = {
        products: Array.isArray(parsed.products) ? parsed.products : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        users: Array.isArray(parsed.users) ? parsed.users : [],
        messages: Array.isArray(parsed.messages) ? parsed.messages : [],
        reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
        newsletterSubscribers: Array.isArray(parsed.newsletterSubscribers) ? parsed.newsletterSubscribers : [],
      };
      return localCache;
    }
  } catch (err) {
    console.error("Error reading store-data.json:", err);
  }

  localCache = getInitialLocalData();
  saveLocalFile(localCache);
  return localCache;
}

function saveLocalFile(data: DatabaseSchema) {
  localCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving store-data.json:", err);
  }
}

// ─── Auto-migration on first MongoDB run ──────────────────────────────────────
let hasMigrated = false;
async function ensureMongoInitialized() {
  if (hasMigrated) return;
  const db = await getMongoDb();
  if (!db) return;

  try {
    const productsCount = await db.collection("products").countDocuments();
    if (productsCount === 0) {
      const local = readLocalFile();
      const prodsToSeed = local.products && local.products.length > 0 ? local.products : initialProducts;
      if (prodsToSeed && prodsToSeed.length > 0) {
        await db.collection("products").insertMany(prodsToSeed.map((p) => ({ ...p })));
      }

      if (local.users && local.users.length > 0) {
        await db.collection("users").insertMany(local.users.map((u) => ({ ...u })));
      }

      if (local.orders && local.orders.length > 0) {
        await db.collection("orders").insertMany(local.orders.map((o) => ({ ...o })));
      }

      if (local.reviews && local.reviews.length > 0) {
        await db.collection("reviews").insertMany(local.reviews.map((r) => ({ ...r })));
      }

      if (local.messages && local.messages.length > 0) {
        await db.collection("messages").insertMany(local.messages.map((m) => ({ ...m })));
      }

      if (local.newsletterSubscribers && local.newsletterSubscribers.length > 0) {
        await db.collection("newsletterSubscribers").insertMany(local.newsletterSubscribers.map((s) => ({ ...s })));
      }
    }
    hasMigrated = true;
  } catch (err) {
    console.error("Error initializing MongoDB data:", err);
  }
}

// Clean MongoDB document by removing _id and returning typed object
function cleanDoc<T>(doc: any): T {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest as T;
}

// ─── Products API Layer ───────────────────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
  const db = await getMongoDb();
  if (db) {
    await ensureMongoInitialized();
    const docs = await db.collection("products").find({}).toArray();
    return docs.map((d) => cleanDoc<Product>(d));
  }
  return readLocalFile().products;
}

export async function addProduct(product: Product): Promise<Product> {
  const db = await getMongoDb();
  if (db) {
    await db.collection("products").insertOne({ ...product });
    return product;
  }
  const local = readLocalFile();
  local.products.unshift(product);
  saveLocalFile(local);
  return product;
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
  const db = await getMongoDb();
  if (db) {
    const { id: _ignore, ...updateFields } = patch as any;
    const res = await db.collection("products").findOneAndUpdate(
      { id },
      { $set: updateFields },
      { returnDocument: "after" }
    );
    return res ? cleanDoc<Product>(res) : null;
  }
  const local = readLocalFile();
  const idx = local.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  local.products[idx] = { ...local.products[idx], ...patch };
  saveLocalFile(local);
  return local.products[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await getMongoDb();
  if (db) {
    const res = await db.collection("products").deleteOne({ id });
    return (res.deletedCount ?? 0) > 0;
  }
  const local = readLocalFile();
  const prevLen = local.products.length;
  local.products = local.products.filter((p) => p.id !== id);
  if (local.products.length !== prevLen) {
    saveLocalFile(local);
    return true;
  }
  return false;
}

export async function clearAllProducts(): Promise<void> {
  const db = await getMongoDb();
  if (db) {
    await db.collection("products").deleteMany({});
    return;
  }
  const local = readLocalFile();
  local.products = [];
  saveLocalFile(local);
}

// ─── Orders API Layer ─────────────────────────────────────────────────────────
export async function getOrders(): Promise<Order[]> {
  const db = await getMongoDb();
  if (db) {
    await ensureMongoInitialized();
    const docs = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => cleanDoc<Order>(d));
  }
  return readLocalFile().orders;
}

export async function addOrder(order: Order): Promise<Order> {
  const db = await getMongoDb();
  if (db) {
    await db.collection("orders").insertOne({ ...order });
    return order;
  }
  const local = readLocalFile();
  local.orders.unshift(order);
  saveLocalFile(local);
  return order;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order | null> {
  const db = await getMongoDb();
  if (db) {
    const res = await db.collection("orders").findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: "after" }
    );
    return res ? cleanDoc<Order>(res) : null;
  }
  const local = readLocalFile();
  const idx = local.orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  local.orders[idx].status = status;
  saveLocalFile(local);
  return local.orders[idx];
}

// ─── Users API Layer ──────────────────────────────────────────────────────────
export async function getUsers(): Promise<User[]> {
  const db = await getMongoDb();
  if (db) {
    await ensureMongoInitialized();
    const docs = await db.collection("users").find({}).toArray();
    return docs.map((d) => cleanDoc<User>(d));
  }
  return readLocalFile().users;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const cleanEmail = email.trim().toLowerCase();
  const db = await getMongoDb();
  if (db) {
    await ensureMongoInitialized();
    const doc = await db.collection("users").findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
    });
    return doc ? cleanDoc<User>(doc) : undefined;
  }
  return readLocalFile().users.find((u) => u.email.toLowerCase() === cleanEmail);
}

export async function registerCustomer(data: {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
}): Promise<{ user?: User; error?: string }> {
  const existing = await findUserByEmail(data.email);
  if (existing) {
    return { error: "An account with this email already exists. Please log in!" };
  }

  const newUser: User = {
    id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: data.name,
    email: data.email,
    password: data.password ? hashPassword(data.password) : undefined,
    avatar: data.avatar,
    role: "customer",
    createdAt: new Date().toISOString(),
  };

  const db = await getMongoDb();
  if (db) {
    await db.collection("users").insertOne({ ...newUser });
    return { user: newUser };
  }

  const local = readLocalFile();
  local.users.unshift(newUser);
  saveLocalFile(local);
  return { user: newUser };
}

export async function authenticateCustomer(
  email: string,
  password?: string
): Promise<{ user?: User; error?: string }> {
  const user = await findUserByEmail(email);
  if (!user) {
    return { error: "No account found with this email. Please sign up first!" };
  }

  if (user.password && password) {
    if (!verifyPassword(password, user.password)) {
      return { error: "Incorrect password. Please try again." };
    }
  }

  return { user };
}

export async function saveUser(user: User): Promise<User> {
  const db = await getMongoDb();
  if (db) {
    const { _id, ...cleanUser } = user as any;
    await db.collection("users").updateOne(
      { email: { $regex: new RegExp(`^${user.email.trim()}$`, "i") } },
      { $set: cleanUser },
      { upsert: true }
    );
    return user;
  }
  const local = readLocalFile();
  const idx = local.users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (idx >= 0) {
    local.users[idx] = { ...local.users[idx], ...user };
  } else {
    local.users.unshift(user);
  }
  saveLocalFile(local);
  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = await getMongoDb();
  if (db) {
    const target = await db.collection("users").findOne({ id });
    if (!target || target.role === "admin" || target.id === "u-admin") {
      return false;
    }
    const res = await db.collection("users").deleteOne({ id });
    return (res.deletedCount ?? 0) > 0;
  }
  const local = readLocalFile();
  const target = local.users.find((u) => u.id === id);
  if (!target || target.role === "admin" || target.id === "u-admin") {
    return false;
  }
  const prevLen = local.users.length;
  local.users = local.users.filter((u) => u.id !== id);
  if (local.users.length !== prevLen) {
    saveLocalFile(local);
    return true;
  }
  return false;
}

// ─── Contact Messages API Layer ───────────────────────────────────────────────
export async function getMessages(): Promise<ContactMessage[]> {
  const db = await getMongoDb();
  if (db) {
    await ensureMongoInitialized();
    const docs = await db.collection("messages").find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => cleanDoc<ContactMessage>(d));
  }
  return readLocalFile().messages;
}

export async function addMessage(msg: Omit<ContactMessage, "id" | "createdAt">): Promise<ContactMessage> {
  const fullMsg: ContactMessage = {
    ...msg,
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const db = await getMongoDb();
  if (db) {
    await db.collection("messages").insertOne({ ...fullMsg });
    return fullMsg;
  }
  const local = readLocalFile();
  local.messages.unshift(fullMsg);
  saveLocalFile(local);
  return fullMsg;
}

export async function markMessageRead(id: string): Promise<boolean> {
  const db = await getMongoDb();
  if (db) {
    const res = await db.collection("messages").updateOne({ id }, { $set: { read: true } });
    return (res.modifiedCount ?? 0) > 0;
  }
  const local = readLocalFile();
  const idx = local.messages.findIndex((m) => m.id === id);
  if (idx >= 0) {
    local.messages[idx].read = true;
    saveLocalFile(local);
    return true;
  }
  return false;
}

export async function deleteMessage(id: string): Promise<boolean> {
  const db = await getMongoDb();
  if (db) {
    const res = await db.collection("messages").deleteOne({ id });
    return (res.deletedCount ?? 0) > 0;
  }
  const local = readLocalFile();
  const prevLen = local.messages.length;
  local.messages = local.messages.filter((m) => m.id !== id);
  if (local.messages.length !== prevLen) {
    saveLocalFile(local);
    return true;
  }
  return false;
}

// ─── Reviews API Layer ────────────────────────────────────────────────────────
export async function getReviews(): Promise<Review[]> {
  const db = await getMongoDb();
  if (db) {
    await ensureMongoInitialized();
    const docs = await db.collection("reviews").find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => cleanDoc<Review>(d));
  }
  return readLocalFile().reviews;
}

export async function addReview(review: Omit<Review, "id" | "createdAt">): Promise<Review> {
  const full: Review = {
    ...review,
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const db = await getMongoDb();
  if (db) {
    await db.collection("reviews").insertOne({ ...full });
    return full;
  }
  const local = readLocalFile();
  local.reviews.unshift(full);
  saveLocalFile(local);
  return full;
}

export async function updateReviewStatus(id: string, status: Review["status"]): Promise<Review | null> {
  const db = await getMongoDb();
  if (db) {
    const res = await db.collection("reviews").findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: "after" }
    );
    return res ? cleanDoc<Review>(res) : null;
  }
  const local = readLocalFile();
  const idx = local.reviews.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  local.reviews[idx].status = status;
  saveLocalFile(local);
  return local.reviews[idx];
}

// ─── Newsletter Subscribers API Layer ────────────────────────────────────────
export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const db = await getMongoDb();
  if (db) {
    await ensureMongoInitialized();
    const docs = await db.collection("newsletterSubscribers").find({}).sort({ subscribedAt: -1 }).toArray();
    return docs.map((d) => cleanDoc<NewsletterSubscriber>(d));
  }
  return readLocalFile().newsletterSubscribers;
}

export async function addNewsletterSubscriber(
  email: string
): Promise<{ subscriber?: NewsletterSubscriber; alreadyExists?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();
  const db = await getMongoDb();
  if (db) {
    await ensureMongoInitialized();
    const existing = await db.collection("newsletterSubscribers").findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
    });
    if (existing) return { alreadyExists: true };

    const subscriber: NewsletterSubscriber = {
      id: `nl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
    };
    await db.collection("newsletterSubscribers").insertOne({ ...subscriber });
    return { subscriber };
  }

  const local = readLocalFile();
  const existing = local.newsletterSubscribers.find(
    (s) => s.email.toLowerCase() === cleanEmail
  );
  if (existing) return { alreadyExists: true };

  const subscriber: NewsletterSubscriber = {
    id: `nl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
  };
  local.newsletterSubscribers.unshift(subscriber);
  saveLocalFile(local);
  return { subscriber };
}
