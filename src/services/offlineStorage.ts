import AsyncStorage from "@react-native-async-storage/async-storage";
import { HasilGeocoding } from "../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../types/weather";

export type CacheCuaca = {
  kota: HasilGeocoding;
  cuaca: DataCuacaLengkap;
  kualitasUdara: DataKualitasUdara;
  disimpanPada: string;
};

const KUNCI_CACHE = "@aplikasi_cuaca:cache";

export async function simpanCuacaOffline(
  kota: HasilGeocoding,
  cuaca: DataCuacaLengkap,
  kualitasUdara: DataKualitasUdara,
): Promise<void> {
  const data: CacheCuaca = {
    kota,
    cuaca,
    kualitasUdara,
    disimpanPada: new Date().toISOString(),
  };

  await AsyncStorage.setItem(KUNCI_CACHE, JSON.stringify(data));
}

export async function ambilCuacaOffline(): Promise<CacheCuaca | null> {
  const json = await AsyncStorage.getItem(KUNCI_CACHE);
  return json ? (JSON.parse(json) as CacheCuaca) : null;
}
