import { useState, useEffect, useRef, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { MQTT_CONFIG, MQTT_TOPICS } from '../lib/mqtt';

export interface MqttData {
  temp: number;
  humidity: number;
  soilMoisture: number;
  mode: 'AUTO' | 'MANUAL';
  fanState: boolean;
  pumpState: boolean;
}

export const useMqtt = () => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [data, setData] = useState<MqttData>({
    temp: 0,
    humidity: 0,
    soilMoisture: 0,
    mode: 'AUTO',
    fanState: false,
    pumpState: false,
  });
  const commandQueueRef = useRef<Array<{ topic: string; message: string }>>([]);

  useEffect(() => {
    setConnectionError(null);
    const url = MQTT_CONFIG.url?.trim() || '';
    if (!url) {
      setConnectionError('MQTT URL is empty. Set VITE_MQTT_URL in .env (e.g. ws://broker-ip:9001 or wss://broker-ip:9001)');
      return;
    }
    const options: Record<string, unknown> = {
      clientId: `GreenTech-${Math.random().toString(36).slice(2, 11)}`,
      reconnectPeriod: 5000,
      clean: true,
      connectTimeout: 10000,
    };
    if (MQTT_CONFIG.username != null && String(MQTT_CONFIG.username).trim() !== '') {
      options.username = String(MQTT_CONFIG.username).trim();
      if (MQTT_CONFIG.password != null) options.password = String(MQTT_CONFIG.password);
    }

    const mqttClient = mqtt.connect(url, options);

    mqttClient.on('connect', () => {
      console.log('✅ Connected to GreenTech MQTT Broker');
      setConnectionError(null);
      setIsConnected(true);
      mqttClient.subscribe([
        MQTT_TOPICS.temperature,
        MQTT_TOPICS.humidity,
        MQTT_TOPICS.soilMoisture,
        MQTT_TOPICS.mode,
        MQTT_TOPICS.irrigation,
        MQTT_TOPICS.ventilation,
      ]);
      while (commandQueueRef.current.length > 0) {
        const cmd = commandQueueRef.current.shift();
        if (cmd) mqttClient.publish(cmd.topic, cmd.message);
      }
    });

    mqttClient.on('disconnect', () => setIsConnected(false));
    mqttClient.on('offline', () => setIsConnected(false));
    mqttClient.on('error', (err: Error) => {
      const msg = err?.message || String(err);
      console.error('MQTT error:', msg);
      setConnectionError(msg);
    });
    mqttClient.on('close', () => {
      setIsConnected(false);
    });

    mqttClient.on('message', (topic, message) => {
      const val = message.toString();
      setData((prev) => {
        const updated = { ...prev };
        switch (topic) {
          case MQTT_TOPICS.temperature:
            updated.temp = parseFloat(val) || 0;
            break;
          case MQTT_TOPICS.humidity:
            updated.humidity = parseFloat(val) || 0;
            break;
          case MQTT_TOPICS.soilMoisture:
            updated.soilMoisture = parseInt(val, 10) || 0;
            break;
          case MQTT_TOPICS.mode:
            updated.mode = val === 'MANUAL' ? 'MANUAL' : 'AUTO';
            break;
          case MQTT_TOPICS.irrigation:
            updated.pumpState = val === 'ON';
            break;
          case MQTT_TOPICS.ventilation:
            updated.fanState = val === 'OPEN';
            break;
        }
        return updated;
      });
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end(true);
      setClient(null);
      setIsConnected(false);
      commandQueueRef.current = [];
    };
  }, []);

  const sendCommand = useCallback((topic: string, message: string) => {
    if (client?.connected) {
      client.publish(topic, message);
      console.log(`📤 MQTT: ${topic} = ${message}`);
    } else {
      commandQueueRef.current.push({ topic, message });
      console.log(`📥 Queued (offline): ${topic} = ${message}`);
    }
  }, [client]);

  return { data, sendCommand, isConnected, connectionError, client };
};
