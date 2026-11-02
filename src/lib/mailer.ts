import nodemailer from "nodemailer";

export function createMailTransporter() {
  const user = process.env.NEWSLETTER_EMAIL;
  const pass = process.env.NEWSLETTER_EMAIL_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/**
 * Send an email notification when a new product is added
 */
export async function sendNewProductNotification(product: {
  id: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  stock: number;
  image?: string;
  description?: string;
}) {
  const adminEmail = process.env.NEWSLETTER_EMAIL;
  const transporter = createMailTransporter();

  if (!transporter || !adminEmail) {
    return;
  }

  try {
    const priceDisplay = product.salePrice
      ? `Rs. ${product.salePrice.toLocaleString()} (Regular: Rs. ${product.price.toLocaleString()})`
      : `Rs. ${product.price.toLocaleString()}`;

    await transporter.sendMail({
      from: `"Hadi Mart Admin" <${adminEmail}>`,
      to: adminEmail,
      subject: `📦 New Product Added: ${product.name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #2A4434; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #2A4434; margin: 0; font-size: 22px;">🌿 Hadi Mart Store Alert</h2>
            <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 13px;">New inventory item published to your storefront</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #4b5563; font-weight: 600; width: 120px;">Product Name:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 700;">${product.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">Brand:</td>
              <td style="padding: 8px 0; color: #111827;">${product.brand}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">Price:</td>
              <td style="padding: 8px 0; color: #166534; font-weight: 700; font-size: 16px;">${priceDisplay}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">Initial Stock:</td>
              <td style="padding: 8px 0; color: #111827;">${product.stock} units</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">Product ID:</td>
              <td style="padding: 8px 0; font-family: monospace; color: #6b7280;">${product.id}</td>
            </tr>
          </table>

          ${
            product.image
              ? `
            <div style="margin: 16px 0; text-align: center;">
              <img src="${product.image}" alt="${product.name}" style="max-height: 220px; border-radius: 12px; object-fit: cover; border: 1px solid #e5e7eb;" />
            </div>
          `
              : ""
          }

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin" style="display: inline-block; background-color: #2A4434; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 24px; font-weight: 600; font-size: 13px;">
              View in Admin Dashboard →
            </a>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send product notification email:", err);
  }
}

/**
 * Send an email notification when a new customer order is placed
 */
export async function sendNewOrderNotification(order: {
  id: string;
  total: number;
  payment: string;
  address: { name: string; phone: string; street: string; city: string };
  items: { productId: string; qty: number; price: number }[];
}) {
  const adminEmail = process.env.NEWSLETTER_EMAIL;
  const transporter = createMailTransporter();

  if (!transporter || !adminEmail) {
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Hadi Mart Orders" <${adminEmail}>`,
      to: adminEmail,
      subject: `🛍️ New Order Placed (#${order.id}) - Rs. ${order.total.toLocaleString()}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #2A4434; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #2A4434; margin: 0; font-size: 22px;">🛍️ New Order Received!</h2>
            <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 13px;">Order ID: <strong>#${order.id}</strong></p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 6px 0; color: #4b5563; font-weight: 600; width: 130px;">Customer Name:</td>
              <td style="padding: 6px 0; color: #111827; font-weight: 700;">${order.address.name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #4b5563; font-weight: 600;">Phone:</td>
              <td style="padding: 6px 0; color: #111827;">${order.address.phone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #4b5563; font-weight: 600;">Delivery Address:</td>
              <td style="padding: 6px 0; color: #111827;">${order.address.street}, ${order.address.city}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #4b5563; font-weight: 600;">Payment Method:</td>
              <td style="padding: 6px 0; color: #111827; font-weight: 600;">${order.payment}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #4b5563; font-weight: 600;">Total Amount:</td>
              <td style="padding: 6px 0; color: #166534; font-weight: 800; font-size: 18px;">Rs. ${order.total.toLocaleString()}</td>
            </tr>
          </table>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin" style="display: inline-block; background-color: #2A4434; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 24px; font-weight: 600; font-size: 13px;">
              Manage Orders in Dashboard →
            </a>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send order notification email:", err);
  }
}

