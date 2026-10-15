import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataCuacaLengkap } from "../types/weather";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const BATAS_WAKTU_MS = 3000;
const KUNCI_CACHE = "@jelajah_aman:cache_cuaca:";

export async function ambilCuaca(
  latitude: number,
  longitude: number,
): Promise<DataCuacaLengkap> {
  const kunci = `${KUNCI_CACHE}${latitude.toFixed(3)},${longitude.toFixed(3)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BATAS_WAKTU_MS);

  try {
    const url =
      `${BASE_URL}?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,weather_code,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;

    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Gagal memuat cuaca (status ${response.status})`);
    }

    const data = await response.json();

    const hasil: DataCuacaLengkap = {
      saatIni: {
        suhu: data.current.temperature_2m,
        kodeCuaca: data.current.weather_code,
        kecepatanAngin: data.current.wind_speed_10m,
        waktu: data.current.time,
      },
      harian: {
        tanggal: data.daily.time,
        suhuMaksimal: data.daily.temperature_2m_max,
        suhuMinimal: data.daily.temperature_2m_min,
        kodeCuaca: data.daily.weather_code,
      },
    };

    await AsyncStorage.setItem(kunci, JSON.stringify(hasil));

    return hasil;
  } catch (err) {
    const cache = await AsyncStorage.getItem(kunci);

    if (cache) {
      return JSON.parse(cache) as DataCuacaLengkap;
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "Permintaan cuaca melebihi batas waktu dan data offline belum tersedia.",
      );
    }

    throw new Error(
      "Gagal memuat cuaca dan belum ada data tersimpan untuk penggunaan offline.",
    );
  } finally {
    clearTimeout(timer);
  }
}
