"use client";

import { useState } from "react";
import { useSiswa } from "@/context/SiswaContext";
import KerjakanUjianModal from "./KerjakanUjianModal";

export default function UjianAktifCard() {
  const { ujianAktif } = useSiswa();
  const [selectedUjian, setSelectedUjian] = useState<{
    id: string;
    nama: string;
    jumlahSoal: number;
  } | null>(null);

  if (ujianAktif.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 text-center text-gray-500">
        Tidak ada ujian aktif.
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5">
        <h3 className="text-md font-semibold text-blue-800 mb-3">
          Ujian Aktif
        </h3>
        <div className="divide-y divide-gray-100">
          {ujianAktif.map((ujian) => (
            <div
              key={ujian.id}
              className="flex justify-between items-center py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-gray-800">{ujian.nama}</p>
                <p className="text-xs text-gray-500">
                  {ujian.jumlahSoal} soal · {ujian.durasi} menit
                </p>
              </div>
              <button
                onClick={() =>
                  setSelectedUjian({
                    id: ujian.id,
                    nama: ujian.nama,
                    jumlahSoal: ujian.jumlahSoal,
                  })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-md transition"
              >
                Kerjakan
              </button>
            </div>
          ))}
        </div>
      </div>
      {selectedUjian && (
        <KerjakanUjianModal
          isOpen={!!selectedUjian}
          onClose={() => setSelectedUjian(null)}
          ujianId={selectedUjian.id}
          ujianNama={selectedUjian.nama}
          jumlahSoal={selectedUjian.jumlahSoal}
        />
      )}
    </>
  );
}
