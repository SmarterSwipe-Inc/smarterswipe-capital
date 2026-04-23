/**
 * SmarterSwipe Capital Landing Page
 * Design: Dark theme matching smarterswipe.com brand kit exactly
 * Colors: #0a0a12 bg, #2951D5 primary blue, #a5baff light blue, #22c55e green
 * Font: Sora for everything (matching smarterswipe.com)
 * Patterns: section labels, gradient text, dark cards, grid overlay
 */
import { Navbar } from "@/components/Navbar";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
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
} from "lucide-react";
import { useState } from "react";

const LOGO_URL = "/manus-storage/smarterswipe_logo_468640f5.png";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663366999363/bg682ZZYSf7zZ2GPuGAVzn/hero-bg-PeS4fFdaByGtxXTcf5ZExy.webp";
const DASHBOARD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663366999363/bg682ZZYSf7zZ2GPuGAVzn/dashboard-mockup-PeyyYieG65pRsiPYQMErPE.webp";
const RESTAURANT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663366999363/bg682ZZYSf7zZ2GPuGAVzn/restaurant-capital-Pf68WivM4t8qv88PVrE4hL.webp";
const BUSINESS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663366999363/bg682ZZYSf7zZ2GPuGAVzn/business-growth-LPf5FATrJfzVPfsEQTADfS.webp";

/* ───── Trust Strip Counter ───── */
function TrustCounter({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const { ref, isInView } = useInView();
  const count = useCountUp(end, 2000, isInView);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-white/50 mt-1">{label}</div>
    </div>
  );
}

