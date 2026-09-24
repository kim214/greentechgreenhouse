import { useEffect, useState } from "react";
import { fetchCurrentProfile, type AdminProfile } from "../lib/adminApi";

export function useCurrentProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCurrentProfile()
      .then((next) => {
        if (cancelled) return;
        setProfile(next);
        if (next?.full_name) {
          try {
            localStorage.setItem("fullName", next.full_name);
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    profile,
    loading,
    isAdmin: profile?.role === "admin",
  };
}
