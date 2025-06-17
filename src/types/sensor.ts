// types/sensor.ts

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

// Sesuai struktur dari Firebase-mu sekarang
export interface FirebaseSensorData {
  cahaya: number;
  pir: number;
  ultrasonic: number;
  dht11: {
    temperature: number;
    humidity: number;
  };
}
