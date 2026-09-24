import { supabase } from "./supabaseClient";

export type GreenhouseRow = {
  id: string;
  code: string;
  name: string;
  location: string | null;
  status: "online" | "offline" | "maintenance";
  mode: "AUTO" | "MANUAL";
};

export type CropRow = {
  id: string;
  name: string;
  variety: string | null;
  growth_stage: string;
  planted_at: string;
  expected_harvest: string | null;
  health_status: string;
  estimated_yield_kg: number | null;
};

export type DeviceRow = {
  id: string;
  code: string;
  type: "controller" | "pump" | "fan" | "sensor_hub";
  name: string;
  is_online: boolean;
  last_heartbeat: string | null;
  power_status: string;
};

export type SensorRow = {
  id: string;
  type: "temperature" | "humidity" | "soil_moisture" | "light";
  code: string;
  is_online: boolean;
};

export type ReadingRow = {
  temperature: number;
  humidity: number;
  soil_moisture: number;
  created_at: string;
};

export type IrrigationEventRow = {
  id: number;
  started_at: string;
  ended_at: string | null;
  trigger: "auto" | "manual";
  estimated_litres: number | null;
};

export type VentilationEventRow = {
  id: number;
  started_at: string;
  ended_at: string | null;
  trigger: "auto" | "manual";
};

export type AutomationEventRow = {
  id: number;
  event_type: string;
  reason: string | null;
  occurred_at: string;
};

export type ActivityRow = {
  id: number;
  message: string;
  occurred_at: string;
};

export type GreenhouseAlertRow = {
  id: number;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "sensor" | "system" | "irrigation" | "climate" | "maintenance" | "analytics";
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
};

export type FarmSnapshot = {
  greenhouse: GreenhouseRow;
  crop: CropRow | null;
  devices: DeviceRow[];
  sensors: SensorRow[];
  latestReading: ReadingRow | null;
  readings: ReadingRow[];
  irrigating: boolean;
  ventilating: boolean;
  irrigationEvents: IrrigationEventRow[];
  ventilationEvents: VentilationEventRow[];
  automationEvents: AutomationEventRow[];
  activity: ActivityRow[];
  alerts: GreenhouseAlertRow[];
  waterUsedLitres: number;
};

const num = (value: unknown, fallback = 0) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export function daylightPar(at = new Date()): number {
  const h = at.getHours() + at.getMinutes() / 60;
  if (h < 6.2 || h > 18.8) return 0;
  const t = (h - 6.2) / (18.8 - 6.2);
  return Math.round(1050 * Math.sin(Math.PI * t));
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 45) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
  return d.toLocaleDateString();
}

export async function ensureOwnGreenhouse(): Promise<string | null> {
  const { data, error } = await supabase.rpc("ensure_own_greenhouse");
  if (error) return null;
  return (data as string | null) ?? null;
}

export async function registerOwnGreenhouse(input: {
  name: string;
  location?: string;
  cropName?: string;
}): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase.rpc("register_own_greenhouse", {
    p_name: input.name.trim(),
    p_location: input.location?.trim() || null,
    p_crop_name: input.cropName?.trim() || "Mixed greens",
  });
  if (error || !data) {
    const raw = error?.message ?? "Could not add greenhouse.";
    if (raw.includes("house_limit_reached")) {
      return { error: "This account already has the maximum of 10 greenhouses." };
    }
    if (raw.includes("name_required")) {
      return { error: "Enter a greenhouse name." };
    }
    if (raw.includes("admins_use_platform_view")) {
      return { error: "Admin accounts manage the platform list, not a personal house." };
    }
    return { error: raw };
  }
  return { id: data as string };
}

export async function recordLiveReading(
  greenhouseId: string,
  reading: { temperature: number; humidity: number; soil_moisture: number }
): Promise<void> {
  await supabase.rpc("record_live_reading", {
    p_greenhouse_id: greenhouseId,
    p_temperature: reading.temperature,
    p_humidity: reading.humidity,
    p_soil_moisture: reading.soil_moisture,
  });
}

function mapReading(row: {
  temperature: unknown;
  humidity: unknown;
  soil_moisture: unknown;
  created_at: string;
}): ReadingRow {
  return {
    temperature: num(row.temperature),
    humidity: num(row.humidity),
    soil_moisture: num(row.soil_moisture),
    created_at: row.created_at,
  };
}

export async function fetchHourlyReadings(greenhouseId: string): Promise<ReadingRow[]> {
  const { data, error } = await supabase.rpc("hourly_sensor_history", {
    p_greenhouse_id: greenhouseId,
    p_days: 7,
  });
  if (!error && data) {
    return (data as Array<Parameters<typeof mapReading>[0]>).map(mapReading);
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: rows } = await supabase
    .from("sensor_readings")
    .select("temperature, humidity, soil_moisture, created_at")
    .eq("greenhouse_id", greenhouseId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500);
  return downsampleHourly((rows ?? []).map(mapReading));
}

export async function fetchHourlyFleetReadings(): Promise<
  Array<ReadingRow & { greenhouse_id: string }>
