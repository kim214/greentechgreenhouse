/**
 * Advanced greenhouse analytics engine.
 * Computes plant health, irrigation need, climate risk, VPD, trends, and recommendations.
 */

export interface SensorInput {
  temp: number;
  humidity: number;
  soilMoisture: number;
}

export interface AnalyticsResult {
  plantHealthScore: number;
  irrigationNeedScore: number;
  climateRiskScore: number;
  vpd: number; // Vapor Pressure Deficit (kPa)
  vpdStatus: "optimal" | "low" | "high" | "extreme";
  recommendations: string[];
  summary: string;
  trend: "improving" | "stable" | "declining" | "unknown";
  metrics: {
    tempStatus: "optimal" | "warm" | "hot" | "cool" | "cold";
    humidityStatus: "optimal" | "dry" | "humid" | "very_humid";
    soilStatus: "optimal" | "low" | "very_low" | "high" | "very_high";
    dewPoint: number; // °C
    heatIndex: number; // °C (feels-like for plants)
  };
}

// Optimal ranges for greenhouse (tunable)
const OPTIMAL = {
  tempMin: 18,
  tempMax: 28,
  tempIdeal: [22, 26],
  humidityMin: 40,
  humidityMax: 70,
  humidityIdeal: [50, 65],
  soilMin: 45,
  soilMax: 85,
  soilIdeal: [55, 75],
  vpdMin: 0.4,
  vpdMax: 1.2,
  vpdIdeal: [0.6, 1.0],
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Saturation vapor pressure (Tetens formula) in kPa */
function saturationVaporPressure(tempC: number): number {
  return 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/** Actual vapor pressure from humidity */
function actualVaporPressure(tempC: number, humidityPercent: number): number {
  return (humidityPercent / 100) * saturationVaporPressure(tempC);
}

/** VPD = Vapor Pressure Deficit (kPa) - drives transpiration */
export function computeVPD(tempC: number, humidityPercent: number): number {
  const svp = saturationVaporPressure(tempC);
  const avp = actualVaporPressure(tempC, humidityPercent);
  return clamp(svp - avp, 0, 5);
}

/** Dew point approximation (°C) */
function dewPoint(tempC: number, humidityPercent: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidityPercent / 100);
  return (b * alpha) / (a - alpha);
}

/** Simplified heat index for greenhouse (humidity + temp effect) */
function heatIndex(tempC: number, humidityPercent: number): number {
  if (tempC < 20) return tempC;
  return tempC + (humidityPercent - 50) * 0.02;
}

/** Plant Health Index: 0-100 */
function computePlantHealth(temp: number, humidity: number, soil: number, vpd: number): number {
  let score = 100;
  if (soil < 20) score -= 50;
  else if (soil < 35) score -= 30;
  else if (soil < 45) score -= 15;
  else if (soil > 95) score -= 20;
  if (temp < 10 || temp > 35) score -= 25;
  else if (temp < 15 || temp > 30) score -= 15;
  else if (temp < OPTIMAL.tempMin || temp > OPTIMAL.tempMax) score -= 5;
  if (humidity > 85 || humidity < 25) score -= 15;
  else if (humidity > 75 || humidity < 35) score -= 8;
  if (vpd < 0.2 || vpd > 1.8) score -= 10;
  else if (vpd < 0.4 || vpd > 1.4) score -= 5;
  return clamp(score, 0, 100);
}

/** Irrigation need: 0-100 */
function computeIrrigationNeed(soil: number): number {
  if (soil >= 60) return 0;
  if (soil >= 45) return 15;
  if (soil >= 35) return 40;
  if (soil >= 25) return 70;
  return 95;
}

/** Climate risk: 0-100 */
function computeClimateRisk(temp: number, humidity: number): number {
  let risk = 0;
  if (temp > 32 || temp < 12) risk += 40;
  else if (temp > 28 || temp < 16) risk += 20;
  if (humidity > 80) risk += 35;
  else if (humidity > 70) risk += 15;
  if (humidity < 30 && temp > 25) risk += 20;
  return clamp(risk, 0, 100);
}

function getVPDStatus(vpd: number): AnalyticsResult["vpdStatus"] {
  if (vpd >= OPTIMAL.vpdIdeal[0] && vpd <= OPTIMAL.vpdIdeal[1]) return "optimal";
  if (vpd < 0.3) return "extreme";
  if (vpd < OPTIMAL.vpdMin) return "low";
  if (vpd > OPTIMAL.vpdMax) return vpd > 1.6 ? "extreme" : "high";
  return "optimal";
}

function getTempStatus(temp: number): AnalyticsResult["metrics"]["tempStatus"] {
  if (temp >= 18 && temp <= 28) return "optimal";
  if (temp > 30) return "hot";
  if (temp > 28) return "warm";
  if (temp < 16) return "cold";
  return "cool";
}

function getHumidityStatus(humidity: number): AnalyticsResult["metrics"]["humidityStatus"] {
  if (humidity >= 45 && humidity <= 70) return "optimal";
  if (humidity > 80) return "very_humid";
  if (humidity > 70) return "humid";
  if (humidity < 35) return "dry";
  return "optimal";
}

function getSoilStatus(soil: number): AnalyticsResult["metrics"]["soilStatus"] {
  if (soil >= 50 && soil <= 80) return "optimal";
  if (soil < 25) return "very_low";
  if (soil < 45) return "low";
  if (soil > 90) return "very_high";
  return "high";
}

/** Generate recommendations */
function getRecommendations(
  temp: number,
  humidity: number,
  soil: number,
  vpd: number,
  vpdStatus: string
): string[] {
  const recs: string[] = [];
  if (soil < 35) {
    recs.push("Increase irrigation: soil moisture is low. Turn on the pump or water manually.");
  } else if (soil < 45) {
    recs.push("Monitor soil moisture; consider a short irrigation cycle soon.");
  } else if (soil > 90) {
    recs.push("Soil is very wet; avoid overwatering to prevent root rot.");
  }
  if (temp > 30) {
    recs.push("High temperature. Ensure ventilation is on and consider shading.");
  } else if (temp > 28) {
    recs.push("Temperature rising; increase ventilation to keep plants comfortable.");
  } else if (temp < 16) {
    recs.push("Low temperature; check heating or reduce ventilation to retain warmth.");
  }
  if (humidity > 75) {
    recs.push("High humidity increases disease risk. Improve air circulation.");
  } else if (humidity < 40 && temp > 22) {
    recs.push("Low humidity; misting or humidifier can help in dry heat.");
  }
  if (vpdStatus === "low") {
    recs.push("VPD is low (high humidity + temp); reduce misting or increase ventilation.");
  } else if (vpdStatus === "high" || vpdStatus === "extreme") {
    recs.push("VPD is high (dry air); consider misting or increasing humidity.");
  }
  if (recs.length === 0) {
    recs.push("Conditions are within optimal ranges. Keep monitoring.");
  }
  return recs;
}

function getSummary(health: number, risk: number): string {
  if (health >= 80 && risk < 25) return "Greenhouse conditions are excellent. Plants are in good health.";
  if (health >= 60) return "Greenhouse is in good shape with minor adjustments possible.";
  if (health >= 40) return "Some stress factors detected. Review recommendations below.";
  return "Conditions need attention. Follow recommendations to improve plant health.";
}

/** Compute trend from recent snapshots (compare latest vs older) */
export function computeTrend(
  snapshots: Array<{ plant_health_score: number; created_at?: string }>
): AnalyticsResult["trend"] {
  if (snapshots.length < 5) return "unknown";
  const recent = snapshots.slice(0, 5).map((s) => s.plant_health_score);
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const older = snapshots.slice(5, 10);
  if (older.length < 3) return "stable";
  const avgOlder = older.reduce((a, b) => a + b.plant_health_score, 0) / older.length;
  const diff = avgRecent - avgOlder;
  if (diff > 5) return "improving";
  if (diff < -5) return "declining";
  return "stable";
}

export function computeAnalytics(
  input: SensorInput,
  recentSnapshots?: Array<{ plant_health_score: number; created_at?: string }>
): AnalyticsResult {
  const { temp, humidity, soilMoisture } = input;
  const vpd = computeVPD(temp, humidity);
  const vpdStatus = getVPDStatus(vpd);
  const plantHealthScore = computePlantHealth(temp, humidity, soilMoisture, vpd);
  const irrigationNeedScore = computeIrrigationNeed(soilMoisture);
  const climateRiskScore = computeClimateRisk(temp, humidity);
  const recommendations = getRecommendations(temp, humidity, soilMoisture, vpd, vpdStatus);
  const summary = getSummary(plantHealthScore, climateRiskScore);
  const trend = recentSnapshots ? computeTrend(recentSnapshots) : "unknown";

  return {
    plantHealthScore,
    irrigationNeedScore,
    climateRiskScore,
    vpd: Math.round(vpd * 1000) / 1000,
    vpdStatus,
    recommendations,
    summary,
    trend,
    metrics: {
      tempStatus: getTempStatus(temp),
      humidityStatus: getHumidityStatus(humidity),
      soilStatus: getSoilStatus(soilMoisture),
      dewPoint: Math.round(dewPoint(temp, humidity) * 10) / 10,
      heatIndex: Math.round(heatIndex(temp, humidity) * 10) / 10,
    },
  };
}
