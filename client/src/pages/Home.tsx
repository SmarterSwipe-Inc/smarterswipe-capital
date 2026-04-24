/**
 * SmarterSwipe Capital Landing Page — Light Theme
 * Brand: smarterswipe.com (Sora font, #2951D5 blue, clean fintech style)
 * White background, dark text, blue accents, soft shadows
 * Page structure follows exact spec from pasted_content.txt
 */
import { Navbar } from "@/components/Navbar";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ApplicationForm } from "@/components/ApplicationForm";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Handshake,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  BarChart3,
  ChevronDown,
  Utensils,
  RefreshCw,
  Send,
  Users,
  Zap,
  Building2,
  CreditCard,
} from "lucide-react";
import { useState } from "react";

const LOGO_URL = "/manus-storage/smarterswipe_logo_468640f5.png";
const DASHBOARD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663366999363/bg682ZZYSf7zZ2GPuGAVzn/dashboard-mockup-PeyyYieG65pRsiPYQMErPE.webp";

/* ───── FAQ Item ───── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[16px] font-medium text-[#0B1120] group-hover:text-[#2951D5] transition-colors pr-4">
          {question}
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-48 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-[15px] leading-[25px] text-[#6b7280]">{answer}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const scrollToForm = () => {
    const el = document.getElementById("form-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-[#0B1120] overflow-x-hidden">
      <Navbar />

      {/* ═══════════ 1. HERO SECTION ═══════════ */}
      <section className="relative bg-white" style={{ paddingTop: "72px" }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — Copy */}
            <AnimatedSection>
              <div>
                <span className="section-label">
                  <DollarSign size={14} />
                  Business Capital
                </span>

                <h1
                  className="mt-8"
                  style={{
                    fontSize: "clamp(36px, 5vw, 60px)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: "-1.5px",
                    color: "#0B1120",
                  }}
                >
                  Unlock Capital to{" "}
                  <span className="gradient-text">Grow Your Business</span>
                </h1>

                <p className="mt-6 text-[18px] leading-[30px] text-[#6b7280] max-w-lg">
                  SmarterSwipe helps business owners access funding, improve cash flow, and scale — based on real revenue, not just credit.
                </p>

                <ul className="mt-6 space-y-3">
                  {[
                    "Fast approvals based on business performance",
                    "Options for new funding or refinancing",
                    "Built for businesses already generating revenue",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#2951D5] mt-0.5 shrink-0" />
                      <span className="text-[16px] text-[#3a3f4b]">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button onClick={scrollToForm} className="btn-primary">
                    Check Your Options
                    <ArrowRight size={18} />
                  </button>
                </div>
                <p className="mt-3 text-[13px] text-[#9ca3af]">
                  No impact to credit to check options
                </p>
              </div>
            </AnimatedSection>

            {/* Right — Dashboard visual */}
            <AnimatedSection delay={200}>
              <div className="hidden lg:block relative">
                <div className="absolute -inset-6 bg-gradient-to-br from-[#2951D5]/5 to-[#7c5cfc]/5 rounded-3xl" />
                <div className="relative bg-[#0B1120] rounded-2xl p-1 shadow-2xl shadow-[#2951D5]/10">
                  <img
                    src={DASHBOARD_IMG}
                    alt="SmarterSwipe Dashboard"
                    className="w-full rounded-xl"
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════ 2. TRUST / AUTHORITY STRIP ═══════════ */}
      <section className="bg-[#f8f9fc] border-y border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            {[
              { icon: <Users size={18} />, text: "Trusted by growing businesses nationwide" },
              { icon: <Utensils size={18} />, text: "Built for restaurants, retail, and service businesses" },
              { icon: <BarChart3 size={18} />, text: "Backed by real payment & revenue data" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2.5 text-[14px] text-[#6b7280] font-medium">
                <span className="text-[#2951D5]">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 3. PROBLEM SECTION ═══════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <span className="section-label">The Problem</span>
            <h2
              className="mt-8"
              style={{
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "#0B1120",
              }}
            >
              Most Businesses Don't Have a Capital Problem —{" "}
              <span className="gradient-text">They Have an Access Problem</span>
            </h2>
          </AnimatedSection>

          <div className="mt-14 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <XCircle size={24} className="text-red-400" />,
                text: "Businesses are generating revenue but getting denied or slowed down by banks",
              },
              {
                icon: <RefreshCw size={24} className="text-amber-500" />,
                text: "Many are stuck in high daily payments or bad funding structures",
              },
              {
                icon: <Search size={24} className="text-[#2951D5]" />,
                text: "They need a better way to access capital that works with their business",
              },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="light-card p-8 h-full text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#f5f7fa] flex items-center justify-center mx-auto mb-5">
                    {item.icon}
                  </div>
                  <p className="text-[15px] leading-[24px] text-[#6b7280]">{item.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 4. SOLUTION SECTION ═══════════ */}
      <section className="py-20 lg:py-28 bg-[#f8f9fc]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <div>
                <span className="section-label">The Solution</span>
                <h2
                  className="mt-8"
                  style={{
                    fontSize: "clamp(28px, 3.5vw, 42px)",
                    fontWeight: 700,
                    lineHeight: 1.15,
                    color: "#0B1120",
                  }}
                >
                  A <span className="gradient-text">Smarter Way</span> to Access Capital
                </h2>
                <p className="mt-6 text-[17px] leading-[28px] text-[#6b7280]">
                  SmarterSwipe helps businesses get the capital they need to grow — without the runaround.
                </p>

                <ul className="mt-8 space-y-4">
                  {[
                    "Secure working capital based on your revenue",
                    "Refinance existing advances for better terms",
                    "Improve cash flow with flexible repayment",
                    "Build long-term funding eligibility",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#22c55e] mt-0.5 shrink-0" />
                      <span className="text-[16px] text-[#3a3f4b]">{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-8 text-[17px] font-semibold text-[#2951D5]">
                  This isn't just funding — it's a growth system.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <DollarSign size={28} />, label: "Up to $1M+", sub: "Capital available" },
                  { icon: <Clock size={28} />, label: "24 Hours", sub: "Pre-offer timeline" },
                  { icon: <Shield size={28} />, label: "No PG", sub: "Personal guarantees" },
                  { icon: <Zap size={28} />, label: "Days", sub: "Not weeks to fund" },
                ].map((stat, i) => (
                  <div key={i} className="light-card p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#f0f4ff] flex items-center justify-center mx-auto mb-3 text-[#2951D5]">
                      {stat.icon}
                    </div>
                    <div className="text-[22px] font-bold text-[#0B1120]">{stat.label}</div>
                    <div className="text-[13px] text-[#9ca3af] mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════ 5. HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="section-label">How It Works</span>
            <h2
              className="mt-8"
              style={{
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "#0B1120",
              }}
            >
              From Application to Funded in{" "}
              <span className="gradient-text">4 Simple Steps</span>
            </h2>
            <p className="mt-5 text-[17px] leading-[28px] text-[#6b7280]">
              Our process is designed to be fast, transparent, and painless.
            </p>
          </AnimatedSection>

          <div className="mt-14 grid md:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                icon: <Send size={24} />,
                title: "Submit Your Info",
                desc: "Quick 2-minute application. No credit impact, no paperwork headaches.",
              },
              {
                num: "02",
                icon: <Search size={24} />,
                title: "We Review Your Business",
                desc: "Our team reviews your revenue data and delivers options within 24 hours.",
              },
              {
                num: "03",
                icon: <Handshake size={24} />,
                title: "Get Matched with Options",
                desc: "See transparent offers tailored to your business. No obligation to accept.",
              },
              {
                num: "04",
                icon: <TrendingUp size={24} />,
                title: "Choose & Grow",
                desc: "Accept your offer, get funded in days, and invest in your business growth.",
              },
            ].map((step, i) => (
              <AnimatedSection key={step.num} delay={i * 100}>
                <div className="light-card p-8 h-full relative overflow-hidden group">
                  {/* Large background number */}
                  <span
                    className="absolute -top-2 -right-2 font-bold text-[#f0f4ff] leading-none select-none pointer-events-none"
                    style={{ fontSize: "100px" }}
                  >
                    {step.num}
                  </span>

                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-[#f0f4ff] flex items-center justify-center mb-5 text-[#2951D5] group-hover:bg-[#2951D5] group-hover:text-white transition-colors">
                      {step.icon}
                    </div>
                    <h3 className="text-[18px] font-semibold text-[#0B1120] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[15px] leading-[24px] text-[#6b7280]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 6. WHO THIS IS FOR ═══════════ */}
      <section id="who-this-is-for" className="py-20 lg:py-28 bg-[#f8f9fc]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="section-label">Qualification</span>
            <h2
              className="mt-8"
              style={{
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "#0B1120",
              }}
            >
              Who This Is <span className="gradient-text">For</span>
            </h2>
          </AnimatedSection>

          <div className="mt-14 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Good Fit */}
            <AnimatedSection>
              <div className="light-card p-8 h-full border-t-4 border-t-[#22c55e]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-[#22c55e]" />
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#0B1120]">Good Fit</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Businesses generating monthly revenue",
                    "Accept card payments or open to it",
                    "Looking for $5,000 – $500,000+",
                    "Want to grow or improve cash flow",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-[#22c55e] mt-0.5 shrink-0" />
                      <span className="text-[15px] text-[#3a3f4b]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* Not Ideal */}
            <AnimatedSection delay={100}>
              <div className="light-card p-8 h-full border-t-4 border-t-red-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <XCircle size={20} className="text-red-400" />
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#0B1120]">Not Ideal</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Personal loans",
                    "Brand new startups with no revenue",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                      <span className="text-[15px] text-[#3a3f4b]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════ 7. USE CASES ═══════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="section-label">Use Cases</span>
            <h2
              className="mt-8"
              style={{
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "#0B1120",
              }}
            >
              Capital Solutions <span className="gradient-text">Tailored to You</span>
            </h2>
          </AnimatedSection>

          <div className="mt-14 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="light-card p-8 h-full">
                <div className="w-14 h-14 rounded-2xl bg-[#f0f4ff] flex items-center justify-center mb-6">
                  <Utensils size={28} className="text-[#2951D5]" />
                </div>
                <h3 className="text-[20px] font-semibold text-[#0B1120] mb-3">
                  For Restaurants
                </h3>
                <p className="text-[16px] leading-[26px] text-[#6b7280] mb-4">
                  Get capital and upgrade your payment systems. Fund renovations, equipment, staffing, and inventory — all while optimizing your processing costs.
                </p>
                <p className="text-[14px] font-semibold text-[#2951D5]">
                  Get Capital + Upgrade Your Payment Systems
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="light-card p-8 h-full">
                <div className="w-14 h-14 rounded-2xl bg-[#f0f4ff] flex items-center justify-center mb-6">
                  <RefreshCw size={28} className="text-[#2951D5]" />
                </div>
                <h3 className="text-[20px] font-semibold text-[#0B1120] mb-3">
                  For Businesses with Existing MCA
                </h3>
                <p className="text-[16px] leading-[26px] text-[#6b7280] mb-4">
                  Stuck in a high-cost advance? We can help you refinance into better terms, lower your daily payments, and access additional capital.
                </p>
                <p className="text-[14px] font-semibold text-[#2951D5]">
                  Lower Your Payments & Access Additional Capital
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════ 8. FORM SECTION ═══════════ */}
      <section id="form-section" className="py-20 lg:py-28 bg-[#f8f9fc]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-10">
            <span className="section-label">Apply Now</span>
            <h2
              className="mt-8"
              style={{
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "#0B1120",
              }}
            >
              Check Your <span className="gradient-text">Funding Options</span>
            </h2>
            <p className="mt-5 text-[17px] leading-[28px] text-[#6b7280]">
              Takes less than 60 seconds. No obligation.
            </p>
          </AnimatedSection>

          <AnimatedSection className="max-w-3xl mx-auto">
            <div className="light-card relative overflow-hidden" style={{ padding: "32px 32px 24px" }}>
              {/* Subtle glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-[#2951D5]/5 rounded-full blur-3xl" />

              <div className="relative">
                <ApplicationForm />
              </div>
            </div>
          </AnimatedSection>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-[13px] text-[#9ca3af]">
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="text-[#22c55e]" />
              No credit impact
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="text-[#22c55e]" />
              Bank-level encryption
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#22c55e]" />
              2-minute application
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ SECTION ═══════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <span className="section-label">FAQ</span>
              <h2
                className="mt-8"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 42px)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: "#0B1120",
                }}
              >
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
            </div>

            <div>
              <FAQItem
                question="Does applying affect my credit score?"
                answer="No. Our initial pre-approval process does not require a hard credit pull. We use your business revenue data to determine eligibility, so your personal credit score is not impacted."
              />
              <FAQItem
                question="How much capital can I access?"
                answer="Businesses can access anywhere from $5,000 to $500,000+ depending on monthly revenue, time in business, and overall business health."
              />
              <FAQItem
                question="How fast can I get funded?"
                answer="Most businesses receive a pre-offer within 24 hours of applying. Once you accept, funding is typically deposited within 1-3 business days."
              />
              <FAQItem
                question="What can I use the capital for?"
                answer="Anything your business needs — inventory, payroll, expansion, equipment, marketing, renovations, or even refinancing existing debt. There are no restrictions on use."
              />
              <FAQItem
                question="Do I need a personal guarantee?"
                answer="No. Our funding is based on your business revenue, not personal assets. We don't require personal guarantees for most of our capital products."
              />
              <FAQItem
                question="What are the repayment terms?"
                answer="Repayment is flexible and based on your revenue. During busy months you pay more, during slower months you pay less. This keeps cash flow healthy and predictable."
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-20 lg:py-28 bg-[#0B1120] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2951D5]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7c5cfc]/10 rounded-full blur-3xl" />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <h2
              className="text-white"
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: 700,
                lineHeight: 1.15,
              }}
            >
              Your Growth{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #a5baff 0%, #4361EE 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  paddingBottom: "0.08em",
                  display: "inline",
                }}
              >
                Shouldn't Wait
              </span>
            </h2>
            <p className="mt-6 text-[18px] leading-[30px] text-white/60">
              Apply in 2 minutes. Pre-offer in 24 hours. Funded in days.
            </p>
            <button onClick={scrollToForm} className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#0B1120] font-semibold text-[16px] hover:bg-gray-100 transition-all shadow-lg shadow-white/10">
              Get Pre-Approved Now
              <ArrowRight size={18} />
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ 9. FOOTER ═══════════ */}
      <footer className="bg-white border-t border-gray-100 py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <div className="bg-[#0B1120] inline-block rounded-lg px-3 py-2 mb-4">
                <img
                  src={LOGO_URL}
                  alt="SmarterSwipe"
                  className="h-5 w-auto"
                />
              </div>
              <p className="text-[14px] leading-[22px] text-[#6b7280] max-w-sm">
                Helping businesses grow through smarter payments and capital solutions. Revenue-based funding up to $1M+ with no personal guarantees.
              </p>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">
                Solutions
              </h4>
              <ul className="space-y-3">
                {["Payments", "Point of Sale", "Capital", "Technology"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href={`https://smarterswipe.com/${item.toLowerCase().replace(/ /g, "-")}`}
                        className="text-[14px] text-[#6b7280] hover:text-[#2951D5] transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                {["About Us", "Blog", "Become An Agent", "Client Login"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href={`https://smarterswipe.com/${item.toLowerCase().replace(/ /g, "-")}`}
                        className="text-[14px] text-[#6b7280] hover:text-[#2951D5] transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="section-divider mt-10 mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-[#9ca3af]">
              &copy; {new Date().getFullYear()} SmarterSwipe. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://smarterswipe.com/privacy-policy"
                className="text-[12px] text-[#9ca3af] hover:text-[#2951D5] transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="https://smarterswipe.com/terms-of-service"
                className="text-[12px] text-[#9ca3af] hover:text-[#2951D5] transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="https://smarterswipe.com/funding-disclosures"
                className="text-[12px] text-[#9ca3af] hover:text-[#2951D5] transition-colors"
              >
                Funding Disclosures
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
