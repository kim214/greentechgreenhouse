import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { supabase } from "../lib/supabaseClient";
import { cn } from "../lib/utils";

const REDIRECT_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/reset-password`
    : "https://greentechgreenhouse.vercel.app/reset-password";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: REDIRECT_URL,
      });

      if (error) {
        setMessage({ text: error.message, type: "error" });
        return;
      }

      setMessage({
        text: "Check your email for a link to reset your password. If you don't see it, check your spam folder.",
        type: "success",
      });
      setEmail("");
    } catch (err) {
      console.error(err);
      setMessage({
        text: "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary via-primary to-primary/90 p-12 text-white">
        <Link to="/" className="flex items-center gap-3 w-fit">
          <img
            src="/greentech-logo.png"
            alt="GreenTech"
            className="h-11 w-11 rounded-xl object-contain"
          />
          <span className="font-display text-xl font-semibold tracking-tight">GreenTech</span>
        </Link>

        <div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Reset your
            <br />
            password
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/90">
            Enter your email and we'll send you a link to create a new password.
          </p>
        </div>

        <p className="text-sm text-white/70">
          © {new Date().getFullYear()} GreenTech Systems
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <img
              src="/greentech-logo.png"
              alt="GreenTech"
              className="h-9 w-9 rounded-lg object-contain"
            />
            <span className="font-display text-lg font-semibold text-foreground">GreenTech</span>
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Forgot password?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 rounded-xl bg-primary py-6 text-base font-medium hover:bg-primary/90"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          {message && (
            <div
              className={cn(
                "mt-6 rounded-xl border px-4 py-3 text-sm",
                message.type === "success"
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "border-destructive/30 bg-destructive/5 text-destructive"
              )}
            >
              {message.text}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
