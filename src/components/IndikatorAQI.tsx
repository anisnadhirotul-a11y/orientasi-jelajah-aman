import { Text, View } from "react-native";
import { LaporanUdara } from "../types/cuaca";

interface IndikatorAQIProps {
  laporan: LaporanUdara;
}

export default function IndikatorAQI({ laporan }: IndikatorAQIProps) {
  let warna = "black";

  switch (laporan.tingkat) {
    case "BAIK":
      warna = "green";
      break;
    case "SEDANG":
      warna = "orange";
      break;
    case "TIDAK_SEHAT":
      warna = "red";
      break;
    case "BERBAHAYA":
      warna = "purple";
      break;
  }

  return (
    <View
      style={{
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
      }}
    >
      <Text>Kota: {laporan.kota}</Text>
      <Text>Indeks AQI: {laporan.indeksAQI}</Text>
      <Text style={{ color: warna }}>Tingkat AQI: {laporan.tingkat}</Text>

      {laporan.diperbaruiPada && (
        <Text>Diperbarui: {laporan.diperbaruiPada}</Text>
      )}
    </View>
  );
}
