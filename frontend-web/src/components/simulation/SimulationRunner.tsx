import { useEffect } from "react";
import { startSimulationRunner } from "../../lib/simulation/runner";

/** Keeps fleet houses moving while a session exists. Renders nothing. */
export function SimulationRunner() {
  useEffect(() => startSimulationRunner(), []);
  return null;
}
