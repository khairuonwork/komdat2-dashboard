// lib/firebase.ts

import { FirebaseSensorData } from "@/types/sensor";

const FIREBASE_URL =
  "https://lora-komdat-ii-project-default-rtdb.asia-southeast1.firebasedatabase.app";
const SECRET = "ZcUuGBHg809v1GlMx4KBEEppW5U7kbZzZ1vvEn9E";

export const getLatestSensorData = async (): Promise<FirebaseSensorData | null> => {
  try {
    const res = await fetch(`${FIREBASE_URL}/sensorReadings.json?auth=${SECRET}`);
    if (!res.ok) throw new Error("Gagal mengambil data dari Firebase");

    const rawData = await res.json();
    if (!rawData) return null;

    // Ambil data terakhir berdasarkan push key
    const keys = Object.keys(rawData);
    const latestKey = keys[keys.length - 1];
    const latestData: FirebaseSensorData = rawData[latestKey];

    return latestData;
  } catch (err) {
    console.error("Firebase fetch error:", err);
    return null;
  }
};
