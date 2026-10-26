
import { View, Text } from "react-native";
import type { SumberData } from "../types/cache";
import { useTheme } from "../context/ThemeContext";

interface StatusDataProps {
  sumber: SumberData;
  disimpanPada: number;
}

// Menghitung waktu sejak data disimpan
function formatUmur(disimpanPada: number): string {
  const menit = Math.max(
    0,
    Math.floor((Date.now() - disimpanPada) / 60000)
  );

  if (menit < 1) return "baru saja";
  if (menit < 60) return menit + " menit lalu";

  const jam = Math.floor(menit / 60);

  if (jam < 24) return jam + " jam lalu";

  return Math.floor(jam / 24) + " hari lalu";
}

// Menentukan keterangan sumber data
function labelSumber(sumber: SumberData): string {
  if (sumber === "jaringan") {
    return "Data terbaru dari internet";
  }

  if (sumber === "cache-segar") {
    return "Data tersimpan (masih segar)";
  }

  return "Mode offline - data tersimpan mungkin sudah usang";
}

export default function StatusData({
  sumber,
  disimpanPada,
}: StatusDataProps) {
  // Mengambil warna dari tema aplikasi
  const { colors, isDark } = useTheme();

  const basi = sumber === "cache-basi";
  const label = labelSumber(sumber);
  const umur = formatUmur(disimpanPada);

  // Warna status berdasarkan tema dan kondisi cache
  const warnaLatar = basi
    ? isDark
      ? "#422D16"
      : "#FEF3E2"
    : isDark
      ? "#12382F"
      : "#EAFBF6";

  const warnaStatus = basi
    ? isDark
      ? "#FCD34D"
      : "#92400E"
    : isDark
      ? "#6EE7B7"
      : "#13795F";

  return (
    <View
      accessible
      accessibilityLabel={
        label + ", diperbarui " + umur
      }
      style={{
        padding: 12,
        borderRadius: 8,
        backgroundColor: warnaLatar,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 5,
      }}
    >
      {/* Informasi sumber data */}
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: warnaStatus,
        }}
      >
        {label}
      </Text>

      {/* Waktu pembaruan */}
      <Text
        style={{
          fontSize: 11,
          color: colors.text,
        }}
      >
        Diperbarui {umur}
      </Text>
    </View>
  );
}
