
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HasilGeocoding } from "../types/geocoding";

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";
const MAKSIMAL_RIWAYAT = 10;

// Mengambil riwayat pencarian
export async function ambilRiwayat(): Promise<HasilGeocoding[]> {
  const data = await AsyncStorage.getItem(KUNCI_RIWAYAT);
  return data ? JSON.parse(data) : [];
}

// Menyimpan kota yang dicari
export async function simpanRiwayat(
  kota: HasilGeocoding
): Promise<void> {
  const daftar = await ambilRiwayat();

  // Menghindari kota yang sama muncul dua kali
  const tanpaDuplikat = daftar.filter(
    (item) => item.id !== kota.id
  );

  // Kota terbaru diletakkan paling atas
  const daftarBaru = [kota, ...tanpaDuplikat].slice(
    0,
    MAKSIMAL_RIWAYAT
  );

  await AsyncStorage.setItem(
    KUNCI_RIWAYAT,
    JSON.stringify(daftarBaru)
  );
}
