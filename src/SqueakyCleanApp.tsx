import React, { useState } from "react";

// 🔌 Zapier Webhook URL (replace with your real URL)
const ZAPIER_HOOK_URL = "https://hooks.zapier.com/hooks/catch/XXXXXX/YYYYYY";

// Squeaky Clean Services — Single‑file React MVP
// TailwindCSS required (no external UI libs). Export as default component.
// Sections: Nav, Hero, Trust Badges, Services, Pricing, Process, Service Area, Testimonials, FAQ, Contact/Quote Form, Footer.

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm shadow-sm bg-white/60 backdrop-blur">
      {children}
    </span>
  );
}

function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-16 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">{title}</h2>
          {subtitle && <p className="mt-2 text-slate-600 max-w-3xl">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition ${className}`}>
      {children}
    </div>
  );
}

function Check({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3"><span className="mt-1">✅</span><span>{text}</span></li>
  );
}

type QuoteForm = {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  message: string;
};

const createInitialFormState = (): QuoteForm => ({
  name: "",
  email: "",
  phone: "",
  service: "Residential Cleaning",
  date: "",
  message: "",
});

const services = [
  { title: "Residential Cleaning", details: ["Weekly / Bi‑weekly / Monthly", "Bedrooms, bathrooms, kitchen, living areas", "Standard & deep clean options"] },
  { title: "Move‑In / Move‑Out", details: ["Detailed empty‑home clean", "Inside cabinets, fridge & oven", "Ready for keys‑handoff"] },
  { title: "Airbnb / Turnover", details: ["Fast turnovers", "Laundry & staging available", "Supply restock on request"] },
  { title: "Office / Commercial", details: ["Night or off‑hours", "Desks, floors, restrooms", "Trash & common areas"] },
  { title: "Deep Cleaning", details: ["Baseboards, blinds, vents", "Grout & soap‑scum focus", "High‑touch disinfection"] },
  { title: "Add‑Ons", details: ["Inside oven/fridge", "Windows (interior)", "Garage sweep & more"] },
];

const processSteps = [
  { icon: "1️⃣", title: "Book", description: "Tell us about your space and pick your ideal time." },
  { icon: "2️⃣", title: "We Clean", description: "Professionals arrive with all supplies and a checklist." },
  { icon: "3️⃣", title: "Shine", description: "Walkthrough & 24-hour satisfaction guarantee." },
];

const faqs = [
  { q: "Are you licensed and insured?", a: "Yes. We are fully registered and carry business liability insurance for peace of mind." },
  { q: "Do you bring supplies?", a: "Absolutely. We bring professional‑grade, eco‑friendly supplies and equipment. If you prefer your own products, just let us know." },
  { q: "How do estimates work?", a: "Tell us about your place (sq ft, rooms, pets, last clean) and your goals. We’ll send a clear, no‑pressure quote and recommended frequency." },
  { q: "Can I reschedule?", a: "Yes—please give 24‑hour notice. We’re flexible and happy to rebook your preferred time." },
];

export default function SqueakyCleanApp() {
  const [form, setForm] = useState<QuoteForm>(createInitialFormState());
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(false);
    setIsSubmitting(true);
    try {
      const payload = { ...form, source: "squeakyclean.app", submitted_at: new Date().toISOString() };
      const res = await fetch(ZAPIER_HOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Zapier hook failed");
      }
      setSent(true);
      setForm(createInitialFormState());
    } catch (err: unknown) {
      console.error('Quote submission failed', err);
      alert("There was a problem sending your request. Please try again or call us at (501) 800-6376.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E6F2FF] to-white text-slate-800">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            {/* Brand logo — upload /public/logo-squeakyclean.png */}
            <img src="/logo-squeakyclean.png" alt="Squeaky Clean Services Logo" className="h-10 w-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#services" className="hover:text-[#0056B3]">Services</a>
            <a href="#pricing" className="hover:text-[#0056B3]">Pricing</a>
            <a href="#area" className="hover:text-[#0056B3]">Service Area</a>
            <a href="#contact" className="hover:text-[#0056B3]">Get a Quote</a>
          </nav>
          <a href="#contact" className="inline-flex items-center rounded-xl bg-[#007BFF] px-4 py-2 text-white font-semibold shadow hover:bg-[#0056B3]">Get Free Quote</a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Sparkling homes & spotless offices — <span className="text-[#0056B3]">on your schedule.</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl">
              Reliable, professional cleaning across Little Rock and surrounding areas. Book once or set a recurring plan—our team makes it shine.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge>🛡️ Licensed & Insured</Badge>
              <Badge>♻️ Eco‑friendly Supplies</Badge>
              <Badge>✅ 24‑Hour Satisfaction</Badge>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#contact" className="inline-flex items-center rounded-xl bg-[#007BFF] px-5 py-3 text-white font-semibold shadow hover:bg-[#0056B3]">Get a Free Quote</a>
              <a href="#services" className="inline-flex items-center rounded-xl border px-5 py-3 font-semibold hover:bg-white">See Services</a>
              <a href="https://www.facebook.com/SqueakyClean913" target="_blank" rel="noopener" className="inline-flex items-center rounded-xl border px-5 py-3 font-semibold hover:bg-white">
                <span className="mr-2">📘</span> Follow us on Facebook
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] w-full rounded-3xl bg-white shadow-xl border overflow-hidden">
              {/* Decorative grid */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,.08),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,.08),transparent_40%),radial-gradient(circle_at_40%_80%,rgba(99,102,241,.08),transparent_40%)]"/>
              <div className="relative h-full w-full p-6 flex flex-col items-center justify-center text-center">
                <div className="text-7xl">🧼✨</div>
                <h3 className="mt-4 text-2xl font-bold">Premium Cleaning, Zero Hassle</h3>
                <p className="mt-2 text-slate-600 max-w-md">Book online in minutes—transparent quotes, vetted cleaners, and a spotless finish.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <Section id="services" title="Services" subtitle="Choose a one‑time clean or a recurring plan that fits your life.">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Card key={s.title}>
              <h3 className="text-xl font-bold">{s.title}</h3>
              <ul className="mt-3 space-y-2 text-slate-700">
                {s.details.map((d) => <Check key={d} text={d} />)}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing" title="Transparent Pricing" subtitle="Every home is different—these ranges help you plan. Final quotes depend on size, condition, and add‑ons.">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="relative">
            <div className="absolute -top-3 right-4 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0056B3] border">Popular</div>
            <h3 className="text-xl font-bold">Studio / 1 Bed</h3>
            <p className="mt-2 text-3xl font-extrabold">$95–$145</p>
            <ul className="mt-4 space-y-2 text-slate-700">
              <Check text="Standard clean" />
              <Check text="Kitchen & bath detail" />
              <Check text="All rooms & floors" />
            </ul>
            <a href="#contact" className="mt-6 inline-flex rounded-xl bg-[#007BFF] px-4 py-2 text-white font-semibold">Request Quote</a>
          </Card>
          <Card>
            <h3 className="text-xl font-bold">2–3 Bed Home</h3>
            <p className="mt-2 text-3xl font-extrabold">$145–$245</p>
            <ul className="mt-4 space-y-2 text-slate-700">
              <Check text="Standard or deep clean" />
              <Check text="Baseboards & blinds" />
              <Check text="High‑touch disinfection" />
            </ul>
            <a href="#contact" className="mt-6 inline-flex rounded-xl bg-[#007BFF] px-4 py-2 text-white font-semibold">Request Quote</a>
          </Card>
          <Card>
            <h3 className="text-xl font-bold">Commercial / Office</h3>
            <p className="mt-2 text-3xl font-extrabold">Custom</p>
            <ul className="mt-4 space-y-2 text-slate-700">
              <Check text="Night & weekend options" />
              <Check text="Desks, kitchens, restrooms" />
              <Check text="Trash & common areas" />
            </ul>
            <a href="#contact" className="mt-6 inline-flex rounded-xl bg-[#007BFF] px-4 py-2 text-white font-semibold">Request Walkthrough</a>
          </Card>
        </div>
        <p className="mt-6 text-sm text-slate-500">* Move‑in/out, interior windows, fridge/oven, laundry, and other add‑ons are priced separately.</p>
      </Section>

      {/* Process */}
      <Section id="process" title="How it works">
        <div className="grid md:grid-cols-3 gap-6">
          {processSteps.map((step) => (
            <Card key={step.title}>
              <div className="text-5xl">{step.icon}</div>
              <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
              <p className="mt-1 text-slate-600">{step.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Service Area */}
      <Section id="area" title="Service Area" subtitle="Based in Little Rock, AR — serving surrounding communities.">
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <Card>
            <h3 className="text-lg font-bold">Primary areas</h3>
            <ul className="mt-3 space-y-2 text-slate-700">
              <Check text="Little Rock" />
              <Check text="North Little Rock" />
              <Check text="Bryant / Benton" />
              <Check text="Jacksonville / Sherwood" />
            </ul>
          </Card>
          <Card>
            <h3 className="text-lg font-bold">Good to know</h3>
            <ul className="mt-3 space-y-2 text-slate-700">
              <Check text="Background‑checked cleaners" />
              <Check text="Flexible scheduling (mornings/afternoons)" />
              <Check text="Recurring discounts available" />
              <Check text="Invoices & receipts via QuickBooks" />
            </ul>
          </Card>
        </div>
      </Section>

      {/* Testimonials */}
      <Section id="testimonials" title="Happy clients">
        <div className="grid md:grid-cols-3 gap-6">
          {["Sparkling results—rebooked immediately!","On time, professional, and thorough.","They handled our move‑out perfectly."]
            .map((t, i) => (
              <Card key={i}>
                <p className="italic">“{t}”</p>
                <div className="mt-3 font-semibold">— Local Client</div>
              </Card>
            ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" title="FAQs">
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((f) => (
            <Card key={f.q}>
              <h3 className="font-bold">{f.q}</h3>
              <p className="mt-2 text-slate-700">{f.a}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Contact / Quote Form */}
      <Section id="contact" title="Get a Free Quote" subtitle="Tell us about your place—most quotes in under 24 hours.">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <input required value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="you@example.com" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input required value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="(501) 555‑0123" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Service</label>
                  <select value={form.service} onChange={(e) => setForm((prev) => ({ ...prev, service: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2">
                    {services.map((s) => (
                      <option key={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Preferred Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Notes</label>
                  <input value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Sq ft, bedrooms, pets, last clean…" />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#007BFF] px-5 py-3 text-white font-semibold shadow hover:bg-[#0056B3] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Submit Request"}
              </button>
              {sent && (
                <p className="text-green-700 text-sm" role="status" aria-live="polite">Thanks! Your request was recorded. We’ll email you shortly.</p>
              )}
              <p className="text-xs text-slate-500">By submitting, you agree to be contacted about your quote. No spam—ever.</p>
            </form>
          </Card>
          <Card>
            <h3 className="text-xl font-bold">Prefer to call or email?</h3>
            <p className="mt-2">Phone: <a href="tel:15018006376" className="font-semibold text-[#0056B3]">(501) 800‑6376</a></p>
            <p className="mt-1">Email: <a href="mailto:squeakyclean2780@gmail.com" className="font-semibold text-[#0056B3]">squeakyclean2780@gmail.com</a></p>
            <div className="mt-6">
              <h4 className="font-semibold">Business hours</h4>
              <ul className="mt-2 text-slate-700 space-y-1">
                <li>Mon–Fri: 8:00 AM – 6:00 PM</li>
                <li>Sat: 9:00 AM – 2:00 PM</li>
                <li>Sun: By appointment</li>
              </ul>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold">Payment options</h4>
              <p className="text-slate-700">Card, Cash App, Zelle, QuickBooks invoice.</p>
            </div>
          </Card>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-extrabold">Squeaky Clean Services LLC</div>
            <p className="mt-2 text-slate-600">Professional residential & commercial cleaning in Central Arkansas.</p>
          </div>
          <div>
            <div className="font-semibold">Quick links</div>
            <ul className="mt-2 space-y-1">
              <li><a href="#services" className="hover:text-[#0056B3]">Services</a></li>
              <li><a href="#pricing" className="hover:text-[#0056B3]">Pricing</a></li>
              <li><a href="#faq" className="hover:text-[#0056B3]">FAQs</a></li>
              <li><a href="#contact" className="hover:text-[#0056B3]">Get a Quote</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Assurance</div>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li>✔️ Licensed & insured</li>
              <li>✔️ Satisfaction guarantee</li>
              <li>✔️ Background‑checked team</li>
            </ul>
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} Squeaky Clean Services LLC. All rights reserved.</div>
      </footer>

      {/* Floating CTA */}
      <a href="#contact" className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-[#007BFF] px-5 py-3 text-white font-semibold shadow-lg hover:bg-[#0056B3]">
        <span>Get Free Quote</span> <span>✨</span>
      </a>
    </div>
  );
}
