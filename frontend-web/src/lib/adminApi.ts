import { supabase } from "./supabaseClient";
import { formatRelativeTime } from "./farmApi";
import { fetchHourlyFleetReadings, type IrrigationEventRow, type ReadingRow } from "./farmApi";
import { computeBenefitMetrics, emptyBenefits, type BenefitMetrics } from "./benefitMetrics";

export type AdminProfile = {
  id: string;
  role: "farmer" | "admin";
  full_name: string;
  email: string | null;
  location: string | null;
  status: string;
  last_seen_at: string | null;
  created_at: string;
};

export type AdminMetrics = {
  totalFarmers: number;
  activeFarmers: number;
  offlineFarmers: number;
  totalGreenhouses: number;
  onlineGreenhouses: number;
  offlineGreenhouses: number;
  connectedDevices: number;
  offlineDevices: number;
  activeAlerts: number;
  irrigationActive: number;
  ventilationActive: number;
  activity24h: number;
};

export type AdminFarmerRow = {
  id: string;
  name: string;
  location: string;
  status: string;
  greenhouseCode: string;
  greenhouseName: string;
  cropName: string;
  devicesOnline: number;
  devicesTotal: number;
  lastActivity: string;
  registeredAt: string;
};

export type AdminGreenhouseRow = {
  id: string;
  code: string;
  name: string;
  ownerName: string;
  location: string;
  cropName: string;
  temp: number | null;
  humidity: number | null;
  soil: number | null;
  devicesOnline: number;
  devicesTotal: number;
  mode: string;
  status: string;
  irrigating: boolean;
  ventilating: boolean;
  lastActivity: string;
};

export type AdminDeviceRow = {
  id: string;
  code: string;
  type: string;
  name: string;
  greenhouseCode: string;
  greenhouseName: string;
  isOnline: boolean;
  lastHeartbeat: string;
  powerStatus: string;
  sensorHealth: string;
};

export type AdminAlertRow = {
  id: number;
  title: string;
  description: string;
  greenhouseCode: string;
  farmerName: string;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  isResolved: boolean;
};

export type AdminActivityRow = {
  id: number;
  message: string;
  greenhouseCode: string;
  occurredAt: string;
};

export type AdminPlatform = {
  metrics: AdminMetrics;
  farmers: AdminFarmerRow[];
  greenhouses: AdminGreenhouseRow[];
  devices: AdminDeviceRow[];
  alerts: AdminAlertRow[];
  activity: AdminActivityRow[];
  benefits: BenefitMetrics;
};

const num = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

export async function fetchCurrentProfile(): Promise<AdminProfile | null> {
  const { data: sessionData } = await supabase.auth.getUser();
  if (!sessionData.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, location, status, last_seen_at, created_at")
    .eq("auth_user_id", sessionData.user.id)
    .maybeSingle();
  if (error || !data) return null;
  void supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString(), status: "active" })
    .eq("auth_user_id", sessionData.user.id);
  return data as AdminProfile;
}

