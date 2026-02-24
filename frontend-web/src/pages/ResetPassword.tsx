import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { supabase } from "../lib/supabaseClient";
import { cn } from "../lib/utils";

const passwordRules = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { key: "special", label: "One special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function ResetPassword() {
  const navigate = useNavigate();
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [checking, setChecking] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [success, setSuccess] = useState(false);

  const isPasswordValid = passwordRules.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    const checkRecovery = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get("type");

      if (type === "recovery" || (session && window.location.hash.includes("type=recovery"))) {
        setHasRecoverySession(true);
      }
      setChecking(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setHasRecoverySession(true);
      }
    });

    checkRecovery();
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || !passwordsMatch) {
      setMessage({ text: "Password does not meet requirements or passwords do not match.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setMessage({ text: error.message, type: "error" });
        return;
      }

      setSuccess(true);
      setMessage({ text: "Your password has been updated. You can now sign in.", type: "success" });
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying reset link…</p>
        </div>
      </div>
    );
  }

  if (!hasRecoverySession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Invalid or expired link
          </h1>
          <p className="text-muted-foreground mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

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
            Create your
            <br />
            new password
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/90">
            Choose a strong password that you don't use elsewhere.
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
              {success ? "Password updated" : "Set new password"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {success
                ? "Redirecting you to sign in…"
                : "Enter your new password below. It must meet the requirements shown."}
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
              <p className="text-center text-muted-foreground">
                You can now sign in with your new password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="sr-only">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {password.length > 0 && (
                <div className="space-y-1.5">
                  {passwordRules
                    .filter((rule) => !rule.test(password))
                    .map((rule) => (
                      <p key={rule.key} className="text-xs text-destructive flex items-center gap-2">
                        <span aria-hidden>•</span>
                        {rule.label}
                      </p>
                    ))}
                </div>
              )}

              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={cn("pl-10 pr-10", !passwordsMatch && confirmPassword && "border-destructive")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1.5 text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch}
                className="w-full gap-2 rounded-xl bg-primary py-6 text-base font-medium hover:bg-primary/90"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          )}

          {message && !success && (
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

          {!success && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
