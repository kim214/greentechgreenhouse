import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabaseClient";

const passwordRules = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { key: "special", label: "One special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = location.pathname === "/signup";

  const [mode, setMode] = useState<"login" | "signup">(isSignup ? "signup" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Sync mode with URL
  useEffect(() => {
    setMode(isSignup ? "signup" : "login");
  }, [isSignup]);

  const isPasswordValid = passwordRules.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup") {
      if (!isPasswordValid) {
        setMessage({ text: "Password does not meet requirements.", type: "error" });
        return;
      }
      if (!passwordsMatch) {
        setMessage({ text: "Passwords do not match.", type: "error" });
        return;
      }
    }

    setLoading(true);
    setMessage(null);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error || !data.user) {
          setMessage({ text: error?.message || "Unable to sign in.", type: "error" });
          return;
        }

        const user = data.user;
        const fullNameFromMetadata =
          (user.user_metadata as { full_name?: string } | null)?.full_name ?? "";

        localStorage.setItem("userLoggedIn", "true");
        localStorage.setItem("fullName", fullNameFromMetadata);
        localStorage.setItem("userId", user.id);

        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (error) {
          setMessage({ text: error.message, type: "error" });
          return;
        }

        setMessage({
          text: "Account created! Please check your email to confirm your account, then sign in.",
          type: "success",
        });
        setPassword("");
        setConfirmPassword("");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof Error
          ? err.message
          : "Connection error.";
      const isConfig =
        msg.includes("fetch") ||
        msg.includes("Failed to fetch") ||
        msg.includes("network") ||
        msg.includes("VITE_SUPABASE");
      setMessage({
        text: isConfig
          ? "Cannot reach Supabase. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, and that your Supabase project is not paused."
          : msg,
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
            Smart greenhouse,
            <br />
            sustainable future.
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/90">
            Monitor irrigation, ventilation, and environmental data in real time.
            Take control of your greenhouse with precision technology.
          </p>
        </div>

        <p className="text-sm text-white/70">
          © {new Date().getFullYear()} GreenTech Systems
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
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
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {mode === "login"
                ? "Sign in to access your greenhouse dashboard."
                : "Start managing your greenhouse with GreenTech."}
            </p>
          </div>

          {/* Mode tabs */}
          <div className="mb-8 flex rounded-xl border border-border bg-muted/50 p-1">
            <Link
              to="/login"
              className={cn(
                "flex-1 rounded-lg py-2.5 text-center text-sm font-medium transition-all",
                !isSignup
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className={cn(
                "flex-1 rounded-lg py-2.5 text-center text-sm font-medium transition-all",
                isSignup
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign up
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label htmlFor="fullName" className="sr-only">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">Email</label>
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="sr-only">Password</label>
                {!isSignup && (
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline ml-auto"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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

            {mode === "signup" && (
              <>
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    {passwordRules
                      .filter((rule) => !rule.test(password))
                      .map((rule) => (
                        <p
                          key={rule.key}
                          className="text-xs text-destructive flex items-center gap-2"
                        >
                          <span aria-hidden>•</span>
                          {rule.label}
                        </p>
                      ))}
                  </div>
                )}

                <div>
                  <label htmlFor="confirmPassword" className="sr-only">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
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
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 rounded-xl bg-primary py-6 text-base font-medium hover:bg-primary/90"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {mode === "login" ? "Sign in" : "Create account"}
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
            <Link to="/" className="font-medium text-primary hover:underline">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
