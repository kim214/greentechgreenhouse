import { useCallback, useEffect, useState } from "react";
import { fetchAdminPlatform, type AdminPlatform } from "../lib/adminApi";
import { emptyBenefits } from "../lib/benefitMetrics";
import { LIVE_TABLES, useRealtimeRefresh } from "./useRealtimeRefresh";

const POLL_MS = 60_000;

const empty: AdminPlatform = {
  metrics: {
    totalFarmers: 0,
    activeFarmers: 0,
    offlineFarmers: 0,
    totalGreenhouses: 0,
    onlineGreenhouses: 0,
    offlineGreenhouses: 0,
    connectedDevices: 0,
    offlineDevices: 0,
    activeAlerts: 0,
    irrigationActive: 0,
    ventilationActive: 0,
    activity24h: 0,
  },
  farmers: [],
  greenhouses: [],
  devices: [],
  alerts: [],
  activity: [],
  benefits: emptyBenefits(),
};

export function useAdminPlatform(enabled: boolean) {
  const [data, setData] = useState<AdminPlatform>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    try {
      setData(await fetchAdminPlatform());
      setError(null);
    } catch {
      setError("Could not load platform data.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void reload();
    const timer = setInterval(() => {
      void reload();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [enabled, reload]);

  useRealtimeRefresh(enabled, LIVE_TABLES, reload);

  return { data, loading, error, reload };
}
