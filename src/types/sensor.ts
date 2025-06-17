// Node 1 (Light Sensor)
// Node 2 (Light Sensor, Temperature Sensor, Humidity Sensor)
// Node 3 (Light Sensor, Temperature Sensor, Humidity Sensor, Distance Sensor)
// Node 4 (Light Sensor, Temperature Sensor, Humidity Sensor, Distance Sensor, MASTER)

export type SensorStatus = "normal" | "warning" | "critical";

export type SensorID =
  | "temp-sensor"
  | "hum-sensor"
  | "light-sensor"
  | "distance-sensor"
  | "pir-sensor";

export interface SensorData {
  id: SensorID;
  name: string;
  type: string;
  value: number;
  unit: string;
  status: SensorStatus;
  icon: React.ComponentType<any>;
  min: number;
  max: number;
  lastUpdated: Date;
}

export interface FirebaseData {
  sensorReadings: {
    cahaya: number[];
    dht11: {
      humidity: number;
      temperature: number;
    }[];
    pir: number[];
    soil: number[];
    ultrasonic: number[];
  };
}
