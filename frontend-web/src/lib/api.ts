import { supabase } from "./supabaseClient";

/**
 * Legacy PHP API configuration (no longer used after Supabase migration).
 * Kept exported for backwards compatibility in case other code still imports it.
 */
export const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://localhost/greentech-api";

export const API_ENDPOINTS = {
  login: `${API_BASE}/login.php`,
  signup: `${API_BASE}/signup.php`,
  analytics: `${API_BASE}/analytics.php`,
  alerts: `${API_BASE}/alerts.php`,
  sensorReadings: `${API_BASE}/sensor_readings.php`,
} as const;

/** Get current user id from localStorage (Supabase auth user UUID, set after login). */
export function getUserId(): string | null {
  return localStorage.getItem("userId");
}

// --- Analytics API ---
export interface AnalyticsSnapshot {
  id?: number;
  user_id: string;
  plant_health_score: number;
  irrigation_need_score: number;
  climate_risk_score: number;
  recommendations: string[];
  snapshot?: { temp?: number; humidity?: number; soil_moisture?: number };
  created_at?: string;
}

export async function fetchAnalytics(userId: string, limit = 50): Promise<AnalyticsSnapshot[]> {
  const { data, error } = await supabase
    .from("analytics")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    plant_health_score: row.plant_health_score,
    irrigation_need_score: row.irrigation_need_score,
    climate_risk_score: row.climate_risk_score,
    recommendations: row.recommendations ?? [],
    snapshot: row.snapshot ?? {},
    created_at: row.created_at,
  }));
}

export async function saveAnalytics(payload: Omit<AnalyticsSnapshot, "id" | "created_at">): Promise<{ id: number }> {
  const { data, error } = await supabase
    .from("analytics")
    .insert({
      user_id: payload.user_id,
      plant_health_score: payload.plant_health_score,
      irrigation_need_score: payload.irrigation_need_score,
      climate_risk_score: payload.climate_risk_score,
      recommendations: payload.recommendations ?? [],
      snapshot: payload.snapshot ?? {},
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id };
}

// --- Alerts API ---
export interface AlertRecord {
  id: number;
  user_id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "sensor" | "system" | "irrigation" | "climate" | "maintenance" | "analytics";
  isRead: boolean;
  isResolved: boolean;
  created_at: string;
}

export async function fetchAlerts(userId: string, resolved?: boolean, limit = 50): Promise<AlertRecord[]> {
  let query = supabase
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (resolved === false) {
    query = query.eq("is_resolved", false);
  } else if (resolved === true) {
    query = query.eq("is_resolved", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const list = data ?? [];
  return list.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    severity: row.severity,
    category: row.category,
    isRead: row.is_read,
    isResolved: row.is_resolved,
    created_at: row.created_at,
  }));
}

export async function createAlert(
  userId: string,
  alert: { title: string; description?: string; severity?: AlertRecord["severity"]; category?: AlertRecord["category"] }
): Promise<{ id: number }> {
  const { data, error } = await supabase
    .from("alerts")
    .insert({
      user_id: userId,
      title: alert.title,
      description: alert.description ?? "",
      severity: alert.severity ?? "medium",
      category: alert.category ?? "sensor",
      is_read: false,
      is_resolved: false,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id };
}

export async function updateAlert(
  userId: string,
  id: number,
  updates: { is_read?: boolean; is_resolved?: boolean }
): Promise<void> {
  const { error } = await supabase
    .from("alerts")
    .update({
      ...(updates.is_read !== undefined ? { is_read: updates.is_read } : {}),
      ...(updates.is_resolved !== undefined ? { is_resolved: updates.is_resolved } : {}),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

// --- Sensor readings (optional logging) ---
export async function logSensorReading(
  userId: string,
  reading: { temperature: number; humidity: number; soil_moisture: number }
): Promise<void> {
  const { error } = await supabase.from("sensor_readings").insert({
    user_id: userId,
    temperature: reading.temperature,
    humidity: reading.humidity,
    soil_moisture: reading.soil_moisture,
  });

  if (error) throw new Error(error.message);
}
