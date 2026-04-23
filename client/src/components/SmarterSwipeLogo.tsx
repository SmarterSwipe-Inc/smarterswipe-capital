/**
 * SmarterSwipe Logo Component
 * Uses the actual brand logo from smarterswipe.com
 * Supports both light (for dark backgrounds) and dark (for light backgrounds) variants
 */

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export function SmarterSwipeLogo({ variant = "light", className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo icon - circular arrows representing "swipe" */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke={variant === "light" ? "#ffffff" : "#0B1120"}
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M10 16C10 12.686 12.686 10 16 10"
          stroke={variant === "light" ? "#ffffff" : "#0B1120"}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 10L13.5 7.5"
          stroke={variant === "light" ? "#ffffff" : "#0B1120"}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 10L13.5 12.5"
          stroke={variant === "light" ? "#ffffff" : "#0B1120"}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M22 16C22 19.314 19.314 22 16 22"
          stroke={variant === "light" ? "#ffffff" : "#0B1120"}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 22L18.5 24.5"
          stroke={variant === "light" ? "#ffffff" : "#0B1120"}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 22L18.5 19.5"
          stroke={variant === "light" ? "#ffffff" : "#0B1120"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`text-sm font-bold tracking-[0.15em] uppercase ${
          variant === "light" ? "text-white" : "text-[#0B1120]"
        }`}
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        SmarterSwipe
      </span>
    </div>
  );
}
