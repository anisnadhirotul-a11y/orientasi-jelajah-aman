import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

// Pilihan tema aplikasi
type ModeTema = "light" | "dark" | "system";

// Daftar warna yang digunakan aplikasi
type WarnaTema = {
  background: string;
  text: string;
  card: string;
  primary: string;
  border: string;
};

// Data yang dibagikan ke seluruh halaman
type ThemeContextType = {
  mode: ModeTema;
  setMode: (mode: ModeTema) => void;
  isDark: boolean;
  colors: WarnaTema;
};

// Kunci penyimpanan tema
const KUNCI_TEMA = "@jelajah_aman:tema";

// Warna untuk Light Mode
const temaTerang: WarnaTema = {
  background: "#FFFFFF",
  text: "#111827",
  card: "#F3F4F6",
  primary: "#2563EB",
  border: "#D1D5DB",
};

// Warna untuk Dark Mode
const temaGelap: WarnaTema = {
  background: "#111827",
  text: "#F9FAFB",
  card: "#1F2937",
  primary: "#60A5FA",
  border: "#374151",
};

// Membuat Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider untuk seluruh aplikasi
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ModeTema>("system");

  const sistem = useColorScheme();

  // Mengambil tema yang sebelumnya disimpan
  useEffect(() => {
    async function muatTema() {
      try {
        const tersimpan = await AsyncStorage.getItem(KUNCI_TEMA);

        if (
          tersimpan === "light" ||
          tersimpan === "dark" ||
          tersimpan === "system"
        ) {
          setModeState(tersimpan);
        }
      } catch (err) {
        console.error("ERROR MEMUAT TEMA:", err);
      }
    }

    void muatTema();
  }, []);

  // Mengubah dan menyimpan pilihan tema
  function setMode(tema: ModeTema) {
    setModeState(tema);

    AsyncStorage.setItem(KUNCI_TEMA, tema).catch((err) => {
      console.error("ERROR SIMPAN TEMA:", err);
    });
  }

  // Menentukan apakah tema gelap aktif
  const isDark = mode === "dark" || (mode === "system" && sistem === "dark");

  // Memilih warna berdasarkan tema
  const colors = isDark ? temaGelap : temaTerang;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        isDark,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Fungsi untuk menggunakan tema di halaman lain
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme harus digunakan di dalam ThemeProvider");
  }

  return context;
}
