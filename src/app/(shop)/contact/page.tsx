"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      // Still show success to user
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F4EE] dark:bg-[#111916] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-4xl">📬</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E3926] dark:text-[#E2EFE7]">
            Get In Touch With Us
          </h1>
          <p className="mt-3 text-stone-600 dark:text-stone-400 text-sm sm:text-base">
            Have a question about an order, our products, or delivery? We are here to help 7 days a week.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Cards */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white dark:bg-[#1A2620] p-6 shadow-sm border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-[#EAF0E7] dark:bg-[#253320] p-3 text-[#2A4434] dark:text-[#A4B896]">
                  <Phone size={22} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Phone Support</h3>
                  <p className="text-base font-semibold text-stone-800 dark:text-stone-200 mt-0.5">
                    +92 3368222900
                  </p>
                  <p className="text-xs text-stone-500">Mon - Sat: 9:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#1A2620] p-6 shadow-sm border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-[#EAF0E7] dark:bg-[#253320] p-3 text-[#2A4434] dark:text-[#A4B896]">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Email Us</h3>
                  <p className="text-base font-semibold text-stone-800 dark:text-stone-200 mt-0.5">
                    basitbangash8899@gmail.com
                  </p>
                  <p className="text-xs text-stone-500">Fast response within 2 hours</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#1A2620] p-6 shadow-sm border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-[#EAF0E7] dark:bg-[#253320] p-3 text-[#2A4434] dark:text-[#A4B896]">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">WhatsApp Help</h3>
                  <p className="text-base font-semibold text-stone-800 dark:text-stone-200 mt-0.5">
                    +92 3368222900
                  </p>
                  <p className="text-xs text-stone-500">Instant Chat & Order Tracking</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#1A2620] p-6 shadow-sm border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-[#EAF0E7] dark:bg-[#253320] p-3 text-[#2A4434] dark:text-[#A4B896]">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Store Location</h3>
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mt-0.5">
                    University Town , Unversity Road
                  </p>
                  <p className="text-xs text-stone-500">Peshawar, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-white dark:bg-[#1A2620] p-8 sm:p-10 shadow-sm border border-stone-200/80 dark:border-stone-800">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-[#EAF0E7] dark:bg-[#253320] p-4 text-[#2A4434] dark:text-[#A4B896]">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-[#1E3926] dark:text-[#E2EFE7]">
                    Thank You, {formData.name}!
                  </h2>
                  <p className="mt-2 text-stone-600 dark:text-stone-400 text-sm max-w-md">
                    Your message has been received. Our team will review your inquiry and get back to you at{" "}
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{formData.email}</span> shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
                    }}
                    className="mt-6 rounded-full bg-[#2A4434] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#1F3324] transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-2xl font-bold text-[#1E3926] dark:text-[#E2EFE7]">
                    Send Us a Message
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ali Khan"
                        className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-[#F9FAF8] dark:bg-[#141E18] px-4 py-2.5 text-sm outline-none transition focus:border-[#2A4434] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. ali@example.com"
                        className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-[#F9FAF8] dark:bg-[#141E18] px-4 py-2.5 text-sm outline-none transition focus:border-[#2A4434] dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0300-1234567"
                        className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-[#F9FAF8] dark:bg-[#141E18] px-4 py-2.5 text-sm outline-none transition focus:border-[#2A4434] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Order inquiry, Returns, etc."
                        className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-[#F9FAF8] dark:bg-[#141E18] px-4 py-2.5 text-sm outline-none transition focus:border-[#2A4434] dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help you today? Please share your question or order number..."
                      className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-[#F9FAF8] dark:bg-[#141E18] px-4 py-2.5 text-sm outline-none transition focus:border-[#2A4434] dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2A4434] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1B3025] transition active:scale-95 disabled:opacity-50"
                  >
                    <Send size={16} /> {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

