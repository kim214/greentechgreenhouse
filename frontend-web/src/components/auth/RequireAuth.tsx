import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { fetchCurrentProfile } from "../../lib/adminApi";

export function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const location = useLocation();
  const [state, setState] = useState<"loading" | "anon" | "user" | "forbidden">("loading");

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        if (!cancelled) setState("anon");
        return;
      }
      if (!adminOnly) {
        if (!cancelled) setState("user");
        return;
      }
      const profile = await fetchCurrentProfile();
      if (!cancelled) setState(profile?.role === "admin" ? "user" : "forbidden");
    });
    return () => {
      cancelled = true;
    };
  }, [adminOnly]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-sm text-muted-foreground" role="status">
          Checking access…
        </p>
      </div>
    );
  }
  if (state === "anon") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (state === "forbidden") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
