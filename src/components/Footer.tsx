import Link from "next/link";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Leaf } from "lucide-react";

const links = {
  Shop: [
    { label: "All Products", href: "/shop" },
    { label: "Skincare & Beauty", href: "/shop?cat=beauty" },
    { label: "Fresh Grocery", href: "/shop?cat=grocery" },
    { label: "Home & Living", href: "/shop?cat=home" },
    { label: "Organic Fashion", href: "/shop?cat=fashion" },
    { label: "Flash Sale", href: "/shop?sale=1" },
  ],
  Account: [
    { label: "Track Orders", href: "/account/orders" },
    { label: "My Wishlist", href: "/wishlist" },
    { label: "Account Login", href: "/login" },
  ],
  CustomerCare: [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Track Orders", href: "/account/orders" },
    { label: "7-Day Return Policy", href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[#2F4435] bg-[#1E2E24] text-stone-200">
      {/* Main footer contents */}
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Intro */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center text-2xl font-extrabold tracking-[0.2em] uppercase font-serif text-white">
                HADI <span className="mx-1 text-[#8FA683] text-lg font-sans font-light"></span> MART
              </span>
            </div>
            <p className="max-w-xs text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
              Pakistan&apos;s mindful destination for organic skincare, farm-fresh pantry staples, and consciously crafted lifestyle goods.
            </p>
            <div className="space-y-2 text-xs text-stone-400">
              <p className="flex items-center gap-2"><Phone size={14} className="text-[#8FA683]" /> 03368222900 (Mon - Sat 9am - 8pm)</p>
              <p className="flex items-center gap-2"><Mail size={14} className="text-[#8FA683]" /> basitbangash8899@gmail.com</p>
              <p className="flex items-center gap-2"><MapPin size={14} className="text-[#8FA683]" /> Peshawar, Pakistan · Nationwide Delivery</p>
            </div>
            {/* Social links */}
            <div className="flex gap-2.5 pt-2">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-8 w-8 place-items-center rounded-full border border-stone-600 text-stone-300 transition hover:border-[#8FA683] hover:text-[#8FA683]"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#8FA683]">
                {heading === "CustomerCare" ? "Customer Care" : heading}
              </p>
              <ul className="space-y-2 text-xs text-stone-300">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="transition hover:text-white hover:underline underline-offset-4">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#293E30] bg-[#16221A] py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-[11px] text-stone-400 md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} Hadi Mart. Natural, Pure &amp; Conscious Essentials.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>JazzCash</span>
            <span>Easypaisa</span>
            <span>Visa &amp; Mastercard</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
