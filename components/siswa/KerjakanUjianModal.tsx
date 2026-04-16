"use client";

import { useState, useEffect } from "react";
import { useSiswa } from "@/context/SiswaContext";

interface KerjakanUjianModalProps {
  isOpen: boolean;
  onClose: () => void;
  ujianId: string;
  ujianNama: string;
  jumlahSoal: number;
}

const generateSoal = (jumlah: number) => {
  return Array.from({ length: jumlah }, (_, i) => ({
    id: i + 1,
    pertanyaan: `Soal nomor ${i + 1}: Berapakah hasil dari ${Math.floor(Math.random() * 20)} + ${Math.floor(Math.random() * 20)}?`,
    pilihan: ["A. 10", "B. 15", "C. 20", "D. 25"],
    jawabanBenar: ["C. 20", "D. 25"][Math.floor(Math.random() * 2)],
  }));
};

export default function KerjakanUjianModal({
  isOpen,
  onClose,
  ujianId,
  ujianNama,
  jumlahSoal,
}: KerjakanUjianModalProps) {
  const { selesaikanUjianOtomatis } = useSiswa();
  const [soal, setSoal] = useState<any[]>([]);
  const [jawaban, setJawaban] = useState<{ [key: number]: string }>({});
  const [waktuTersisa, setWaktuTersisa] = useState(30 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && jumlahSoal > 0) {
      setSoal(generateSoal(jumlahSoal));
      setJawaban({});
      setWaktuTersisa(30 * 60);
      const timer = setInterval(() => {
        setWaktuTersisa((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, jumlahSoal]);

  const handlePilihJawaban = (soalId: number, jawaban: string) => {
    setJawaban((prev) => ({ ...prev, [soalId]: jawaban }));
  };

  const handleSubmit = () => {
    if (Object.keys(jawaban).length < soal.length) {
      alert("Harap jawab semua soal terlebih dahulu!");
      return;
    }
    setIsSubmitting(true);
    let benar = 0;
    soal.forEach((s) => {
      if (jawaban[s.id] === s.jawabanBenar) benar++;
    });
    const nilai = Math.round((benar / soal.length) * 100);
    selesaikanUjianOtomatis(ujianId, nilai);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const menit = Math.floor(waktuTersisa / 60);
  const detik = waktuTersisa % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-blue-800">{ujianNama}</h3>
          <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-md">
            {menit}:{detik < 10 ? `0${detik}` : detik}
          </div>
        </div>
        <div className="p-6 space-y-6">
          {soal.map((s) => (
            <div
              key={s.id}
              className="border-b border-gray-100 pb-4 last:border-0"
            >
              <p className="font-medium text-gray-800 mb-3">{s.pertanyaan}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {s.pilihan.map((p: string) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="radio"
                      name={`soal-${s.id}`}
                      value={p}
                      checked={jawaban[s.id] === p}
                      onChange={() => handlePilihJawaban(s.id, p)}
                      className="accent-blue-600"
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {isSubmitting ? "Menyimpan..." : "Selesaikan Ujian"}
          </button>
        </div>
      </div>
    </div>
  );
}
