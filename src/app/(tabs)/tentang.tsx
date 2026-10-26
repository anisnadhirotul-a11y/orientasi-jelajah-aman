import { Text, View } from "react-native";
import { spacing, typeScale } from "../../constants/styles";
import { useTheme } from "../../context/ThemeContext";

export default function TabTentang() {
  // Mengambil warna sesuai tema aplikasi
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        padding: spacing.sedang,
        backgroundColor: colors.background,
      }}
    >
      <Text
        accessible
        accessibilityLabel="Judul halaman Tentang aplikasi Jelajah Aman"
        style={{
          fontSize: typeScale.judul,
          fontWeight: "bold",
          color: colors.text,
          marginBottom: 12,
        }}
      >
        Jelajah Aman
      </Text>

      <Text
        style={{
          fontSize: typeScale.isi,
          color: colors.text,
          marginBottom: 8,
        }}
      >
        Versi 1.0.0
      </Text>

      <Text
        style={{
          fontSize: typeScale.isi,
          color: colors.text,
        }}
      >
        Dibuat oleh: Ana
      </Text>
    </View>
  );
}