/* ───── FAQ Item ───── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[15px] font-medium text-white/90 group-hover:text-white transition-colors pr-4">
          {question}
        </span>
        <ChevronDown
          size={18}
          className={`text-white/40 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-40 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm text-white/50 leading-relaxed">{answer}</p>
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
    <div className="min-h-screen bg-[#0a0a12] text-white overflow-x-hidden">
      <Navbar />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative min-h-[100vh] flex items-center pt-20">
        {/* Background layers */}
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/60 via-transparent to-[#0a0a12]" />
        </div>
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay pointer-events-none" />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div>
              <span className="section-label mb-6 inline-flex">
                <DollarSign size={14} className="text-[#a5baff]" />
                Business Capital
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mt-6">
                Unlock Capital to{" "}
                <span className="gradient-text">Grow Your Business</span>
              </h1>

              <p className="text-base md:text-lg text-white/60 mt-6 max-w-lg leading-relaxed">
                SmarterSwipe helps business owners access funding, improve cash
                flow, and scale — based on real revenue, not just credit.
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  "Fast approvals based on business performance",
                  "Options for new funding or refinancing",
                  "Built for businesses already generating revenue",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-[#22c55e] mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-white/70">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button onClick={scrollToForm} className="btn-primary">
                  Check Your Options
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("how-it-works");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="btn-secondary"
                >
                  See How It Works
                  <ChevronDown size={18} />
                </button>
              </div>

              <p className="mt-4 text-xs text-white/40 flex items-center gap-1.5">
                <Shield size={12} />
                No impact to credit to check options
              </p>
            </div>

            {/* Right — Dashboard mockup */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-8 bg-[#2951D5]/10 rounded-3xl blur-3xl" />
                <img
                  src={DASHBOARD_IMG}
                  alt="SmarterSwipe Dashboard"
                  className="relative w-full rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST / AUTHORITY STRIP ═══════════ */}
      <section className="relative py-16 md:py-20">
        <div className="section-divider mb-16" />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  icon: <Shield size={20} className="text-[#2951D5]" />,
                  title: "Trusted by Growing Businesses",
                  desc: "Nationwide",
                },
                {
                  icon: <BarChart3 size={20} className="text-[#2951D5]" />,
                  title: "Built for Restaurants, Retail",
                  desc: "& Service Businesses",
                },
                {
                  icon: <TrendingUp size={20} className="text-[#2951D5]" />,
                  title: "Backed by Real Payment",
                  desc: "& Revenue Data",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#2951D5]/10 flex items-center justify-center shrink-0 group-hover:bg-[#2951D5]/20 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {item.title}
                    </div>
                    <div className="text-sm text-white/50">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
        <div className="section-divider mt-16" />
      </section>

      {/* ═══════════ PROBLEM SECTION ═══════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <span className="section-label mb-6 inline-flex">
              The Problem
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight mt-6">
              Most Businesses Don't Have a Capital Problem —{" "}
              <span className="gradient-text">They Have an Access Problem</span>
            </h2>
          </AnimatedSection>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <XCircle size={20} className="text-red-400" />,
                title: "Getting Denied by Banks",
                desc: "Businesses are generating revenue but getting denied or slowed down by traditional lenders who don't understand their model.",
              },
              {
                icon: <RefreshCw size={20} className="text-amber-400" />,
                title: "Stuck in Bad Structures",
                desc: "Many are stuck in high daily payments or bad funding structures that drain cash flow instead of fueling growth.",
              },
              {
                icon: <Search size={20} className="text-[#a5baff]" />,
                title: "Need a Better Way",
                desc: "They need a smarter, faster way to access capital that's based on real business performance — not just a credit score.",
              },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 100}>
                <div className="dark-card p-6 md:p-8 h-full hover:border-white/[0.12] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-5">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SOLUTION SECTION ═══════════ */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#0d0d1a] to-[#0a0a12]" />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — Image */}
            <AnimatedSection>
              <div className="relative">
                <div className="absolute -inset-4 bg-[#2951D5]/5 rounded-2xl blur-2xl" />
                <img
                  src={BUSINESS_IMG}
                  alt="Business growth"
                  className="relative w-full rounded-2xl"
                />
              </div>
            </AnimatedSection>

            {/* Right — Copy */}
            <AnimatedSection delay={150}>
              <span className="section-label mb-6 inline-flex">
                The Solution
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight mt-6">
                A <span className="gradient-text">Smarter Way</span> to Access
                Capital
              </h2>
              <p className="text-white/60 mt-6 leading-relaxed">
                SmarterSwipe helps businesses unlock the capital they need to
                grow — without the red tape, long waits, or rigid structures of
                traditional lending.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "Secure working capital",
                  "Refinance existing advances",
                  "Improve cash flow",
                  "Build long-term funding eligibility",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#22c55e]/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={14} className="text-[#22c55e]" />
                    </div>
                    <span className="text-sm text-white/70">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 dark-card p-5 inline-block">
                <p className="text-sm font-medium text-[#a5baff] italic">
                  "This isn't just funding — it's a growth system."
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="section-divider mb-20" />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto">
            <span className="section-label mb-6 inline-flex">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mt-6">
              From Application to Funded in{" "}
              <span className="gradient-text">4 Simple Steps</span>
            </h2>
            <p className="text-white/50 mt-4">
              Our process is designed to be fast, transparent, and painless.
            </p>
          </AnimatedSection>

          <div className="mt-16 relative">
            {/* Vertical line connector (desktop) */}
            <div className="hidden md:block absolute left-[60px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-[#2951D5] to-[#a5baff]" />

            <div className="space-y-6">
              {[
                {
                  num: "01",
                  icon: <FileText size={22} className="text-[#a5baff]" />,
                  title: "Submit Your Info",
                  desc: "Complete a quick application with basic business info. No credit pull, no paperwork headaches.",
                  bullets: ["2-minute application", "No credit impact", "No documents needed upfront"],
                },
                {
                  num: "02",
                  icon: <Search size={22} className="text-[#a5baff]" />,
                  title: "We Review Your Business",
                  desc: "Our team analyzes your revenue data and business performance to find the best options for you.",
                  bullets: ["Revenue-based analysis", "Multiple lender matching", "Transparent process"],
                },
                {
                  num: "03",
                  icon: <Handshake size={22} className="text-[#a5baff]" />,
                  title: "Get Matched with Options",
                  desc: "Receive tailored funding options within 24 hours. You'll know exactly what's available and on what terms.",
                  bullets: ["Pre-offer within 24 hours", "Transparent terms upfront", "No obligation to accept"],
                },
                {
                  num: "04",
                  icon: <TrendingUp size={22} className="text-[#a5baff]" />,
                  title: "Choose & Grow",
                  desc: "Accept your offer and get funded in days. Use the capital however your business needs.",
                  bullets: ["Funded in days, not weeks", "Use capital for anything", "Flexible repayment"],
                },
              ].map((step, i) => (
                <AnimatedSection key={step.num} delay={i * 100}>
                  <div className="relative flex gap-6 md:gap-10">
                    {/* Step number circle */}
                    <div className="relative z-10 shrink-0">
                      <div className="w-[120px] hidden md:flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#2951D5] flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-[#2951D5]/30">
                          {step.num}
                        </div>
                      </div>
                    </div>

                    {/* Card */}
                    <div className="flex-1 dark-card p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-colors">
                      {/* Large background number */}
                      <span className="absolute top-4 right-6 text-[5rem] md:text-[7rem] font-bold text-white/[0.03] leading-none select-none">
                        {step.num}
                      </span>

                      <div className="relative">
                        {/* Mobile step number */}
                        <div className="md:hidden flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-[#2951D5] flex items-center justify-center text-xs font-bold text-white">
                            {step.num}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          {step.icon}
                          <h3 className="text-lg font-semibold text-white">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed mb-4 max-w-lg">
                          {step.desc}
                        </p>
                        <ul className="space-y-2">
                          {step.bullets.map((b) => (
                            <li key={b} className="flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-[#22c55e] shrink-0" />
                              <span className="text-xs text-[#22c55e]/80">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ WHO THIS IS FOR ═══════════ */}
      <section id="who-this-is-for" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#0d0d1a] to-[#0a0a12]" />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto">
            <span className="section-label mb-6 inline-flex">Qualification</span>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mt-6">
              Do You <span className="gradient-text">Qualify</span>?
            </h2>
            <p className="text-white/50 mt-4">
              Our capital solutions are designed for established businesses generating real revenue.
            </p>
          </AnimatedSection>

          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {/* Good Fit */}
            <AnimatedSection>
              <div className="dark-card p-6 md:p-8 h-full border-[#22c55e]/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-[#22c55e]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Good Fit
                  </h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Businesses generating monthly revenue",
                    "Accept card payments or open to it",
                    "Looking for $5,000 – $500,000+",
                    "Want to grow or improve cash flow",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2
                        size={16}
                        className="text-[#22c55e] mt-0.5 shrink-0"
                      />
                      <span className="text-sm text-white/70">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* Not Ideal */}
            <AnimatedSection delay={100}>
              <div className="dark-card p-6 md:p-8 h-full border-red-400/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center">
                    <XCircle size={20} className="text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Not Ideal
                  </h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Personal loans",
                    "Brand new startups with no revenue",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <XCircle
                        size={16}
                        className="text-red-400 mt-0.5 shrink-0"
                      />
                      <span className="text-sm text-white/70">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={200} className="mt-8 text-center">
            <p className="text-sm text-white/40">
              Not sure if you qualify? Apply anyway — there's no credit impact and no obligation.
            </p>
            <button onClick={scrollToForm} className="btn-primary mt-6">
              Check My Pre-Approval
              <ArrowRight size={18} />
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ OFFER SECTION ═══════════ */}
      <section className="py-20 md:py-28">
        <div className="section-divider mb-20" />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-14">
            <span className="section-label mb-6 inline-flex">Use Cases</span>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mt-6">
              Capital That Works <span className="gradient-text">for You</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Restaurant */}
            <AnimatedSection>
              <div className="dark-card overflow-hidden group h-full">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={RESTAURANT_IMG}
                    alt="Restaurant"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14141e] to-transparent" />
                  <div className="absolute bottom-4 left-6">
                    <div className="flex items-center gap-2">
                      <Utensils size={16} className="text-[#a5baff]" />
                      <span className="text-xs font-medium text-[#a5baff] uppercase tracking-wider">
                        For Restaurants
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Get Capital + Upgrade Your Payment Systems
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-6">
                    Access funding to grow your restaurant while upgrading to smarter
                    payment processing that saves you money on every transaction.
                  </p>
                  <button onClick={scrollToForm} className="btn-primary text-sm py-3 px-6">
                    Learn More
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </AnimatedSection>

            {/* Existing MCA */}
            <AnimatedSection delay={100}>
              <div className="dark-card overflow-hidden group h-full">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#1a1a24] to-[#0d0d16]">
                  {/* Abstract visualization for MCA */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-2 border-[#2951D5]/20 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full border-2 border-[#2951D5]/40 flex items-center justify-center">
                          <RefreshCw size={28} className="text-[#2951D5] animate-spin" style={{ animationDuration: "8s" }} />
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center">
                        <TrendingUp size={12} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-6">
                    <div className="flex items-center gap-2">
                      <RefreshCw size={16} className="text-[#a5baff]" />
                      <span className="text-xs font-medium text-[#a5baff] uppercase tracking-wider">
                        Existing MCA
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Lower Your Payments & Access Additional Capital
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-6">
                    Already have a merchant cash advance? We can help you refinance
                    to lower daily payments and unlock additional working capital.
                  </p>
                  <button onClick={scrollToForm} className="btn-primary text-sm py-3 px-6">
                    Learn More
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════ FORM SECTION ═══════════ */}
      <section id="form-section" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#0d0d1a] to-[#0a0a12]" />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="section-label mb-6 inline-flex">
                <FileText size={14} className="text-[#a5baff]" />
                Apply Now
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight mt-6">
                Check Your <span className="gradient-text">Funding Options</span>
              </h2>
              <p className="text-white/50 mt-4">
                Takes less than 60 seconds. No obligation.
              </p>
            </div>

            {/* Form embed placeholder */}
            <div className="dark-card p-8 md:p-12 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-[#2951D5]/10 rounded-full blur-3xl" />

              <div className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#2951D5]/10 flex items-center justify-center mx-auto mb-6">
                  <FileText size={28} className="text-[#2951D5]" />
                </div>
                <div className="py-16 px-8 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                  <p className="text-lg font-semibold text-white/60">
                    [GHL FORM EMBED HERE]
                  </p>
                  <p className="text-sm text-white/30 mt-2">
                    Form integration placeholder
                  </p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-white/40">
                <span className="flex items-center gap-1.5">
                  <Shield size={12} className="text-[#22c55e]" />
                  No credit impact
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield size={12} className="text-[#22c55e]" />
                  Bank-level encryption
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-[#22c55e]" />
                  2-minute application
                </span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ FAQ SECTION ═══════════ */}
      <section className="py-20 md:py-28">
        <div className="section-divider mb-20" />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <span className="section-label mb-6 inline-flex">FAQ</span>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight mt-6">
                Capital <span className="gradient-text">FAQ</span>
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
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#0d0d1a] to-[#0a0a12]" />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Your Growth <span className="gradient-text">Shouldn't Wait</span>
            </h2>
            <p className="text-white/50 mt-6 text-lg">
              Apply in 2 minutes. Pre-offer in 24 hours. Funded in days.
            </p>
            <button onClick={scrollToForm} className="mt-10 inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-[#0a0a12] font-bold hover:shadow-lg hover:shadow-white/10 transition-all hover:-translate-y-0.5 text-lg">
              Get Pre-Approved Now
              <ArrowRight size={20} />
            </button>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <Shield size={12} className="text-[#22c55e]" />
                No credit impact
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={12} className="text-[#22c55e]" />
                No personal guarantees
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-[#22c55e]" />
                24-hour pre-offers
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/[0.06] py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <img
                src={LOGO_URL}
                alt="SmarterSwipe"
                className="h-6 w-auto mb-4"
                style={{ mixBlendMode: "screen" }}
              />
              <p className="text-sm text-white/40 max-w-sm leading-relaxed">
                Helping businesses grow through smarter payments and capital
                solutions. Revenue-based funding up to $1M+ with no personal
                guarantees.
              </p>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">
                Solutions
              </h4>
              <ul className="space-y-3">
                {["Payments", "Point of Sale", "Capital", "Technology"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href={`https://smarterswipe.com/${item.toLowerCase().replace(/ /g, "-")}`}
                        className="text-sm text-white/40 hover:text-white/70 transition-colors"
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
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                {["About Us", "Blog", "Become An Agent", "Client Login"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href={`https://smarterswipe.com/${item.toLowerCase().replace(/ /g, "-")}`}
                        className="text-sm text-white/40 hover:text-white/70 transition-colors"
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
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} SmarterSwipe. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://smarterswipe.com/privacy-policy"
                className="text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="https://smarterswipe.com/terms-of-service"
                className="text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="https://smarterswipe.com/funding-disclosures"
                className="text-xs text-white/30 hover:text-white/50 transition-colors"
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
