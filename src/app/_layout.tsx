
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  ThemeProvider,
  useTheme,
} from "../context/ThemeContext";

// Mengatur tampilan navigasi
function NavigasiAplikasi() {
  const { isDark, colors } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="detail/[kota]"
          options={{ title: "Detail Cuaca" }}
        />

        <Stack.Screen
          name="tambah-favorit"
          options={{
            presentation: "modal",
            title: "Tambah Favorit",
          }}
        />
      </Stack>
    </>
  );
}

// Mengaktifkan tema untuk seluruh aplikasi
export default function RootLayout() {
  return (
    <ThemeProvider>
      <NavigasiAplikasi />
    </ThemeProvider>
  );
}
