import { NextResponse } from "next/server";
import { addNewsletterSubscriber, getNewsletterSubscribers } from "@/lib/server-db";
import nodemailer from "nodemailer";

// ─── Nodemailer transporter (Gmail SMTP) ──────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEWSLETTER_EMAIL,
      pass: process.env.NEWSLETTER_EMAIL_PASSWORD,
    },
  });
}

// ─── GET: list subscribers (admin use) ────────────────────────────────────────
export async function GET() {
  const subscribers = await getNewsletterSubscribers();
  return NextResponse.json(subscribers);
}

// ─── POST: subscribe email ────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    // Save subscriber to database
    const result = await addNewsletterSubscriber(email);

    if (result.alreadyExists) {
      return NextResponse.json(
        { error: "This email is already subscribed to the Privilege Circle!" },
        { status: 409 }
      );
    }

    // ── Send confirmation email to subscriber ──────────────────────────────
    if (process.env.NEWSLETTER_EMAIL && process.env.NEWSLETTER_EMAIL_PASSWORD) {
      try {
        const transporter = createTransporter();

        await transporter.sendMail({
          from: `"Hadi Mart" <${process.env.NEWSLETTER_EMAIL}>`,
          to: email,
          subject: "🎉 Welcome to the Hadi Mart Privilege Circle!",
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1E2E24; color: #f5f5f0; border-radius: 16px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #243528, #2D4232); padding: 40px 32px; text-align: center; border-bottom: 2px solid #3B5441;">
                <h1 style="font-size: 28px; letter-spacing: 0.15em; color: #EAD098; margin: 0; text-transform: uppercase;">HADI &amp; MART</h1>
                <p style="color: #A4B896; font-size: 13px; margin: 8px 0 0; letter-spacing: 0.08em;">PRIVILEGE CIRCLE</p>
              </div>

              <div style="padding: 40px 32px; text-align: center;">
                <div style="display: inline-block; background: #EAD098; color: #1E3022; font-size: 42px; width: 72px; height: 72px; line-height: 72px; border-radius: 50%; margin-bottom: 24px;">✓</div>
                <h2 style="color: #EAD098; font-size: 22px; margin: 0 0 12px;">You're In the Circle!</h2>
                <p style="color: #D5D5C8; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
                  Welcome to the <strong style="color: #EAD098;">Hadi Mart Privilege Circle</strong>.<br/>
                  As a member, you'll receive exclusive access to:
                </p>

                <div style="background: #243528; border: 1px solid #3B5441; border-radius: 12px; padding: 24px; margin: 0 0 28px; text-align: left;">
                  <ul style="list-style: none; padding: 0; margin: 0; color: #D5D5C8; font-size: 14px; line-height: 2;">
                    <li>✦ &nbsp;<strong style="color: #EAD098;">Rs. 500 OFF</strong> your first order</li>
                    <li>✦ &nbsp;Private flash sales &amp; seasonal discounts</li>
                    <li>✦ &nbsp;New arrivals previews before public launch</li>
                    <li>✦ &nbsp;Secret member-only coupon codes</li>
                  </ul>
                </div>

                <div style="background: #2D4232; border: 1px solid #EAD098; border-radius: 10px; padding: 18px 24px; margin: 0 0 28px; display: inline-block; min-width: 200px;">
                  <p style="color: #A4B896; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 6px;">Your Welcome Voucher Code</p>
                  <p style="color: #EAD098; font-size: 22px; font-weight: bold; letter-spacing: 0.2em; margin: 0; font-family: monospace;">CIRCLE500</p>
                </div>

                <p style="color: #D5D5C8; font-size: 14px; margin: 0 0 24px;">
                  Use code <strong style="color: #EAD098;">CIRCLE500</strong> at checkout to save Rs. 500 on your first order.
                </p>

                <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://hadimart.pk"}/shop"
                   style="display: inline-block; background: #EAD098; color: #1E3022; text-decoration: none; font-size: 13px; font-weight: bold; letter-spacing: 0.12em; text-transform: uppercase; padding: 14px 32px; border-radius: 50px;">
                  Shop Now →
                </a>
              </div>

              <div style="border-top: 1px solid #3B5441; padding: 20px 32px; text-align: center; color: #6B7E74; font-size: 11px;">
                <p style="margin: 0;">© ${new Date().getFullYear()} Hadi Mart · Lahore, Pakistan · Nationwide Delivery</p>
                <p style="margin: 6px 0 0;">You're receiving this because you subscribed at hadimart.pk. <a href="#" style="color: #A4B896;">Unsubscribe</a></p>
              </div>
            </div>
          `,
        });

        // ── Notify admin ─────────────────────────────────────────────────────
        await transporter.sendMail({
          from: `"Hadi Mart Newsletter" <${process.env.NEWSLETTER_EMAIL}>`,
          to: process.env.NEWSLETTER_EMAIL,
          subject: `New Privilege Circle Subscriber: ${email}`,
          text: `A new subscriber joined the Hadi Mart Privilege Circle.\n\nEmail: ${email}\nTime: ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}`,
        });
      } catch (mailErr: any) {
        console.error("Newsletter email error:", mailErr?.message);
        // Email failure should not block the subscription from being saved
      }
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully!" }, { status: 201 });
  } catch (err: any) {
    console.error("Newsletter subscription error:", err);
    return NextResponse.json({ error: err.message || "Subscription failed." }, { status: 500 });
  }
}

