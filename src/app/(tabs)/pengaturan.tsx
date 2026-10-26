import { useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../context/ThemeContext";
import { hapusSemuaCache } from "../../services/cacheRepository";

export default function TabPengaturan() {
  const [pesan, setPesan] = useState<string | null>(null);
  const { mode, setMode, colors } = useTheme();

  async function hapusDataTersimpan() {
    try {
      await hapusSemuaCache();
      setPesan("Data cuaca tersimpan sudah dihapus.");
    } catch (err) {
      console.error("ERROR HAPUS DATA:", err);
      setPesan("Gagal menghapus data cuaca tersimpan.");
    }
  }

  const pilihanTema = [
    { label: "Terang", value: "light" },
    { label: "Gelap", value: "dark" },
    { label: "Ikuti Sistem", value: "system" },
  ] as const;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 16,
        gap: 16,
        backgroundColor: colors.background,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: colors.text,
        }}
      >
        Pengaturan Jelajah Aman
      </Text>

      <Text style={{ color: colors.text }}>Versi 1.0.0</Text>

      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: colors.text,
          marginTop: 15,
        }}
      >
        Tema Aplikasi
      </Text>

      {pilihanTema.map((pilihan) => (
        <TouchableOpacity
          key={pilihan.value}
          onPress={() => setMode(pilihan.value)}
          style={{
            padding: 15,
            borderRadius: 10,
            backgroundColor: colors.card,
            borderWidth: mode === pilihan.value ? 2 : 1,
            borderColor:
              mode === pilihan.value ? colors.primary : colors.border,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
            }}
          >
            {mode === pilihan.value ? "◉" : "○"} {pilihan.label}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={{ marginTop: 20 }}>
        <Button
          title="Hapus Data Cuaca Tersimpan"
          onPress={hapusDataTersimpan}
        />
      </View>

      {pesan && (
        <Text style={{ color: colors.text }} accessibilityLabel={pesan}>
          {pesan}
        </Text>
      )}
    </SafeAreaView>
  );
}
