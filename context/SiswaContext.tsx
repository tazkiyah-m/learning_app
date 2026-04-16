"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Ujian = {
  id: string;
  nama: string;
  jumlahSoal: number;
  durasi: number;
  deadline?: string;
  status: "tersedia" | "aktif" | "selesai";
  nilai?: number;
  tanggalSelesai?: string;
};

type SiswaContextType = {
  ujianTersedia: Ujian[];
  ujianAktif: Ujian[];
  riwayat: Ujian[];
  rataRataNilai: number;
  mulaiUjian: (id: string) => void;
  selesaikanUjianOtomatis: (id: string, nilai: number) => void;
  tambahUjianDariGuru: (ujianBaru: Ujian) => void;
};

const SiswaContext = createContext<SiswaContextType | undefined>(undefined);

// 🔥 SEKARANG KOSONG — tidak ada ujian default
const initialTersedia: Ujian[] = [];
const initialAktif: Ujian[] = [];
const initialRiwayat: Ujian[] = [];

export function SiswaProvider({ children }: { children: ReactNode }) {
  const [ujianTersedia, setUjianTersedia] = useState<Ujian[]>(initialTersedia);
  const [ujianAktif, setUjianAktif] = useState<Ujian[]>(initialAktif);
  const [riwayat, setRiwayat] = useState<Ujian[]>(initialRiwayat);

  const hitungRataRata = () => {
    const selesai = riwayat.filter((u) => u.nilai !== undefined);
    if (selesai.length === 0) return 0;
    const total = selesai.reduce((sum, u) => sum + (u.nilai || 0), 0);
    return Math.round(total / selesai.length);
  };

  const mulaiUjian = (id: string) => {
    const ujian = ujianTersedia.find((u) => u.id === id);
    if (ujian) {
      setUjianTersedia((prev) => prev.filter((u) => u.id !== id));
      setUjianAktif((prev) => [...prev, { ...ujian, status: "aktif" }]);
    }
  };

  const selesaikanUjianOtomatis = (id: string, nilai: number) => {
    const ujian = ujianAktif.find((u) => u.id === id);
    if (ujian) {
      setUjianAktif((prev) => prev.filter((u) => u.id !== id));
      setRiwayat((prev) => [
        ...prev,
        {
          ...ujian,
          status: "selesai",
          nilai,
          tanggalSelesai: new Date().toLocaleDateString("id-ID"),
        },
      ]);
    }
  };

  const tambahUjianDariGuru = (ujianBaru: Ujian) => {
    setUjianTersedia((prev) => [...prev, { ...ujianBaru, status: "tersedia" }]);
  };

  return (
    <SiswaContext.Provider
      value={{
        ujianTersedia,
        ujianAktif,
        riwayat,
        rataRataNilai: hitungRataRata(),
        mulaiUjian,
        selesaikanUjianOtomatis,
        tambahUjianDariGuru,
      }}
    >
      {children}
    </SiswaContext.Provider>
  );
}

export function useSiswa() {
  const context = useContext(SiswaContext);
  if (!context) throw new Error("useSiswa must be used within SiswaProvider");
  return context;
}
