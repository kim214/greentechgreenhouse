import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

// Use placeholders when missing so the app loads; auth/DB calls will fail with clear errors
const url = supabaseUrl || "https://lcscxrpnjauzrcqalztg.supabase.co";
const key = supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjc2N4cnBuamF1enJjcWFsenRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Mzg0OTQsImV4cCI6MjA4NzQxNDQ5NH0.dopd7-x5nHcHwbQ44A5S0jDFbbnSVPvZGD_cMeocPno";

export const supabase = createClient(url, key);

/** Use to check if Supabase is configured (for showing helpful errors). */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

