import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Reloads UI when operational rows change.
 * Debounced so one simulation tick (many inserts) becomes a single refresh.
 */
export function useRealtimeRefresh(
  enabled: boolean,
  tables: string[],
  onChange: () => void,
  filter?: { column: string; value: string }
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const tableKey = tables.join(",");
  const filterKey = filter ? `${filter.column}:${filter.value}` : "";

  useEffect(() => {
    if (!enabled || tables.length === 0) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const bump = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        onChangeRef.current();
      }, 400);
    };

    const channel = supabase.channel(`gt-live-${tableKey}-${filterKey || "all"}`);
    for (const table of tables) {
      const spec: {
        event: "*";
        schema: string;
        table: string;
        filter?: string;
      } = { event: "*", schema: "public", table };
      if (filter) spec.filter = `${filter.column}=eq.${filter.value}`;
      channel.on("postgres_changes", spec, bump);
    }

    channel.subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [enabled, tableKey, filterKey]);
}

export const FARM_EVENT_TABLES = [
  "sensor_readings",
  "alerts",
  "activity_logs",
  "irrigation_events",
  "ventilation_events",
  "automation_events",
  "devices",
  "crops",
];

export const LIVE_TABLES = [...FARM_EVENT_TABLES, "greenhouses"];
