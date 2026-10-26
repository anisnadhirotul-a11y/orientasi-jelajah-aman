import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

import AtribusiCuaca from "../../components/AtribusiCuaca";
import SearchBox from "../../components/SearchBox";
import StatusData from "../../components/StatusData";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useDebounce } from "../../hooks/use-debounce";

import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";

import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";

import { cariKota } from "../../services/geocodingService";

import {
  ambilKoordinatSaatIni,
  mintaIzinLokasi,
} from "../../services/locationService";

import { simpanRiwayat } from "../../services/riwayatStorage";
import { konversiTingkatAQI } from "../../services/weatherAdapter";

import type {
  HasilCuacaOffline,
  RingkasanKotaTersimpan,
} from "../../types/cache";

import type { HasilGeocoding } from "../../types/geocoding";

export default function HalamanUtama() {
  // Mengambil warna dari tema aplikasi
  const { colors } = useTheme();

  // Menerima parameter dari halaman Riwayat
  const { kotaId, kotaNama, kotaLat, kotaLon, kotaCountry, waktuBuka } =
    useLocalSearchParams<{
      kotaId?: string;
      kotaNama?: string;
      kotaLat?: string;
      kotaLon?: string;
      kotaCountry?: string;
      waktuBuka?: string;
    }>();

  // State aplikasi
  const [teksCari, setTeksCari] = useState("");

  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);

  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);

  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);

  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    [],
  );

  const [sedangMemuat, setSedangMemuat] = useState(false);

  const [pesanError, setPesanError] = useState<string | null>(null);

  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);
  const waktuBukaTerakhirRef = useRef<string | null>(null);

  // Memuat daftar kota yang tersimpan
  async function muatKotaTersimpan() {
    try {
      const daftar = await daftarKotaTersimpan();
      setKotaTersimpan(daftar);
    } catch (err) {
      console.error("ERROR CACHE KOTA:", err);
    }
  }

  // Menghapus cache kota yang dipilih
  async function prosesHapusCache(kunci: string) {
    try {
      await hapusCacheKota(kunci);
      await muatKotaTersimpan();
    } catch (err) {
      console.error("ERROR HAPUS CACHE:", err);

      if (Platform.OS === "web") {
        window.alert("Gagal menghapus cache kota.");
      } else {
        Alert.alert("Error", "Gagal menghapus cache kota.");
      }
    }
  }

  // Konfirmasi sebelum menghapus cache
  function konfirmasiHapusCache(kunci: string, nama: string) {
    if (Platform.OS === "web") {
      const yakin = window.confirm(`Yakin ingin menghapus cache ${nama}?`);

      if (yakin) {
        void prosesHapusCache(kunci);
      }

      return;
    }

    Alert.alert(
      "Konfirmasi Hapus Cache",
      `Yakin ingin menghapus cache ${nama}?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            void prosesHapusCache(kunci);
          },
        },
      ],
    );
  }

  // Membersihkan cache lama saat aplikasi dibuka
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(() => muatKotaTersimpan())
      .catch((err) => {
        console.error("ERROR BERSIHKAN CACHE:", err);
      });
  }, []);

  // Pencarian kota
  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }

    let aktif = true;

    cariKota(teksTertunda)
      .then((data) => {
        if (aktif) {
          setHasilPencarian(data);
        }
      })
      .catch((err) => {
        console.error("ERROR CARI KOTA:", err);

        if (aktif) {
          setHasilPencarian([]);
        }
      });

    return () => {
      aktif = false;
    };
  }, [teksTertunda]);

  // Mengambil data cuaca menggunakan offline-first
  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);

    const idSaatIni = ++requestIdRef.current;

    setSedangMemuat(true);
    setPesanError(null);

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui },
      );

      if (idSaatIni !== requestIdRef.current) {
        return;
      }

      setHasil(data);

      // Menyimpan riwayat pencarian
      if (!paksaPerbarui && kota.id !== -1) {
        try {
          await simpanRiwayat(kota);
        } catch (err) {
          console.error("ERROR SIMPAN RIWAYAT:", err);
        }
      }

      await muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) {
        return;
      }

      console.error("ERROR PILIH KOTA:", err);

      setHasil(null);

      setPesanError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data cuaca.",
      );
    } finally {
      if (idSaatIni === requestIdRef.current) {
        setSedangMemuat(false);
      }
    }
  }

  // Membuka kota yang dipilih dari halaman Riwayat
  useEffect(() => {
    if (!kotaId || !kotaNama || !kotaLat || !kotaLon || !waktuBuka) {
      return;
    }

    // Mencegah permintaan yang sama diproses berulang
    if (waktuBukaTerakhirRef.current === waktuBuka) {
      return;
    }

    const id = Number(kotaId);
    const latitude = Number(kotaLat);
    const longitude = Number(kotaLon);

    if (
      !Number.isFinite(id) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    waktuBukaTerakhirRef.current = waktuBuka;

    const kota: HasilGeocoding = {
      id,
      name: kotaNama,
      latitude,
      longitude,
      country: kotaCountry || "",
    };

    setTeksCari("");
    setHasilPencarian([]);

    void pilihKota(kota);
  }, [kotaId, kotaNama, kotaLat, kotaLon, kotaCountry, waktuBuka]);

  // Menggunakan lokasi GPS saat ini
  async function gunakanLokasiSaatIni() {
    try {
      const status = await mintaIzinLokasi();

      if (status === "denied") {
        setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual.");
        return;
      }

      if (status === "unavailable") {
        setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini.");
        return;
      }

      setPesanLokasi(null);

      const koordinat = await ambilKoordinatSaatIni();

      await pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch (err) {
      console.error("ERROR LOKASI:", err);

      setPesanLokasi("Gagal mengambil lokasi. Silakan coba lagi.");
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScrollView
        style={{
          backgroundColor: colors.background,
        }}
        contentContainerStyle={{
          padding: 16,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Pencarian kota */}
        <SearchBox onCari={setTeksCari} />

        <Button
          title="Gunakan Lokasi Saat Ini"
          onPress={gunakanLokasiSaatIni}
          color={colors.primary}
        />

        {/* Pesan lokasi */}
        {pesanLokasi && (
          <Text
            accessibilityLabel={pesanLokasi}
            style={{
              color: colors.text,
            }}
          >
            {pesanLokasi}
          </Text>
        )}

        {/* Hasil pencarian kota */}
        {hasilPencarian.map((kota) => (
          <TouchableOpacity
            key={kota.id}
            onPress={() => pilihKota(kota)}
            style={{
              backgroundColor: colors.card,
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: 16,
              }}
            >
              {kota.name}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Daftar kota tersimpan */}
        {kotaTersimpan.length > 0 && (
          <View
            style={{
              gap: 8,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                color: colors.text,
              }}
            >
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>

            {kotaTersimpan.map((k) => (
              <View
                key={k.kunci}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 10,
                  gap: 10,
                  backgroundColor: colors.card,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                  }}
                  onPress={() =>
                    pilihKota({
                      id: k.id,
                      name: k.nama,
                      latitude: k.latitude,
                      longitude: k.longitude,
                      country: "",
                    })
                  }
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 15,
                    }}
                  >
                    {k.nama}
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Hapus Cache"
                  color="#DC2626"
                  onPress={() => konfirmasiHapusCache(k.kunci, k.nama)}
                />
              </View>
            ))}
          </View>
        )}

        {/* Loading */}
        {sedangMemuat && (
          <ActivityIndicator color={colors.primary} size="large" />
        )}

        {/* Pesan error */}
        {pesanError && (
          <View
            style={{
              padding: 12,
              backgroundColor: colors.card,
              borderRadius: 8,
              gap: 8,
            }}
          >
            <Text
              accessibilityLabel={pesanError}
              style={{
                color: colors.text,
              }}
            >
              {pesanError}
            </Text>

            <Button
              title="Coba Lagi"
              color={colors.primary}
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}

        {/* Menampilkan data cuaca */}
        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />

            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
            />

            <Text
              style={{
                fontSize: 12,
                color: colors.text,
              }}
            >
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}{" "}
              {"\u2022"} Angin {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>

            <Button
              title="Perbarui Sekarang"
              color={colors.primary}
              onPress={() => pilihKota(kotaTerpilih, true)}
            />

            <Button
              title="Tambahkan ke Favorit"
              color={colors.primary}
              onPress={() =>
                router.push({
                  pathname: "/tambah-favorit",
                  params: {
                    id: String(kotaTerpilih.id),
                    nama: kotaTerpilih.name,
                    lat: String(kotaTerpilih.latitude),
                    lon: String(kotaTerpilih.longitude),
                  },
                })
              }
            />
          </>
        )}

        {/* Atribusi sumber data cuaca */}
        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
