import type {
  AutomationEventRow,
  CropRow,
  DeviceRow,
  IrrigationEventRow,
  ReadingRow,
} from "./farmApi";

export type VentilationSpan = {
  started_at: string;
  ended_at: string | null;
  trigger?: "auto" | "manual";
};

export type BenefitInput = {
  readings: ReadingRow[];
  irrigationEvents: IrrigationEventRow[];
  ventilationEvents: VentilationSpan[];
  automationEvents: AutomationEventRow[];
  devices: DeviceRow[];
  crop: CropRow | null;
  greenhouseStatus: string;
  houseCount?: number;
};

export type BenefitMetrics = {
  windowDays: number;
  smartWaterLitres: number;
  conventionalWaterLitres: number;
  waterSavedLitres: number;
  waterSavedPct: number;
  irrigationCount: number;
  irrigationPerDay: number;
  autoSharePct: number;
  automationEfficiency: number;
  yieldKg: number | null;
  cropPerformance: number;
  uptimePct: number;
  resourceUtilization: number;
  environmentalStability: number;
  inRangePct: number;
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

function minutesBetween(start: string, end: string | null) {
  const from = new Date(start).getTime();
  const to = end ? new Date(end).getTime() : Date.now();
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return 0;
  return (to - from) / 60_000;
}

function stddev(values: number[]) {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function eventLitres(ev: IrrigationEventRow) {
  if (ev.estimated_litres != null && ev.estimated_litres > 0) return ev.estimated_litres;
  const mins = minutesBetween(ev.started_at, ev.ended_at);
  return mins > 0 ? Math.max(8, mins * 1.4) : 0;
}

function inferLitresFromSoil(readings: ReadingRow[]) {
  let litres = 0;
  let pulses = 0;
  for (let i = 1; i < readings.length; i++) {
    const delta = readings[i].soil_moisture - readings[i - 1].soil_moisture;
    if (delta >= 8) {
      pulses += 1;
      litres += delta * 1.8;
    }
  }
  return { litres, pulses };
}

function inRange(reading: ReadingRow) {
  return (
    reading.temperature >= 18 &&
    reading.temperature <= 30 &&
    reading.humidity >= 40 &&
    reading.humidity <= 75 &&
    reading.soil_moisture >= 35 &&
    reading.soil_moisture <= 80
  );
}

function cropBaseScore(crop: CropRow | null) {
  if (!crop) return 40;
  if (crop.health_status === "healthy") return 82;
  if (crop.health_status === "stressed") return 48;
  return 28;
}

function stageFactor(stage: string | undefined) {
  switch (stage) {
    case "harvest":
      return 1.05;
    case "fruiting":
      return 1;
    case "flowering":
      return 0.72;
    case "vegetative":
      return 0.45;
    default:
      return 0.6;
  }
}

const ZERO_BENEFITS: BenefitMetrics = {
  windowDays: 7,
  smartWaterLitres: 0,
  conventionalWaterLitres: 0,
  waterSavedLitres: 0,
  waterSavedPct: 0,
  irrigationCount: 0,
  irrigationPerDay: 0,
  autoSharePct: 0,
  automationEfficiency: 0,
  yieldKg: null,
  cropPerformance: 0,
  uptimePct: 0,
  resourceUtilization: 0,
  environmentalStability: 0,
  inRangePct: 0,
};

export function emptyBenefits(): BenefitMetrics {
  return { ...ZERO_BENEFITS };
}

export function computeBenefitMetrics(input: BenefitInput): BenefitMetrics {
  if (input.readings.length === 0 && input.irrigationEvents.length === 0) {
    return emptyBenefits();
  }
  const readings = [...input.readings].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const irrigations = input.irrigationEvents;
  const vents = input.ventilationEvents;

  let windowDays = 7;
  if (readings.length >= 2) {
    const span =
      (new Date(readings[readings.length - 1].created_at).getTime() -
        new Date(readings[0].created_at).getTime()) /
      86_400_000;
    windowDays = Math.max(1, Math.min(7, span));
  }

  const loggedLitres = irrigations.reduce((sum, ev) => sum + eventLitres(ev), 0);
  const inferred = inferLitresFromSoil(readings);
  const smartWaterLitres = loggedLitres > 0 ? loggedLitres : inferred.litres;
  const irrigationCount = irrigations.length > 0 ? irrigations.length : inferred.pulses;

  const avgCycle =
    irrigationCount > 0 && smartWaterLitres > 0
      ? smartWaterLitres / irrigationCount
      : inferred.pulses > 0
        ? inferred.litres / inferred.pulses
        : 42;
  const houseCount = Math.max(1, input.houseCount ?? 1);
  const conventionalWaterLitres = Math.max(smartWaterLitres, windowDays * 2 * avgCycle * houseCount);
  const waterSavedLitres = Math.max(0, conventionalWaterLitres - smartWaterLitres);
  const waterSavedPct =
    conventionalWaterLitres > 0 ? (waterSavedLitres / conventionalWaterLitres) * 100 : 0;

  const autoIrrig = irrigations.filter((e) => e.trigger === "auto").length;
  const autoVent = vents.filter((e) => e.trigger === "auto").length;
  const autoAutomation = input.automationEvents.filter((e) =>
    /started|opened|auto/i.test(e.event_type)
  ).length;
  const totalActuation = irrigations.length + vents.length;
  const autoSharePct =
    totalActuation > 0
      ? ((autoIrrig + autoVent) / totalActuation) * 100
      : input.automationEvents.length > 0
        ? clamp((autoAutomation / input.automationEvents.length) * 100)
        : 0;

  const inRangePct =
    readings.length > 0 ? (readings.filter(inRange).length / readings.length) * 100 : 0;
  const tempCv = readings.length > 1 ? stddev(readings.map((r) => r.temperature)) : 0;
  const environmentalStability = clamp(inRangePct * (1 - Math.min(tempCv / 12, 0.35)));

  const automationEfficiency = clamp(
    totalActuation + input.automationEvents.length > 0
      ? autoSharePct * 0.55 + inRangePct * 0.45
      : inRangePct
  );

  const devicePct =
    input.devices.length > 0
      ? (input.devices.filter((d) => d.is_online).length / input.devices.length) * 100
      : 0;
  const expectedHours = windowDays * 24;
  const readingCoverage = clamp((readings.length / Math.max(expectedHours, 1)) * 100);
  const uptimePct =
    input.greenhouseStatus !== "online"
      ? clamp(Math.min(readingCoverage, 22))
      : clamp(readingCoverage * 0.65 + devicePct * 0.35);

  const windowMinutes = windowDays * 24 * 60;
  const irrigMinutes = irrigations.reduce((sum, ev) => sum + minutesBetween(ev.started_at, ev.ended_at), 0);
  const ventMinutes = vents.reduce((sum, ev) => sum + minutesBetween(ev.started_at, ev.ended_at), 0);
  const actuatorLoad = windowMinutes > 0 ? ((irrigMinutes + ventMinutes) / (2 * windowMinutes)) * 100 : 0;
  const resourceUtilization = clamp(inRangePct * 0.5 + devicePct * 0.25 + (100 - Math.min(actuatorLoad, 80)) * 0.25);

  const cropPerformance = clamp(cropBaseScore(input.crop) * 0.7 + inRangePct * 0.3);
  const storedYield = input.crop?.estimated_yield_kg ?? null;
  const yieldKg =
    storedYield != null
      ? Math.round(storedYield * (0.82 + 0.18 * (cropPerformance / 100)) * 10) / 10
      : input.crop
        ? Math.round(48 * stageFactor(input.crop.growth_stage) * (cropPerformance / 100) * 10) / 10
        : null;

  return {
    windowDays: Math.round(windowDays * 10) / 10,
    smartWaterLitres: Math.round(smartWaterLitres * 10) / 10,
    conventionalWaterLitres: Math.round(conventionalWaterLitres * 10) / 10,
    waterSavedLitres: Math.round(waterSavedLitres * 10) / 10,
    waterSavedPct: Math.round(waterSavedPct * 10) / 10,
    irrigationCount,
    irrigationPerDay: Math.round((irrigationCount / windowDays) * 100) / 100,
    autoSharePct: Math.round(autoSharePct * 10) / 10,
    automationEfficiency: Math.round(automationEfficiency),
    yieldKg,
    cropPerformance: Math.round(cropPerformance),
    uptimePct: Math.round(uptimePct),
    resourceUtilization: Math.round(resourceUtilization),
    environmentalStability: Math.round(environmentalStability),
    inRangePct: Math.round(inRangePct),
  };
}

