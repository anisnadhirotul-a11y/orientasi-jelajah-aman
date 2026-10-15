import AsyncStorage from "@react-native-async-storage/async-storage";
import { GeocodingResponse, HasilGeocoding } from "../types/geocoding";

const BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

const KUNCI_CACHE = "@jelajah_aman:cache_kota:";

export async function cariKota(nama: string): Promise<HasilGeocoding[]> {
  const namaBersih = nama.trim();

  if (!namaBersih) {
    return [];
  }

  const kunci = KUNCI_CACHE + namaBersih.toLowerCase();

  try {
    const url =
      `${BASE_URL}?name=${encodeURIComponent(namaBersih)}` +
      "&count=5&language=id&format=json";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Gagal mengambil data kota");
    }

    const data: GeocodingResponse = await response.json();
    const hasil = data.results ?? [];

    if (hasil.length > 0) {
      await AsyncStorage.setItem(kunci, JSON.stringify(hasil));
    }

    return hasil;
  } catch {
    const cache = await AsyncStorage.getItem(kunci);

    if (cache) {
      return JSON.parse(cache) as HasilGeocoding[];
    }

    throw new Error(
      "Kota belum tersimpan. Sambungkan internet untuk mencarinya.",
    );
  }
}
