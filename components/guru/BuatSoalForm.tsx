"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

interface MataPelajaran {
  id: number;
  nama: string;
}

interface Soal {
  teks: string;
  tipe: "pilihan_ganda" | "essai";
  pilihanA: string;
  pilihanB: string;
  pilihanC: string;
  pilihanD: string;
  jawabanBenar: string;
  penjelasan: string;
}

export default function BuatSoalForm() {
  const { user } = useUser();
  const [judul, setJudul] = useState("");
  const [mataPelajaranId, setMataPelajaranId] = useState(0);
  const [durasi, setDurasi] = useState(30);
  const [soalList, setSoalList] = useState<Soal[]>([
    {
      teks: "",
      tipe: "pilihan_ganda",
      pilihanA: "",
      pilihanB: "",
      pilihanC: "",
      pilihanD: "",
      jawabanBenar: "",
      penjelasan: "",
    },
  ]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/mata-pelajaran")
      .then((res) => res.json())
      .then((data) => setMapelList(data.data || []))
      .catch(console.error);
  }, []);

  const tambahSoal = () => {
    setSoalList([
      ...soalList,
      {
        teks: "",
        tipe: "pilihan_ganda",
        pilihanA: "",
        pilihanB: "",
        pilihanC: "",
        pilihanD: "",
        jawabanBenar: "",
        penjelasan: "",
      },
    ]);
  };

  const hapusSoal = (idx: number) => {
    const newList = [...soalList];
    newList.splice(idx, 1);
    setSoalList(newList);
  };

  const handleSoalChange = (idx: number, field: string, value: any) => {
    const newList = [...soalList];
    newList[idx] = { ...newList[idx], [field]: value };
    setSoalList(newList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/ujian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          mataPelajaranId,
          durasi,
          createdBy: user.id,
          soal: soalList,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Ujian berhasil dibuat!");
        setJudul("");
        setMataPelajaranId(0);
        setDurasi(30);
        setSoalList([
          {
            teks: "",
            tipe: "pilihan_ganda",
            pilihanA: "",
            pilihanB: "",
            pilihanC: "",
            pilihanD: "",
            jawabanBenar: "",
            penjelasan: "",
          },
        ]);
      } else {
        setMessage(data.message || "Gagal membuat ujian");
      }
    } catch (err) {
      setMessage("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-5">
        Buat Ujian Baru
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Judul Ujian
          </label>
          <input
            type="text"
            required
            className="w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mata Pelajaran
            </label>
            <select
              required
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800"
              value={mataPelajaranId}
              onChange={(e) => setMataPelajaranId(Number(e.target.value))}
            >
              <option value={0}>-- Pilih --</option>
              {mapelList.map((mp) => (
                <option key={mp.id} value={mp.id}>
                  {mp.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durasi (menit)
            </label>
            <input
              type="number"
              required
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800"
              value={durasi}
              onChange={(e) => setDurasi(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Daftar Soal
          </label>
          <div className="space-y-4">
            {soalList.map((soal, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-800">
                    Soal {idx + 1}
                  </span>
                  {soalList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => hapusSoal(idx)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <textarea
                    placeholder="Teks soal"
                    rows={2}
                    className="w-full border border-gray-300 rounded-md p-2 text-gray-800"
                    value={soal.teks}
                    onChange={(e) =>
                      handleSoalChange(idx, "teks", e.target.value)
                    }
                    required
                  />
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name={`tipe-${idx}`}
                        checked={soal.tipe === "pilihan_ganda"}
                        onChange={() =>
                          handleSoalChange(idx, "tipe", "pilihan_ganda")
                        }
                        className="mr-1"
                      />{" "}
                      Pilihan Ganda
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name={`tipe-${idx}`}
                        checked={soal.tipe === "essai"}
                        onChange={() => handleSoalChange(idx, "tipe", "essai")}
                        className="mr-1"
                      />{" "}
                      Esai
                    </label>
                  </div>
                  {soal.tipe === "pilihan_ganda" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        placeholder="Pilihan A"
                        className="border border-gray-300 rounded-md p-2 text-gray-800"
                        value={soal.pilihanA}
                        onChange={(e) =>
                          handleSoalChange(idx, "pilihanA", e.target.value)
                        }
                      />
                      <input
                        placeholder="Pilihan B"
                        className="border border-gray-300 rounded-md p-2 text-gray-800"
                        value={soal.pilihanB}
                        onChange={(e) =>
                          handleSoalChange(idx, "pilihanB", e.target.value)
                        }
                      />
                      <input
                        placeholder="Pilihan C"
                        className="border border-gray-300 rounded-md p-2 text-gray-800"
                        value={soal.pilihanC}
                        onChange={(e) =>
                          handleSoalChange(idx, "pilihanC", e.target.value)
                        }
                      />
                      <input
                        placeholder="Pilihan D"
                        className="border border-gray-300 rounded-md p-2 text-gray-800"
                        value={soal.pilihanD}
                        onChange={(e) =>
                          handleSoalChange(idx, "pilihanD", e.target.value)
                        }
                      />
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-gray-700 mb-1">
                          Jawaban Benar
                        </label>
                        <select
                          className="border border-gray-300 rounded-md p-2 text-gray-800 w-full"
                          value={soal.jawabanBenar}
                          onChange={(e) =>
                            handleSoalChange(
                              idx,
                              "jawabanBenar",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">-- Pilih --</option>
                          <option>A</option>
                          <option>B</option>
                          <option>C</option>
                          <option>D</option>
                        </select>
                      </div>
                    </div>
                  )}
                  {soal.tipe === "essai" && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Kunci Jawaban (pedoman)
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md p-2 text-gray-800"
                        rows={2}
                        value={soal.jawabanBenar}
                        onChange={(e) =>
                          handleSoalChange(idx, "jawabanBenar", e.target.value)
                        }
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Penjelasan Jawaban
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-800"
                      rows={2}
                      placeholder="Penjelasan untuk siswa (akan muncul setelah ujian selesai)"
                      value={soal.penjelasan}
                      onChange={(e) =>
                        handleSoalChange(idx, "penjelasan", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={tambahSoal}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Tambah Soal
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${message.includes("berhasil") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 rounded-md transition disabled:opacity-50"
        >
          Simpan Ujian
        </button>
      </form>
    </div>
  );
}
