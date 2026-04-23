/**
 * Navbar — matches smarterswipe.com navigation
 * Dark background, logo left, nav links center, CTA right
 * Sticky with backdrop blur on scroll
 */
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const LOGO_URL = "/manus-storage/smarterswipe_logo_468640f5.png";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a12]/90 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo */}
          <a href="https://smarterswipe.com" className="flex items-center shrink-0">
            <img
              src={LOGO_URL}
              alt="SmarterSwipe"
              className="h-6 md:h-7 w-auto"
              style={{ mixBlendMode: "screen" }}
            />
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <a
              href="https://smarterswipe.com"
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              Home
            </a>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("who-this-is-for")}
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              Who It's For
            </button>
            <button
              onClick={() => scrollTo("form-section")}
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              Apply
            </button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://smarterswipe.com/login"
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              Client Login
            </a>
            <button
              onClick={() => scrollTo("form-section")}
              className="btn-gradient text-sm"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a12]/95 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="px-4 py-4 space-y-1">
            <a
              href="https://smarterswipe.com"
              className="block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Home
            </a>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="block w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("who-this-is-for")}
              className="block w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Who It's For
            </button>
            <button
              onClick={() => scrollTo("form-section")}
              className="block w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Apply
            </button>
            <div className="pt-3 border-t border-white/[0.06]">
              <button
                onClick={() => scrollTo("form-section")}
                className="btn-gradient w-full justify-center text-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
