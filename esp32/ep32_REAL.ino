#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
//
// WiFi credentials
const char* ssid = "Kim";
const char* password = "12345678"; // Your WiFi password
//MQTT cmd connection
//mosquitto -c "C:\Program Files\mosquitto\mosquitto.conf" -v

// MQTT broker IP and port
const char* mqtt_server = "10.171.233.124";
const uint16_t mqtt_port = 1883;

// MQTT Topics
const char* TOPIC_IRRIGATION = "greenhouse/irrigation";
const char* TOPIC_VENTILATION = "greenhouse/ventilation";
const char* TOPIC_MODE = "greenhouse/mode";
const char* TOPIC_TEMPERATURE = "greenhouse/temperature";
const char* TOPIC_HUMIDITY = "greenhouse/humidity";
const char* TOPIC_SOIL_MOISTURE = "greenhouse/soilMoisturePercent";

// Sensor and control pin configuration
#define DHTPIN 4
#define DHTTYPE DHT11
#define FAN_PIN 5
#define PUMP_PIN 18
#define MOISTURE_PIN 34

// Threshold constants
const float TEMP_ON_THRESHOLD = 30.0;    
const float TEMP_OFF_THRESHOLD = 28.0;   
const float HUM_THRESHOLD = 60.0;        

// Soil moisture thresholds (adjust based on your sensor)
const int MOISTURE_DRY = 3500;   // Higher ADC = dry
const int MOISTURE_WET = 1000;   // Lower ADC = wet

// Moisture sensor stabilization
const int MOISTURE_SAMPLES = 10;      // Number of samples for averaging
const float MOISTURE_SMOOTHING = 0.2; // Smoothing factor (0.1-0.3)
float smoothedMoisture = 0;           // Stores smoothed moisture value

// Timing intervals
const long interval = 5000;           // Temp/Humidity publish interval (5s)
const long moistureInterval = 20000;  // Soil moisture publish interval (20s)
const long printInterval = 60000;     // Detailed print interval (60s)

DHT dht(DHTPIN, DHTTYPE);

WiFiClient espClient;
PubSubClient client(espClient);

// States
bool autoMode = true;
bool pumpManual = false;
bool fanManual = false;

bool lastAutoMode = autoMode;
bool fanState = false;

// Timing variables
unsigned long lastMsg = 0;
unsigned long lastMoisturePublish = 0;
unsigned long lastPrintTime = 0;