export async function fetchAdminPlatform(): Promise<AdminPlatform> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    profilesRes,
    ghRes,
    cropRes,
    deviceRes,
    sensorRes,
    alertRes,
    activityRes,
    irrigRes,
    ventRes,
    fleetReadings,
    irrigHistRes,
    ventHistRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, role, full_name, email, location, status, last_seen_at, created_at")
      .eq("role", "farmer")
      .order("full_name"),
    supabase
      .from("greenhouses")
      .select("id, code, name, location, status, mode, owner_id, created_at")
      .order("code"),
    supabase.from("crops").select("greenhouse_id, name, health_status, estimated_yield_kg, growth_stage"),
    supabase.from("devices").select("id, greenhouse_id, code, type, name, is_online, last_heartbeat, power_status"),
    supabase.from("sensors").select("id, device_id, greenhouse_id, code, type, is_online"),
    supabase
      .from("alerts")
      .select("id, title, description, severity, is_resolved, created_at, greenhouse_id")
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("activity_logs")
      .select("id, message, occurred_at, greenhouse_id")
      .order("occurred_at", { ascending: false })
      .limit(80),
    supabase
      .from("irrigation_events")
      .select("id, greenhouse_id, ended_at, started_at")
      .is("ended_at", null),
    supabase
      .from("ventilation_events")
      .select("id, greenhouse_id, ended_at")
      .is("ended_at", null),
    fetchHourlyFleetReadings(),
    supabase
      .from("irrigation_events")
      .select("id, started_at, ended_at, trigger, estimated_litres")
      .gte("started_at", since7d)
      .order("started_at", { ascending: false })
      .limit(200),
    supabase
      .from("ventilation_events")
      .select("id, started_at, ended_at, trigger")
      .gte("started_at", since7d)
      .order("started_at", { ascending: false })
      .limit(200),
  ]);

  const farmers = (profilesRes.data ?? []) as AdminProfile[];
  const houses = ghRes.data ?? [];
  const crops = cropRes.data ?? [];
  const devices = deviceRes.data ?? [];
  const sensors = sensorRes.data ?? [];
  const alerts = alertRes.data ?? [];
  const activity = activityRes.data ?? [];
  const irrigating = new Set((irrigRes.data ?? []).map((r) => r.greenhouse_id as string));
  const ventilating = new Set((ventRes.data ?? []).map((r) => r.greenhouse_id as string));

  const houseById = new Map(houses.map((h) => [h.id as string, h]));
  const farmerById = new Map(farmers.map((f) => [f.id, f]));
  const cropByGh = new Map(crops.map((c) => [c.greenhouse_id as string, c]));
  const housesByOwner = new Map<string, typeof houses>();
  for (const h of houses) {
    const ownerId = h.owner_id as string;
    const list = housesByOwner.get(ownerId) ?? [];
    list.push(h);
    housesByOwner.set(ownerId, list);
  }

  const latestReading = new Map<string, { temperature: number | null; humidity: number | null; soil: number | null }>();
  for (const row of fleetReadings) {
    const id = row.greenhouse_id;
    if (!id) continue;
    latestReading.set(id, {
      temperature: row.temperature,
      humidity: row.humidity,
      soil: row.soil_moisture,
    });
  }

  const lastActivityByGh = new Map<string, string>();
  for (const row of activity) {
    const id = row.greenhouse_id as string | null;
    if (!id || lastActivityByGh.has(id)) continue;
    lastActivityByGh.set(id, row.occurred_at);
  }

  const devicesByGh = new Map<string, typeof devices>();
  for (const d of devices) {
    const id = d.greenhouse_id as string;
    const list = devicesByGh.get(id) ?? [];
    list.push(d);
    devicesByGh.set(id, list);
  }

  const sensorsByDevice = new Map<string, typeof sensors>();
  for (const s of sensors) {
    const id = s.device_id as string;
    const list = sensorsByDevice.get(id) ?? [];
    list.push(s);
    sensorsByDevice.set(id, list);
  }

  const farmerRows: AdminFarmerRow[] = farmers.map((f) => {
    const owned = housesByOwner.get(f.id) ?? [];
    const ghDevices = owned.flatMap((house) => devicesByGh.get(house.id) ?? []);
    const cropNames = [...new Set(owned.map((house) => cropByGh.get(house.id)?.name).filter(Boolean))];
    return {
      id: f.id,
      name: f.full_name,
      location: f.location ?? "—",
      status: f.status,
      greenhouseCode: owned.map((house) => house.code).join(", ") || "—",
      greenhouseName: owned.length > 1 ? `${owned.length} houses` : owned[0]?.name ?? "—",
      cropName: cropNames.join(", ") || "—",
      devicesOnline: ghDevices.filter((d) => d.is_online).length,
      devicesTotal: ghDevices.length,
      lastActivity: formatRelativeTime(f.last_seen_at),
      registeredAt: f.created_at,
    };
  });

  const greenhouseRows: AdminGreenhouseRow[] = houses.map((h) => {
    const owner = farmerById.get(h.owner_id as string);
    const reading = latestReading.get(h.id);
    const ghDevices = devicesByGh.get(h.id) ?? [];
    return {
      id: h.id,
      code: h.code,
      name: h.name,
      ownerName: owner?.full_name ?? "—",
      location: h.location ?? "—",
      cropName: cropByGh.get(h.id)?.name ?? "—",
      temp: reading?.temperature ?? null,
      humidity: reading?.humidity ?? null,
      soil: reading?.soil ?? null,
      devicesOnline: ghDevices.filter((d) => d.is_online).length,
      devicesTotal: ghDevices.length,
      mode: h.mode,
      status: h.status,
      irrigating: irrigating.has(h.id),
      ventilating: ventilating.has(h.id),
      lastActivity: formatRelativeTime(lastActivityByGh.get(h.id) ?? null),
    };
  });

  const deviceRows: AdminDeviceRow[] = devices.map((d) => {
    const house = houseById.get(d.greenhouse_id as string);
    const probes = sensorsByDevice.get(d.id) ?? [];
    const sensorHealth =
      d.type === "sensor_hub"
        ? probes.length > 0
          ? `${probes.filter((s) => s.is_online).length}/${probes.length} probes`
          : "No probes"
        : "—";
    return {
      id: d.id,
      code: d.code,
      type: d.type,
      name: d.name,
      greenhouseCode: house?.code ?? "—",
      greenhouseName: house?.name ?? "—",
      isOnline: !!d.is_online,
      lastHeartbeat: formatRelativeTime(d.last_heartbeat),
      powerStatus: d.power_status ?? "—",
      sensorHealth,
    };
  });

  const alertRows: AdminAlertRow[] = alerts.map((a) => {
    const house = houseById.get(a.greenhouse_id as string);
    const owner = house ? farmerById.get(house.owner_id as string) : undefined;
    return {
      id: a.id,
      title: a.title,
      description: a.description ?? "",
      greenhouseCode: house?.code ?? "—",
      farmerName: owner?.full_name ?? "—",
      severity: a.severity,
      createdAt: a.created_at,
      isResolved: !!a.is_resolved,
    };
  });

  const activityRows: AdminActivityRow[] = activity.map((row) => {
    const house = houseById.get(row.greenhouse_id as string);
    return {
      id: row.id,
      message: row.message,
      greenhouseCode: house?.code ?? "—",
      occurredAt: row.occurred_at,
    };
  });

  const activity24h = activity.filter((row) => row.occurred_at && row.occurred_at >= since24h).length;

  const historyReadings: ReadingRow[] = fleetReadings;
  const irrigationHistory = (irrigHistRes.data ?? []) as IrrigationEventRow[];
  const benefits = houses.length
    ? computeBenefitMetrics({
        readings: historyReadings,
        irrigationEvents: irrigationHistory,
        ventilationEvents: ventHistRes.data ?? [],
        automationEvents: [],
        devices: devices as { id: string; code: string; type: "controller" | "pump" | "fan" | "sensor_hub"; name: string; is_online: boolean; last_heartbeat: string | null; power_status: string }[],
        crop: null,
        greenhouseStatus:
          houses.filter((h) => h.status === "online").length >= houses.length / 2 ? "online" : "offline",
        houseCount: houses.length,
      })
    : emptyBenefits();

  const yieldSum = crops.reduce((sum, c) => {
    const stored = c.estimated_yield_kg == null ? null : num(c.estimated_yield_kg);
    if (stored == null) return sum;
    return sum + stored * (0.82 + 0.18 * (benefits.cropPerformance / 100));
  }, 0);
  if (yieldSum > 0) benefits.yieldKg = Math.round(yieldSum * 10) / 10;

  return {
    metrics: {
      totalFarmers: farmers.length,
      activeFarmers: farmers.filter((f) => f.status === "active").length,
      offlineFarmers: farmers.filter((f) => f.status !== "active").length,
      totalGreenhouses: houses.length,
      onlineGreenhouses: houses.filter((h) => h.status === "online").length,
      offlineGreenhouses: houses.filter((h) => h.status !== "online").length,
      connectedDevices: devices.filter((d) => d.is_online).length,
      offlineDevices: devices.filter((d) => !d.is_online).length,
      activeAlerts: alerts.filter((a) => !a.is_resolved).length,
      irrigationActive: irrigating.size,
      ventilationActive: ventilating.size,
      activity24h,
    },
    farmers: farmerRows,
    greenhouses: greenhouseRows,
    devices: deviceRows,
    alerts: alertRows,
    activity: activityRows,
    benefits,
  };
}
