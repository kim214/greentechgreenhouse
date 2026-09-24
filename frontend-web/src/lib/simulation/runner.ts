import { supabase } from "../supabaseClient";

const TICK_MS = 20_000;
let timer: ReturnType<typeof setInterval> | null = null;
let inFlight = false;

/**
 * Advances fictional fleet houses in the database.
 * Does not publish MQTT and does not change live ESP32 readings.
 */
export async function tickSimulation(): Promise<void> {
  if (inFlight) return;
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

  inFlight = true;
  try {
    await supabase.rpc("run_simulation_tick");
  } catch {
    // Silent: Phase 3 must not interrupt the live dashboard / MQTT path.
  } finally {
    inFlight = false;
  }
}

export function startSimulationRunner(): () => void {
  void tickSimulation();
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    void tickSimulation();
  }, TICK_MS);

  return () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}
