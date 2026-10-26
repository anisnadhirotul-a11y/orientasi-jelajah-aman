import { useState } from "react";
import { TextInput, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface SearchBoxProps {
  onCari: (teks: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const [teks, setTeks] = useState("");

  // Mengambil warna sesuai tema aplikasi
  const { colors, isDark } = useTheme();

  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru);
  }

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        selectionColor={colors.primary}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.text,
          fontSize: 16,
        }}
      />
    </View>
  );
}
