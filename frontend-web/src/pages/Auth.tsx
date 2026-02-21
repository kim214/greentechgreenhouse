import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // New state for bottom notification message
  const [bottomMessage, setBottomMessage] = useState("");

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup") {
      if (!isPasswordValid) {
        alert("Password does not meet security requirements.");
        return;
      }
      if (!passwordsMatch) {
        alert("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    setBottomMessage(""); // clear previous message

    try {
      const endpoint =
        mode === "login"
          ? "http://localhost/greentech-api/login.php"
          : "http://localhost/greentech-api/signup.php";

      const payload =
        mode === "login"
          ? { email, password }
          : { fullName, email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.error) {
        setBottomMessage(data.error);
      } else {
        if (mode === "login") {
          // Save login status locally
          localStorage.setItem("userLoggedIn", "true");
          localStorage.setItem("fullName", data.fullName || "");
          navigate("/dashboard"); // redirect to dashboard
        } else {
          // Signup successful → show bottom message & switch to login
          setBottomMessage("Signup successful! Please log in.");
          setMode("login");
          setPassword("");
          setConfirmPassword("");
        }
      }
    } catch (err) {
      console.error(err);
      setBottomMessage("Server error. Make sure XAMPP is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      <button
        onClick={() => navigate("/")}
        className="absolute left-6 top-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={15} />
        Back to home
      </button>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl p-8 shadow-[0_0_60px_hsl(152_72%_40%/0.12)] border border-border bg-card">
           {/* Logo & Title */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
              
              />
            </div>
            <div>
            
              <p className="text-sm text-muted-foreground">Smart Farming For a Sustainable Future</p>
            </div>
          </div>
          {/* Mode toggle */}
          <div className="mb-6 flex rounded-xl border border-border bg-secondary/40 p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 rounded-lg py-2 text-sm font-medium transition-all capitalize",
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Full name"
                  className="pl-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="email"
                placeholder="Email address"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {mode === "signup" && (
              <>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p className={passwordRules.length ? "text-green-500" : ""}>
                    • At least 8 characters
                  </p>
                  <p className={passwordRules.uppercase ? "text-green-500" : ""}>
                    • At least 1 uppercase letter
                  </p>
                  <p className={passwordRules.lowercase ? "text-green-500" : ""}>
                    • At least 1 lowercase letter
                  </p>
                  <p className={passwordRules.number ? "text-green-500" : ""}>
                    • At least 1 number
                  </p>
                  <p className={passwordRules.special ? "text-green-500" : ""}>
                    • At least 1 special character
                  </p>
                </div>

                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500">Passwords do not match.</p>
                )}
              </>
            )}

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <Leaf size={16} />
              {mode === "login" ? "Log In to Dashboard" : "Create Account"}
            </Button>
          </form>

          {/* Bottom notification message */}
          {bottomMessage && (
            <div className="mt-4 text-center text-sm text-green-600 border-t border-border pt-2 animate-fadeIn">
              {bottomMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}