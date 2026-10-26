import { Text, View } from "react-native";
import { spacing, typeScale } from "../constants/styles";
import { useTheme } from "../context/ThemeContext";
import type { TingkatAQI, WeatherCardProps } from "../types/cuaca";

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
}: WeatherCardProps) {
  // Mengambil warna sesuai tema aplikasi
  const { colors, isDark } = useTheme();

  // Warna kualitas udara sesuai kategori dan tema
  const warnaPerTingkat: Record<TingkatAQI, string> = {
    BAIK: isDark ? "#4ADE80" : "#15803D",
    SEDANG: isDark ? "#FACC15" : "#A16207",
    TIDAK_SEHAT: isDark ? "#FB923C" : "#C2410C",
    BERBAHAYA: isDark ? "#F87171" : "#B91C1C",
  };

  // Menampilkan informasi AQI
  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} (${tingkatAQI})`
      : `AQI: ${tingkatAQI}`;

  // Keterangan untuk aksesibilitas
  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: spacing.sedang,
        borderRadius: 8,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 8,
      }}
    >
      {/* Nama kota */}
      <Text
        style={{
          fontSize: typeScale.judul,
          fontWeight: "bold",
          color: colors.text,
        }}
      >
        {kota}
      </Text>

      {/* Suhu kota */}
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          color: colors.text,
        }}
      >
        {suhu}°C
      </Text>

      {/* Kualitas udara */}
      <Text
        style={{
          fontSize: typeScale.isi,
          fontWeight: "600",
          color: warnaPerTingkat[tingkatAQI] ?? colors.text,
        }}
      >
        {teksAQI}
      </Text>
    </View>
  );
}
