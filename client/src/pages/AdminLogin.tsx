/**
 * Admin Login Page — Custom email/password authentication
 * SmarterSwipe brand styling, separate from Manus OAuth
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Loader2 } from "lucide-react";

const LOGO_URL = "/manus-storage/smarterswipe_logo_468640f5.png";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in
  const { data: adminSession, isLoading: sessionLoading } = trpc.adminAuth.me.useQuery();
  const loginMutation = trpc.adminAuth.login.useMutation();

  // Redirect to admin dashboard if already authenticated
  useEffect(() => {
    if (adminSession) {
      navigate("/admin");
    }
  }, [adminSession, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success) {
        navigate("/admin");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#2951D5]" size={32} />
      </div>
    );
  }

  // If already authenticated, show nothing while redirecting
  if (adminSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col">
      {/* Back to home link */}
      <div className="p-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to home
        </a>
      </div>

      {/* Centered login card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <img
              src={LOGO_URL}
              alt="SmarterSwipe"
              className="h-8 w-auto mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-white/50">
              Sign in with your SmarterSwipe admin credentials
            </p>
          </div>

          {/* Login form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Email field */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-sm font-medium text-white/70 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@smarterswipe.com"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#2951D5]/50 focus:border-[#2951D5] transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-white/70 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#2951D5]/50 focus:border-[#2951D5] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="text-right">
                <a
                  href="/admin/forgot-password"
                  className="text-xs text-[#2951D5] hover:text-[#5b7de8] transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#2951D5] hover:bg-[#2345b8] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Help text */}
          <p className="mt-6 text-center text-xs text-white/30">
            Access restricted to authorized SmarterSwipe administrators.
            <br />
            Contact your team lead if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
