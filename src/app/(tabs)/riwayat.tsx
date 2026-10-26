import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../context/ThemeContext";

import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";

import { ambilRiwayat } from "../../services/riwayatStorage";
import { KotaFavorit } from "../../types/favorit";
import { HasilGeocoding } from "../../types/geocoding";

export default function TabRiwayat() {
  // Mengambil warna dari tema aplikasi
  const { colors } = useTheme();

  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  const [riwayat, setRiwayat] = useState<HasilGeocoding[]>([]);

  // Memuat favorit dan riwayat saat halaman dibuka
  useFocusEffect(
    useCallback(() => {
      let aktif = true;

      async function muatData() {
        try {
          const [favorit, pencarian] = await Promise.all([
            ambilSemuaFavorit(),
            ambilRiwayat(),
          ]);

          if (aktif) {
            setDaftarFavorit(favorit);
            setRiwayat(pencarian);
          }
        } catch (err) {
          console.error("ERROR MEMUAT RIWAYAT:", err);
        }
      }

      void muatData();

      return () => {
        aktif = false;
      };
    }, []),
  );

  // Membuka kota dari riwayat ke Beranda
  function bukaKota(kota: HasilGeocoding) {
    router.navigate({
      pathname: "/",
      params: {
        kotaId: String(kota.id),
        kotaNama: kota.name,
        kotaLat: String(kota.latitude),
        kotaLon: String(kota.longitude),
        kotaCountry: kota.country || "",
        waktuBuka: String(Date.now()),
      },
    });
  }

  // Menghapus kota favorit
  async function prosesHapus(id: number) {
    try {
      await hapusFavorit(id);

      setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      console.error("ERROR HAPUS FAVORIT:", err);

      if (Platform.OS === "web") {
        window.alert("Gagal menghapus kota favorit.");
      } else {
        Alert.alert("Error", "Gagal menghapus kota favorit.");
      }
    }
  }

  // Konfirmasi sebelum menghapus favorit
  function hapus(id: number, nama: string) {
    if (Platform.OS === "web") {
      const yakin = window.confirm(`Yakin hapus ${nama}?`);

      if (yakin) {
        void prosesHapus(id);
      }

      return;
    }

    Alert.alert("Konfirmasi Hapus", `Yakin hapus ${nama}?`, [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => void prosesHapus(id),
      },
    ]);
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 16,
        }}
      >
        {/* Judul Riwayat */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: colors.text,
          }}
        >
          Riwayat Pencarian
        </Text>

        <Text style={{ color: colors.text }}>
          {riwayat.length} dari 10 pencarian terakhir
        </Text>

        {/* Jika belum ada riwayat */}
        {riwayat.length === 0 && (
          <Text style={{ color: colors.text }}>
            Belum ada riwayat pencarian.
          </Text>
        )}

        {/* Daftar riwayat pencarian */}
        {riwayat.map((kota) => (
          <TouchableOpacity
            key={kota.id}
            onPress={() => bukaKota(kota)}
            style={{
              padding: 14,
              backgroundColor: colors.card,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {kota.name}
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: colors.text,
                marginTop: 4,
              }}
            >
              Ketuk untuk melihat cuaca
            </Text>
          </TouchableOpacity>
        ))}

        {/* Judul Kota Favorit */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginTop: 15,
            color: colors.text,
          }}
        >
          Kota Favorit
        </Text>

        <Text style={{ color: colors.text }}>
          Tersimpan {daftarFavorit.length} kota
        </Text>

        {/* Jika belum ada favorit */}
        {daftarFavorit.length === 0 && (
          <Text style={{ color: colors.text }}>Belum ada kota favorit</Text>
        )}

        {/* Daftar kota favorit */}
        {daftarFavorit.map((kota) => (
          <View
            key={kota.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 12,
              borderRadius: 8,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 10,
            }}
          >
            <Text
              style={{
                color: colors.text,
                flex: 1,
              }}
            >
              {kota.nama}
            </Text>

            <Button
              title="Hapus"
              color="#DC2626"
              onPress={() => hapus(kota.id, kota.nama)}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
