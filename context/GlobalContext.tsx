"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Ujian } from "./SiswaContext";

type GlobalContextType = {
  semuaUjian: Ujian[]; // ujian yang dibuat guru (status: tersedia)
  tambahUjian: (ujian: Ujian) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Data awal (bisa kosong atau beberapa contoh)
const initialUjian: Ujian[] = [
  {
    id: "1",
    nama: "Matematika Dasar",
    jumlahSoal: 5,
    durasi: 30,
    deadline: "25 Apr 2025",
    status: "tersedia",
  },
  {
    id: "2",
    nama: "IPA – Sistem Tata Surya",
    jumlahSoal: 5,
    durasi: 25,
    deadline: "28 Apr 2025",
    status: "tersedia",
  },
  {
    id: "3",
    nama: "Bahasa Indonesia - Teks Deskripsi",
    jumlahSoal: 10,
    durasi: 40,
    deadline: "30 Apr 2025",
    status: "tersedia",
  },
];

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [semuaUjian, setSemuaUjian] = useState<Ujian[]>(initialUjian);

  const tambahUjian = (ujian: Ujian) => {
    setSemuaUjian((prev) => [...prev, { ...ujian, status: "tersedia" }]);
  };

  return (
    <GlobalContext.Provider value={{ semuaUjian, tambahUjian }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobal must be used within GlobalProvider");
  return context;
}