void setup_wifi() {
  delay(100);
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("Received [");
  Serial.print(topic);
  Serial.print("] = ");
  Serial.println(message);

  if (String(topic) == TOPIC_IRRIGATION) {
    pumpManual = true;
    if (message == "ON") {
      digitalWrite(PUMP_PIN, HIGH);
      Serial.println("Pump ON (manual)");
    } else if (message == "OFF") {
      digitalWrite(PUMP_PIN, LOW);
      Serial.println("Pump OFF (manual)");
    }
  } else if (String(topic) == TOPIC_VENTILATION) {
    fanManual = true;
    if (message == "OPEN") {
      digitalWrite(FAN_PIN, HIGH);
      fanState = true;
      Serial.println("Fan ON (manual)");
    } else if (message == "CLOSE") {
      digitalWrite(FAN_PIN, LOW);
      fanState = false;
      Serial.println("Fan OFF (manual)");
    }
  } else if (String(topic) == TOPIC_MODE) {
    if (message == "AUTO") {
      autoMode = true;
      pumpManual = false;
      fanManual = false;
      Serial.println("Switched to AUTO mode");
    } else if (message == "MANUAL") {
      autoMode = false;
      Serial.println("Switched to MANUAL mode");
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32Client-" + String((uint64_t)ESP.getEfuseMac(), HEX);
    if (client.connect(clientId.c_str())) {
      Serial.println(" connected");
      client.subscribe(TOPIC_IRRIGATION);
      client.subscribe(TOPIC_VENTILATION);
      client.subscribe(TOPIC_MODE);
    } else {
      Serial.print(" failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// Updated moisture reading with stabilization
int getSoilMoisturePercent(int raw) {
  static int samples[MOISTURE_SAMPLES];
  static int currentSample = 0;
  
  // Store current sample
  samples[currentSample] = raw;
  currentSample = (currentSample + 1) % MOISTURE_SAMPLES;
  
  // Calculate average
  long sum = 0;
  for(int i=0; i<MOISTURE_SAMPLES; i++) {
    sum += samples[i];
  } 
  int avg = sum / MOISTURE_SAMPLES;
  
  // Apply exponential smoothing
  smoothedMoisture = (MOISTURE_SMOOTHING * avg) + ((1 - MOISTURE_SMOOTHING) * smoothedMoisture);
  
  // Convert to percentage
  int smoothedRaw = constrain((int)smoothedMoisture, MOISTURE_WET, MOISTURE_DRY);
  return map(smoothedRaw, MOISTURE_DRY, MOISTURE_WET, 0, 100);
}

void setup() {
  Serial.begin(9600);
  dht.begin();

  pinMode(FAN_PIN, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(FAN_PIN, LOW);
  digitalWrite(PUMP_PIN, LOW);

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int rawMoisture = analogRead(MOISTURE_PIN);
  int moisturePercent = getSoilMoisturePercent(rawMoisture);

  if (isnan(temp) || isnan(hum)) {
    Serial.println("Failed to read from DHT sensor!");
    delay(1000);
    return;
  }

  if (autoMode != lastAutoMode) {
    Serial.println(autoMode ? "Switched to AUTO mode" : "Switched to MANUAL mode");
    lastAutoMode = autoMode;
  }

  if (autoMode) {
    if ((temp > TEMP_ON_THRESHOLD) || (hum > HUM_THRESHOLD)) {
      if (!fanState) {
        digitalWrite(FAN_PIN, HIGH);
        fanState = true;
        Serial.println("Fan ON (auto)");
      }
    } else if ((temp < TEMP_OFF_THRESHOLD) && (hum < HUM_THRESHOLD)) {
      if (fanState) {
        digitalWrite(FAN_PIN, LOW);
        fanState = false;
        Serial.println("Fan OFF (auto)");
      }
    }

    if (!pumpManual) {
      if (moisturePercent < 30) {
        digitalWrite(PUMP_PIN, HIGH);
        Serial.println("Pump ON (auto - soil dry)");
      } else {
        digitalWrite(PUMP_PIN, LOW);
        Serial.println("Pump OFF (auto - soil moist)");
      }
    }
  }

  // Debug prints
  Serial.print("Raw Moisture ADC: ");
  Serial.print(rawMoisture);
  Serial.print(" -> Stabilized Moisture: ");
  Serial.print(moisturePercent);
  Serial.println(" %");

  unsigned long now = millis();
  
  // Temperature and Humidity publishing (every 5 seconds)
  if (now - lastMsg > interval) {
    lastMsg = now;
    client.publish(TOPIC_TEMPERATURE, String(temp, 1).c_str());
    client.publish(TOPIC_HUMIDITY, String(hum, 1).c_str());
    Serial.println("===== Temp/Humidity Published =====");
  }

  // Soil Moisture publishing (every 20 seconds)
  if (now - lastMoisturePublish > moistureInterval) {
    lastMoisturePublish = now;
    client.publish(TOPIC_SOIL_MOISTURE, String(moisturePercent).c_str());
    Serial.println("===== Soil Moisture Published =====");
  }

  if (now - lastPrintTime >= printInterval) {
    lastPrintTime = now;
    Serial.println("---------- Sensor Readings ----------");
    Serial.printf("Temperature: %.1f °C\n", temp);
    Serial.printf("Humidity: %.1f %%\n", hum);
    Serial.printf("Soil Moisture: %d %%\n", moisturePercent);
    Serial.println("------------------------------------");
  }

  delay(100);
}