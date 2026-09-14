// types/cuaca.ts

export interface DataCuaca {
  kota: string;
  suhu: number;
  kelembaban: number;
  catatan: string;
}

export type TingkatAQI = "BAIK" | "SEDANG" | "TIDAK_SEHAT" | "BERBAHAYA";

export interface WeatherCardProps {
  kota: string;
  suhu: number;
  tingkatAQI: TingkatAQI;
}

export interface LaporanCuaca {
  kota: string;
  indeksAQI: number;
  tingkatAQI: TingkatAQI;
  diperbaruiPada: string;
}
