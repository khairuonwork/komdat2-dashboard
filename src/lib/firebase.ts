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

    // Ambil array dari objek push key
    const entries: FirebaseSensorData[] = Object.values(rawData);
    const latest = entries[entries.length - 1];

    return latest;
  } catch (err) {
    console.error("Firebase fetch error:", err);
    return null;
  }
};
