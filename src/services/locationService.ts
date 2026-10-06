import * as Location from "expo-location";

export type StatusIzinLokasi =
  | "granted"
  | "denied"
  | "unavailable";

export async function mintaIzinLokasi(): Promise<StatusIzinLokasi> {
  const layananAktif = await Location.hasServicesEnabledAsync();

  if (!layananAktif) {
    return "unavailable";
  }

  const { status } =
    await Location.requestForegroundPermissionsAsync();

  return status === "granted" ? "granted" : "denied";
}

export async function ambilKoordinatSaatIni() {
  const layananAktif = await Location.hasServicesEnabledAsync();

  if (!layananAktif) {
    throw new Error("Layanan lokasi tidak aktif");
  }

  // Coba ambil lokasi terakhir terlebih dahulu
  const lokasiTerakhir = await Location.getLastKnownPositionAsync({
    maxAge: 5 * 60 * 1000,
    requiredAccuracy: 1000,
  });

  if (lokasiTerakhir) {
    return {
      latitude: lokasiTerakhir.coords.latitude,
      longitude: lokasiTerakhir.coords.longitude,
    };
  }

  // Kalau tidak ada lokasi terakhir, ambil lokasi terbaru
  const lokasi = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: lokasi.coords.latitude,
    longitude: lokasi.coords.longitude,
  };
}