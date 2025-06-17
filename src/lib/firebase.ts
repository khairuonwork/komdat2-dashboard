// lib/firebase.ts

const FIREBASE_URL = "https://lora-komdat-ii-project-default-rtdb.asia-southeast1.firebasedatabase.app";
const SECRET = "ZcUuGBHg809v1GlMx4KBEEppW5U7kbZzZ1vvEn9E";

/**
 * Ambil data dari Realtime Database
 * @param path Contoh: "/sensorReadings"
 */
export const fetchFirebaseData = async (path: string) => {
  try {
    const res = await fetch(`${FIREBASE_URL}${path}.json?auth=${SECRET}`);
    if (!res.ok) throw new Error("Gagal mengambil data");
    return await res.json();
  } catch (err) {
    console.error("Fetch Firebase error:", err);
    return null;
  }
};

/**
 * Simpan data ke Firebase Realtime Database
 * @param path Path tujuan, misal: "/sensorReadings"
 * @param data Data yang ingin disimpan (bentuk objek atau array)
 */
export const postFirebaseData = async (path: string, data: any) => {
  try {
    const res = await fetch(`${FIREBASE_URL}${path}.json?auth=${SECRET}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal menyimpan data");
    return await res.json();
  } catch (err) {
    console.error("Post Firebase error:", err);
    return null;
  }
};

/**
 * Kompatibel dengan Firebase Realtime: polling + callback
 * @param path Path ke data (contoh: "sensorReadings")
 * @param callback Fungsi yang dijalankan setiap kali data berubah
 * @param intervalMs Interval polling dalam milidetik (default: 2000 ms)
 * @returns fungsi unsubscribe
 */
export const onValueCompatible = (
  path: string,
  callback: (snapshot: { val: () => any }) => void,
  intervalMs = 2000
) => {
  let prevData: string | null = null;
  let isCancelled = false;

  const poll = async () => {
    if (isCancelled) return;

    const data = await fetchFirebaseData(`/${path}`);
    const dataString = JSON.stringify(data);

    if (dataString !== prevData) {
      prevData = dataString;
      callback({
        val: () => data,
      });
    }

    setTimeout(poll, intervalMs);
  };

  poll();

  // Fungsi untuk unsubscribe
  return () => {
    isCancelled = true;
  };
};
