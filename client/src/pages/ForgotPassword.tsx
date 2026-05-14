/**
 * Forgot Password Page — Admin password reset request
 * Sends a reset link to the admin's email address.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

const LOGO_URL = "/manus-storage/smarterswipe_logo_468640f5.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const forgotMutation = trpc.adminAuth.forgotPassword.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await forgotMutation.mutateAsync({
        email,
        origin: window.location.origin,
      });
      setSent(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col">
      {/* Back to login link */}
      <div className="p-6">
        <a
          href="/admin/login"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to login
        </a>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <img
              src={LOGO_URL}
              alt="SmarterSwipe"
              className="h-8 w-auto mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="mt-2 text-sm text-white/50">
              Enter your admin email and we'll send you a reset link
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            {sent ? (
              /* Success state */
              <div className="text-center py-4">
                <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-white mb-2">
                  Check Your Email
                </h2>
                <p className="text-sm text-white/60 mb-6">
                  If an account exists for <strong className="text-white/80">{email}</strong>, we've sent a password reset link. It expires in 1 hour.
                </p>
                <a
                  href="/admin/login"
                  className="inline-block py-2.5 px-6 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl transition-all"
                >
                  Return to Login
                </a>
              </div>
            ) : (
              /* Form state */
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
                    htmlFor="reset-email"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <input
                      id="reset-email"
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

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#2951D5] hover:bg-[#2345b8] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Help text */}
          <p className="mt-6 text-center text-xs text-white/30">
            Only @smarterswipe.com email addresses are eligible for password reset.
          </p>
        </div>
      </div>
    </div>
  );
}
