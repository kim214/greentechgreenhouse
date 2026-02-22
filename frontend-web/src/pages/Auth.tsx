import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Leaf } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

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
        setBottomMessage("Password does not meet requirements.");
        return;
      }
      if (!passwordsMatch) {
        setBottomMessage("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    setBottomMessage("");

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
          localStorage.setItem("userLoggedIn", "true");
          localStorage.setItem("fullName", data.fullName || "");
          navigate("/dashboard");
        } else {
          setBottomMessage("Signup successful! Please log in.");
          setMode("login");
          setPassword("");
          setConfirmPassword("");
        }
      }
    } catch (err) {
      console.error(err);
      setBottomMessage("Server error. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-100 to-green-200 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Greenhouse Logo" className="mx-auto h-14 w-14" />
          <h2 className="mt-4 text-xl font-bold text-green-700">GreenTech</h2>
          <p className="text-sm text-gray-500">Smart Farming for a Sustainable Future</p>
        </div>

        {/* Mode toggle */}
        <div className="mb-6 flex rounded-xl border bg-gray-100 p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all ${
                mode === m ? "bg-green-600 text-white" : "text-gray-600 hover:text-green-600"
              }`}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <Input
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}

          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {mode === "signup" && (
            <>
              <div className="text-xs text-gray-500 space-y-1">
                <p className={passwordRules.length ? "text-green-600" : ""}>• 8+ characters</p>
                <p className={passwordRules.uppercase ? "text-green-600" : ""}>• Uppercase letter</p>
                <p className={passwordRules.lowercase ? "text-green-600" : ""}>• Lowercase letter</p>
                <p className={passwordRules.number ? "text-green-600" : ""}>• Number</p>
                <p className={passwordRules.special ? "text-green-600" : ""}>• Special character</p>
              </div>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </>
          )}

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            <Leaf size={16} className="mr-2" />
            {mode === "login" ? "Log In" : "Create Account"}
          </Button>
        </form>

        {/* Bottom message */}
        {bottomMessage && (
          <div className="mt-4 text-center text-sm text-green-600 border-t pt-2">
            {bottomMessage}
          </div>
        )}
      </div>
    </div>
  );
}
