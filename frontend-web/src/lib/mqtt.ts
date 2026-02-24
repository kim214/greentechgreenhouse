/**
 * MQTT broker configuration for GreenTech dashboard.
 * Set in .env: VITE_MQTT_URL, VITE_MQTT_USERNAME, VITE_MQTT_PASSWORD (restart app after changing).
 * - Use ws://BROKER_IP:9001 if your broker has no TLS (common for local Mosquitto).
 * - Use wss://BROKER_IP:9001 only if the broker has TLS; self-signed certs may need browser acceptance.
 * ESP32 and dashboard must use the SAME broker (ESP32 uses tcp://BROKER_IP:1883).
 */
export const MQTT_CONFIG = {
  url: (import.meta.env.VITE_MQTT_URL ?? "").trim() || "ws://localhost:9001",
  username: import.meta.env.VITE_MQTT_USERNAME ?? "",
  password: import.meta.env.VITE_MQTT_PASSWORD ?? "",
};

export const MQTT_TOPICS = {
  temperature: "greenhouse/temperature",
  humidity: "greenhouse/humidity",
  soilMoisture: "greenhouse/soilMoisturePercent",
  mode: "greenhouse/mode",
  irrigation: "greenhouse/irrigation",
  ventilation: "greenhouse/ventilation",
} as const;
