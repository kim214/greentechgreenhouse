import { useState, useEffect } from 'react';
import mqtt from 'mqtt';

const MQTT_URL = 'ws://10.171.233.124:9001'; // Use WebSockets port

export const useMqtt = () => {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [data, setData] = useState({
    temp: 0,
    humidity: 0,
    soilMoisture: 0,
    mode: 'AUTO'
  });

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_URL);

    mqttClient.on('connect', () => {
      console.log('Connected to GreenTech Broker');
      mqttClient.subscribe(['greenhouse/temperature', 'greenhouse/humidity', 'greenhouse/soilMoisturePercent', 'greenhouse/mode']);
    });

    mqttClient.on('message', (topic, message) => {
      const val = message.toString();
      if (topic === 'greenhouse/temperature') setData(prev => ({ ...prev, temp: parseFloat(val) }));
      if (topic === 'greenhouse/humidity') setData(prev => ({ ...prev, humidity: parseFloat(val) }));
      if (topic === 'greenhouse/soilMoisturePercent') setData(prev => ({ ...prev, soilMoisture: parseInt(val) }));
      if (topic === 'greenhouse/mode') setData(prev => ({ ...prev, mode: val }));
    });

    setClient(mqttClient);
    return () => { mqttClient.end(); };
  }, []);

  const sendCommand = (topic: string, message: string) => {
    if (client) client.publish(topic, message);
  };

  return { data, sendCommand };
};