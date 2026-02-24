import { useState, useEffect, useRef } from "react";
import { fetchAnalytics } from "@/lib/api";
import { getUserId } from "@/lib/api";

export interface DataPoint {
  time: string; // ISO
  temp: number;
  humidity: number;
  soilMoisture: number;
  plantHealth?: number;
  irrigationNeed?: number;
  climateRisk?: number;
}

const LIVE_INTERVAL_MS = 15_000; // push live point every 15s
const MAX_LIVE_POINTS = 40; // ~10 min of live data

export function useAnalyticsHistory(
  liveData: { temp: number; humidity: number; soilMoisture: number },
  isConnected: boolean
) {
  const [historical, setHistorical] = useState<DataPoint[]>([]);
  const [rawSnapshots, setRawSnapshots] = useState<Array<{ plant_health_score: number; created_at?: string }>>([]);
  const [livePoints, setLivePoints] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const lastPushRef = useRef<number>(0);

  // Fetch historical analytics from Supabase
  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchAnalytics(userId, 100)
      .then((rows) => {
        setRawSnapshots(rows.map((r) => ({ plant_health_score: r.plant_health_score, created_at: r.created_at })));
        const points: DataPoint[] = rows
          .filter((r) => r.snapshot && (r.snapshot.temp != null || r.snapshot.humidity != null))
          .map((r) => ({
            time: r.created_at || new Date().toISOString(),
            temp: (r.snapshot?.temp as number) ?? 0,
            humidity: (r.snapshot?.humidity as number) ?? 0,
            soilMoisture: (r.snapshot?.soil_moisture as number) ?? 0,
            plantHealth: r.plant_health_score,
            irrigationNeed: r.irrigation_need_score,
            climateRisk: r.climate_risk_score,
          }))
          .reverse(); // oldest first for charts
        setHistorical(points);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Accumulate live MQTT points periodically
  useEffect(() => {
    if (!isConnected || liveData.temp === 0) return;
    const now = Date.now();
    if (now - lastPushRef.current < LIVE_INTERVAL_MS) return;
    lastPushRef.current = now;

    const point: DataPoint = {
      time: new Date().toISOString(),
      temp: liveData.temp,
      humidity: liveData.humidity,
      soilMoisture: liveData.soilMoisture,
    };

    setLivePoints((prev) => {
      const next = [...prev, point];
      if (next.length > MAX_LIVE_POINTS) return next.slice(-MAX_LIVE_POINTS);
      return next;
    });
  }, [isConnected, liveData.temp, liveData.humidity, liveData.soilMoisture]);

  // Combined series for charts: historical + live (deduped by time)
  const allPoints = [...historical, ...livePoints];

  return { historical, livePoints, allPoints, rawSnapshots, loading };
}
