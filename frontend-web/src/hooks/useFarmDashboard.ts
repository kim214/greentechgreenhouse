import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MqttData } from "./useMqtt";
import {
  daylightPar,
  fetchFarmSnapshot,
  fetchVisibleGreenhouses,
  ensureOwnGreenhouse,
  registerOwnGreenhouse,
  recordLiveReading,
  type FarmSnapshot,
  type GreenhouseRow,
} from "../lib/farmApi";
import { FARM_EVENT_TABLES, useRealtimeRefresh } from "./useRealtimeRefresh";

const SELECTED_KEY = "selectedGreenhouseId";
const POLL_MS = 45_000;
const DRIFT_MS = 2_500;

export type FarmClimate = {
  temp: number;
  humidity: number;
  soilMoisture: number;
  lightPar: number;
  mode: "AUTO" | "MANUAL";
  pumpState: boolean;
  fanState: boolean;
  hasClimate: boolean;
};

function mqttHasReadings(data: MqttData) {
  return data.temp > 0 || data.humidity > 0 || data.soilMoisture > 0;
}

export function useFarmDashboard(mqtt: { data: MqttData; isConnected: boolean }) {
  const [houses, setHouses] = useState<GreenhouseRow[]>([]);
  const [selectedId, setSelectedIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SELECTED_KEY);
    } catch {
      return null;
    }
  });
  const [snapshot, setSnapshot] = useState<FarmSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driftTick, setDriftTick] = useState(0);
  const [houseNonce, setHouseNonce] = useState(0);

  const mqttRef = useRef(mqtt);
  mqttRef.current = mqtt;

  const setSelectedId = useCallback((id: string) => {
    setSelectedIdState(id);
    try {
      localStorage.setItem(SELECTED_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const addHouse = useCallback(
    async (input: { name: string; location?: string; cropName?: string }) => {
      const result = await registerOwnGreenhouse(input);
      if ("error" in result) {
        throw new Error(result.error);
      }
      setSelectedId(result.id);
      setHouseNonce((n) => n + 1);
      return result.id;
    },
    [setSelectedId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureOwnGreenhouse();
        const list = await fetchVisibleGreenhouses();
        if (cancelled) return;
        setError(null);
        setHouses(list);
        setSelectedIdState((current) => {
          if (current && list.some((h) => h.id === current)) return current;
          const fallback = list.find((h) => h.status === "online") ?? list[0];
          if (fallback) {
            try {
              localStorage.setItem(SELECTED_KEY, fallback.id);
            } catch {
              /* ignore */
            }
            return fallback.id;
          }
          return null;
        });
      } catch {
        if (!cancelled) {
          setHouses([]);
          setError("Could not load greenhouses.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [houseNonce]);

  useEffect(() => {
    if (!selectedId) {
      setSnapshot(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const next = await fetchFarmSnapshot(selectedId);
        if (!cancelled) {
          setSnapshot(next);
          if (next) setError(null);
        }
      } catch {
        if (!cancelled) {
          setSnapshot(null);
          setError("Could not load house data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    const timer = setInterval(() => {
      void load();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [selectedId]);

  const reloadSnapshot = useCallback(() => {
    if (!selectedId) return;
    void fetchFarmSnapshot(selectedId).then((next) => {
      if (next) setSnapshot(next);
    });
  }, [selectedId]);

  useRealtimeRefresh(
    !!selectedId,
    FARM_EVENT_TABLES,
    reloadSnapshot,
    selectedId ? { column: "greenhouse_id", value: selectedId } : undefined
  );
  useRealtimeRefresh(
    !!selectedId,
    ["greenhouses"],
    reloadSnapshot,
    selectedId ? { column: "id", value: selectedId } : undefined
  );

  useEffect(() => {
    const mqttLive = mqtt.isConnected && mqttHasReadings(mqtt.data);
    if (mqttLive) return;
    const timer = setInterval(() => setDriftTick((n) => n + 1), DRIFT_MS);
    return () => clearInterval(timer);
  }, [mqtt.isConnected, mqtt.data.temp, mqtt.data.humidity, mqtt.data.soilMoisture]);

  useEffect(() => {
    if (!selectedId || !mqtt.isConnected) return;
    const write = () => {
      const live = mqttRef.current;
      if (!live.isConnected || !mqttHasReadings(live.data)) return;
      void recordLiveReading(selectedId, {
        temperature: live.data.temp,
        humidity: live.data.humidity,
        soil_moisture: live.data.soilMoisture,
      });
    };
    write();
    const timer = setInterval(write, 20_000);
    return () => clearInterval(timer);
  }, [selectedId, mqtt.isConnected]);

  const climate = useMemo<FarmClimate>(() => {
    const live = mqtt.isConnected && mqttHasReadings(mqtt.data);
    const reading = snapshot?.latestReading;
    const lightOnline = snapshot?.sensors.find((s) => s.type === "light")?.is_online !== false;
    const houseOnline = snapshot?.greenhouse.status === "online";
    const wave = Date.now() / 7000;

    const temp = live
      ? mqtt.data.temp
      : reading
        ? reading.temperature + Math.sin(wave) * 0.07
        : 0;
    const humidity = live
      ? mqtt.data.humidity
      : reading
        ? reading.humidity + Math.sin(wave + 1.2) * 0.25
        : 0;
    const soil = live
      ? mqtt.data.soilMoisture
      : reading
        ? reading.soil_moisture + Math.sin(wave + 2.1) * 0.12
        : 0;

    return {
      temp,
      humidity,
      soilMoisture: live ? soil : Math.round(soil * 10) / 10,
      lightPar: houseOnline && lightOnline ? daylightPar() : 0,
      mode: mqtt.isConnected ? mqtt.data.mode : snapshot?.greenhouse.mode ?? "AUTO",
      pumpState: mqtt.isConnected ? mqtt.data.pumpState : !!snapshot?.irrigating,
      fanState: mqtt.isConnected ? mqtt.data.fanState : !!snapshot?.ventilating,
      hasClimate: live || !!reading,
    };
  }, [mqtt.data, mqtt.isConnected, snapshot, driftTick]);

  const reload = useCallback(() => {
    setError(null);
    setLoading(true);
    setHouseNonce((n) => n + 1);
    if (selectedId) {
      void fetchFarmSnapshot(selectedId).then((next) => {
        if (next) setSnapshot(next);
      });
    }
  }, [selectedId]);

  return {
    houses,
    selectedId,
    setSelectedId,
    addHouse,
    snapshot,
    climate,
    loading,
    error,
    reload,
  };
}
