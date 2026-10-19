
import * as SQLite from "expo-sqlite";

const NAMA_DATABASE = "jelajah-aman.db";
const VERSI_DATABASE = 2;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Membuka database satu kali untuk seluruh aplikasi
export function ambilDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = bukaDanMigrasi().catch((err) => {
      dbPromise = null;
      throw err;
    });
  }

  return dbPromise;
}

// Membuka database dan menjalankan migrasi
async function bukaDanMigrasi(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(NAMA_DATABASE);

  await migrasiDatabase(db);

  return db;
}

// Membuat tabel dan memperbarui versi database
async function migrasiDatabase(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  const baris = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");

  let versiSaatIni = baris?.user_version ?? 0;

  // Jika database sudah versi terbaru, tidak perlu migrasi
  if (versiSaatIni >= VERSI_DATABASE) return;

  // Migrasi versi pertama
  if (versiSaatIni < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS cache_cuaca (
        kunci TEXT PRIMARY KEY NOT NULL,
        kota_id INTEGER NOT NULL,
        nama_kota TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        cuaca_json TEXT NOT NULL,
        aqi_json TEXT NOT NULL,
        disimpan_pada INTEGER NOT NULL
      );
    `);

    versiSaatIni = 1;
  }

  // Migrasi versi kedua
  if (versiSaatIni < 2) {
    await db.execAsync(
      "ALTER TABLE cache_cuaca ADD COLUMN jumlah_dibuka INTEGER NOT NULL DEFAULT 0;"
    );

    versiSaatIni = 2;
  }

  // Simpan versi database setelah migrasi berhasil
  await db.execAsync(
    "PRAGMA user_version = " + VERSI_DATABASE
  );
}
