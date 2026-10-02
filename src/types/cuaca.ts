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
  indeksAQI?: number; 
}

export interface LaporanUdara {
  kota: string;
  indeksAQI: number;
  tingkat: TingkatAQI;
  diperbaruiPada: string;
}