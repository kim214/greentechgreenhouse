import { useState, useEffect } from 'react';
import mqtt, { MqttClient } from 'mqtt';

const MQTT_URL = 'wss://10.1.146.252:9001'; // Secure WebSocket (MQTTS) 
const MQTT_USERNAME = 'KABU'; // if your broker requires auth
const MQTT_PASSWORD = ''; // if your broker requires auth

export const useMqtt = () => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [data, setData] = useState({
    temp: 0,
    humidity: 0,
    soilMoisture: 0,
    mode: 'AUTO',
    fanState: false,
    pumpState: false
  });

  useEffect(() => {
  const options = {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    reconnectPeriod: 5000, // try reconnect every 5 seconds
    clean: true,
    connectTimeout: 4000
  };

  const mqttClient = mqtt.connect(MQTT_URL, options);

  mqttClient.on('connect', () => {
    console.log('✅ Connected to GreenTech MQTTS Broker');
    mqttClient.subscribe([
      'greenhouse/temperature',
      'greenhouse/humidity',
      'greenhouse/soilMoisturePercent',
      'greenhouse/mode',
      'greenhouse/irrigation',
      'greenhouse/ventilation'
    ]);
  });

  mqttClient.on('message', (topic, message) => {
    const val = message.toString();
    setData(prev => {
      const updated = { ...prev };
      switch (topic) {
        case 'greenhouse/temperature':
          updated.temp = parseFloat(val);
          break;
        case 'greenhouse/humidity':
          updated.humidity = parseFloat(val);
          break;
        case 'greenhouse/soilMoisturePercent':
          updated.soilMoisture = parseInt(val);
          break;
        case 'greenhouse/mode':
          updated.mode = val;
          break;
        case 'greenhouse/irrigation':
          updated.pumpState = val === 'ON';
          break;
        case 'greenhouse/ventilation':
          updated.fanState = val === 'OPEN';
          break;
      }
      return updated;
    });
  });

  setClient(mqttClient);

  // ✅ Cleanup function must return void
  return () => {
    mqttClient.end(true); // disconnect client on unmount
  };
}, []);

  const sendCommand = (topic: string, message: string) => {
    if (client && client.connected) {
      client.publish(topic, message);
      console.log(`📤 Sent command -> Topic: ${topic}, Message: ${message}`);
    } else {
      console.warn('⚠️ MQTT client not connected');
    }
  };

  return { data, sendCommand };
};