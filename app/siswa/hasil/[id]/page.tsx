"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

interface DetailSoal {
  soalId: number;
  teks: string;
  tipe: "pilihan_ganda" | "essai";
  pilihanA?: string;
  pilihanB?: string;
  pilihanC?: string;
  pilihanD?: string;
  jawabanUser: string;
  jawabanBenar: string;
  benar: boolean;
  penjelasan: string;
}

interface HasilDetail {
  id: number;
  judul: string;
  mataPelajaran: string;
  nilai: number;
  detail: DetailSoal[];
}

export default function DetailRiwayat() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [data, setData] = useState<HasilDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/siswa/hasil/${id}`);
        const result = await res.json();
        if (res.ok) {
          setData(result);
        } else {
          setError(result.message || "Gagal memuat detail");
        }
      } catch (err) {
        setError("Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, user, router]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600">Memuat detail...</div>
    );
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data)
    return (
      <div className="p-8 text-center text-gray-600">Data tidak ditemukan</div>
    );

  const detailList = data.detail || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Kembali
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{data.judul}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>{data.mataPelajaran}</span>
            <span>Nilai: {data.nilai}</span>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
            Pembahasan Soal
          </h2>
          {detailList.length === 0 ? (
            <p className="text-gray-500">Tidak ada detail soal.</p>
          ) : (
            <div className="space-y-6">
              {detailList.map((soal, idx) => (
                <div
                  key={soal.soalId}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <p className="font-medium text-gray-800">
                    {idx + 1}. {soal.teks || "(Teks soal tidak tersedia)"}
                  </p>
                  {soal.tipe === "pilihan_ganda" && (
                    <div className="ml-6 mt-2 space-y-1 text-gray-700">
                      <p>A. {soal.pilihanA}</p>
                      <p>B. {soal.pilihanB}</p>
                      <p>C. {soal.pilihanC}</p>
                      <p>D. {soal.pilihanD}</p>
                      <p className="text-green-700 font-medium mt-2">
                        Jawaban Benar: {soal.jawabanBenar}
                      </p>
                    </div>
                  )}
                  {soal.tipe === "essai" && (
                    <div className="ml-6 mt-2 text-gray-700">
                      <p>Kunci Jawaban: {soal.jawabanBenar}</p>
                    </div>
                  )}
                  <p className="text-gray-700 mt-2">
                    Jawaban Anda: {soal.jawabanUser || "(kosong)"}
                  </p>
                  {soal.penjelasan && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md border-l-4 border-blue-500">
                      <p className="text-sm font-semibold text-blue-800">
                        Penjelasan:
                      </p>
                      <p className="text-sm text-gray-700">{soal.penjelasan}</p>
                    </div>
                  )}
                  <p
                    className={
                      soal.benar ? "text-green-600 mt-2" : "text-red-600 mt-2"
                    }
                  >
                    {soal.benar ? "✓ Benar" : "✗ Salah"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