> {
  const { data, error } = await supabase.rpc("hourly_sensor_history_fleet", { p_days: 7 });
  if (!error && data) {
    return (data as Array<Parameters<typeof mapReading>[0] & { greenhouse_id: string }>).map((row) => ({
      ...mapReading(row),
      greenhouse_id: row.greenhouse_id,
    }));
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: rows } = await supabase
    .from("sensor_readings")
    .select("greenhouse_id, temperature, humidity, soil_moisture, created_at")
    .not("greenhouse_id", "is", null)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(2000);
  const mapped = (rows ?? []).map((row) => ({
    ...mapReading(row),
    greenhouse_id: row.greenhouse_id as string,
  }));
  const byKey = new Map<string, (typeof mapped)[0]>();
  for (const row of mapped) {
    const hour = new Date(row.created_at);
    if (Number.isNaN(hour.getTime())) continue;
    hour.setMinutes(0, 0, 0);
    const key = `${row.greenhouse_id}:${hour.toISOString()}`;
    const prev = byKey.get(key);
    if (!prev || row.created_at > prev.created_at) byKey.set(key, row);
  }
  return [...byKey.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

function downsampleHourly(rows: ReadingRow[]): ReadingRow[] {
  const byHour = new Map<string, ReadingRow>();
  for (const row of rows) {
    const hour = new Date(row.created_at);
    if (Number.isNaN(hour.getTime())) continue;
    hour.setMinutes(0, 0, 0);
    const key = hour.toISOString();
    const prev = byHour.get(key);
    if (!prev || row.created_at > prev.created_at) byHour.set(key, row);
  }
  return [...byHour.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function fetchVisibleGreenhouses(): Promise<GreenhouseRow[]> {
  const { data, error } = await supabase
    .from("greenhouses")
    .select("id, code, name, location, status, mode")
    .order("code");

  if (error) return [];
  return (data ?? []) as GreenhouseRow[];
}

export async function fetchFarmSnapshot(greenhouseId: string): Promise<FarmSnapshot | null> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    ghRes,
    cropRes,
    deviceRes,
    sensorRes,
    latestRes,
    readingsRes,
    irrigOpenRes,
    ventOpenRes,
    irrigHistRes,
    ventHistRes,
    autoRes,
    activityRes,
    alertsRes,
  ] = await Promise.all([
    supabase
      .from("greenhouses")
      .select("id, code, name, location, status, mode")
      .eq("id", greenhouseId)
      .maybeSingle(),
    supabase.from("crops").select("*").eq("greenhouse_id", greenhouseId).limit(1).maybeSingle(),
    supabase.from("devices").select("*").eq("greenhouse_id", greenhouseId),
    supabase.from("sensors").select("id, type, code, is_online").eq("greenhouse_id", greenhouseId),
    supabase
      .from("sensor_readings")
      .select("temperature, humidity, soil_moisture, created_at")
      .eq("greenhouse_id", greenhouseId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    fetchHourlyReadings(greenhouseId),
    supabase
      .from("irrigation_events")
      .select("id")
      .eq("greenhouse_id", greenhouseId)
      .is("ended_at", null)
      .limit(1),
    supabase
      .from("ventilation_events")
      .select("id")
      .eq("greenhouse_id", greenhouseId)
      .is("ended_at", null)
      .limit(1),
    supabase
      .from("irrigation_events")
      .select("id, started_at, ended_at, trigger, estimated_litres")
      .eq("greenhouse_id", greenhouseId)
      .gte("started_at", since)
      .order("started_at", { ascending: false })
      .limit(40),
    supabase
      .from("ventilation_events")
      .select("id, started_at, ended_at, trigger")
      .eq("greenhouse_id", greenhouseId)
      .gte("started_at", since)
      .order("started_at", { ascending: false })
      .limit(40),
    supabase
      .from("automation_events")
      .select("id, event_type, reason, occurred_at")
      .eq("greenhouse_id", greenhouseId)
      .order("occurred_at", { ascending: false })
      .limit(40),
    supabase
      .from("activity_logs")
      .select("id, message, occurred_at")
      .eq("greenhouse_id", greenhouseId)
      .order("occurred_at", { ascending: false })
      .limit(40),
    supabase
      .from("alerts")
      .select("id, title, description, severity, category, is_read, is_resolved, created_at")
      .eq("greenhouse_id", greenhouseId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (ghRes.error || !ghRes.data) return null;

  const irrigationEvents = (irrigHistRes.data ?? []).map((row) => ({
    id: row.id,
    started_at: row.started_at,
    ended_at: row.ended_at,
    trigger: row.trigger,
    estimated_litres: row.estimated_litres == null ? null : num(row.estimated_litres),
  })) as IrrigationEventRow[];

  const readings = readingsRes;

  const latest = latestRes.data
    ? {
        temperature: num(latestRes.data.temperature),
        humidity: num(latestRes.data.humidity),
        soil_moisture: num(latestRes.data.soil_moisture),
        created_at: latestRes.data.created_at,
      }
    : null;

  return {
    greenhouse: ghRes.data as GreenhouseRow,
    crop: cropRes.data
      ? {
          ...cropRes.data,
          estimated_yield_kg:
            cropRes.data.estimated_yield_kg == null ? null : num(cropRes.data.estimated_yield_kg),
        }
      : null,
    devices: (deviceRes.data ?? []) as DeviceRow[],
    sensors: (sensorRes.data ?? []) as SensorRow[],
    latestReading: latest,
    readings,
    irrigating: (irrigOpenRes.data ?? []).length > 0,
    ventilating: (ventOpenRes.data ?? []).length > 0,
    irrigationEvents,
    ventilationEvents: (ventHistRes.data ?? []) as VentilationEventRow[],
    automationEvents: (autoRes.data ?? []) as AutomationEventRow[],
    activity: (activityRes.data ?? []) as ActivityRow[],
    alerts: (alertsRes.data ?? []) as GreenhouseAlertRow[],
    waterUsedLitres: irrigationEvents.reduce((sum, ev) => sum + (ev.estimated_litres ?? 0), 0),
  };
}
