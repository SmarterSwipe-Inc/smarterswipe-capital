/**
 * Navbar — SmarterSwipe brand, light theme
 * Dark nav bar (matching smarterswipe.com) on white page
 * Sora 14px/500 for links, gradient button for Get Started
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
          ? "bg-[#0B1120]/95 backdrop-blur-xl shadow-lg"
          : "bg-[#0B1120]"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between" style={{ height: "72px" }}>
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center shrink-0 cursor-pointer"
          >
            <img
              src={LOGO_URL}
              alt="SmarterSwipe"
              className="h-6 w-auto"
            />
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <a
              href="https://smarterswipe.com"
              className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white transition-colors"
            >
              Home
            </a>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("who-this-is-for")}
              className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white transition-colors"
            >
              Who It's For
            </button>
            <button
              onClick={() => scrollTo("form-section")}
              className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white transition-colors"
            >
              Apply
            </button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://smarterswipe.com/login"
              className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white transition-colors"
            >
              Client Login
            </a>
            <button
              onClick={() => scrollTo("form-section")}
              className="btn-gradient"
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
        <div className="md:hidden bg-[#0B1120]/98 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 py-4 space-y-1">
            <a
              href="https://smarterswipe.com"
              className="block px-4 py-3 text-[14px] text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Home
            </a>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="block w-full text-left px-4 py-3 text-[14px] text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("who-this-is-for")}
              className="block w-full text-left px-4 py-3 text-[14px] text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Who It's For
            </button>
            <button
              onClick={() => scrollTo("form-section")}
              className="block w-full text-left px-4 py-3 text-[14px] text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Apply
            </button>
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => scrollTo("form-section")}
                className="btn-gradient w-full justify-center"
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
