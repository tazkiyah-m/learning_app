"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

interface Soal {
  id: number;
  teks: string;
  tipe: "pilihan_ganda" | "essai";
  pilihanA?: string;
  pilihanB?: string;
  pilihanC?: string;
  pilihanD?: string;
  jawabanBenar: string;
  penjelasan: string;
}

export default function KerjakanUjian() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [soal, setSoal] = useState<Soal[]>([]);
  const [durasi, setDurasi] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawaban, setJawaban] = useState<{ [key: number]: string }>({});
  const [feedback, setFeedback] = useState<{
    [key: number]: { benar: boolean; penjelasan: string };
  }>({});
  const [selesai, setSelesai] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [waktuTersisa, setWaktuTersisa] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    const fetchSoal = async () => {
      try {
        const res = await fetch(`/api/siswa/ujian/${id}`);
        const data = await res.json();
        if (res.ok && data.soal) {
          setSoal(data.soal);
          setDurasi(data.durasi);
          setWaktuTersisa(data.durasi * 60);
        } else {
          alert("Gagal mengambil soal: " + (data.message || ""));
          router.push("/siswa/dashboard");
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat memuat soal.");
        router.push("/siswa/dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSoal();
  }, [id, user, router]);

  useEffect(() => {
    if (waktuTersisa <= 0 || selesai) return;
    const timer = setInterval(() => {
      setWaktuTersisa((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Waktu habis! Ujian akan dikumpulkan.");
          handleSubmitOtomatis();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [waktuTersisa, selesai]);

  const handleJawabanChange = (soalId: number, value: string) => {
    setJawaban((prev) => ({ ...prev, [soalId]: value }));
  };

  const handleCekJawaban = () => {
    const currentSoal = soal[currentIndex];
    if (!currentSoal) return;
    const jawabanUser = jawaban[currentSoal.id];
    if (!jawabanUser) {
      alert("Pilih jawaban dulu!");
      return;
    }
    const benar = jawabanUser === currentSoal.jawabanBenar;
    const penjelasan =
      currentSoal.penjelasan ||
      (benar ? "Jawaban Anda benar!" : "Jawaban salah. Coba pelajari lagi.");
    setFeedback((prev) => ({
      ...prev,
      [currentSoal.id]: { benar, penjelasan },
    }));
  };

  const nextSoal = () => {
    if (currentIndex + 1 < soal.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSelesai(true);
    }
  };

  const handleSubmitSemua = async () => {
    if (!confirm("Yakin ingin mengumpulkan semua jawaban?")) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/siswa/submit-jawaban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siswaId: user?.id,
          ujianId: parseInt(id as string),
          jawaban: jawaban,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Ujian selesai! Nilai Anda: ${data.nilai}`);
        router.push("/siswa/dashboard");
      } else {
        alert(data.message || "Gagal menyimpan jawaban");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOtomatis = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/siswa/submit-jawaban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siswaId: user?.id,
          ujianId: parseInt(id as string),
          jawaban: jawaban,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Waktu habis! Nilai Anda: ${data.nilai}`);
        router.push("/siswa/dashboard");
      } else {
        alert(data.message || "Gagal menyimpan jawaban");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center text-gray-800">Memuat soal...</div>;
  if (soal.length === 0)
    return <div className="p-8 text-center text-gray-800">Tidak ada soal.</div>;

  const currentSoal = soal[currentIndex];
  const currentFeedback = feedback[currentSoal?.id];
  const menit = Math.floor(waktuTersisa / 60);
  const detik = waktuTersisa % 60;

  if (selesai) {
    const totalBenar = Object.values(feedback).filter((f) => f.benar).length;
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded shadow p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Ujian Selesai
            </h1>
            <p className="mb-4 text-gray-800">
              Anda telah menyelesaikan semua soal.
            </p>
            <p className="mb-4 text-lg font-semibold text-gray-800">
              Skor sementara: {totalBenar} / {soal.length}
            </p>
            <button
              onClick={handleSubmitSemua}
              disabled={submitting}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              {submitting ? "Menyimpan..." : "Kumpulkan Ujian"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">
              Soal {currentIndex + 1} dari {soal.length}
            </h1>
            <div className="bg-red-100 px-3 py-1 rounded-md">
              <span className="text-red-700 font-mono text-lg font-bold">
                {menit.toString().padStart(2, "0")}:
                {detik.toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <p className="font-medium text-gray-800 mb-3">{currentSoal.teks}</p>
            {currentSoal.tipe === "pilihan_ganda" && (
              <div className="ml-4 mt-2 space-y-2">
                <label className="flex items-center gap-2 text-gray-800 cursor-pointer">
                  <input
                    type="radio"
                    name={`soal-${currentSoal.id}`}
                    value="A"
                    onChange={() => handleJawabanChange(currentSoal.id, "A")}
                    className="accent-blue-600"
                  />{" "}
                  <span>A. {currentSoal.pilihanA}</span>
                </label>
                <label className="flex items-center gap-2 text-gray-800 cursor-pointer">
                  <input
                    type="radio"
                    name={`soal-${currentSoal.id}`}
                    value="B"
                    onChange={() => handleJawabanChange(currentSoal.id, "B")}
                    className="accent-blue-600"
                  />{" "}
                  <span>B. {currentSoal.pilihanB}</span>
                </label>
                <label className="flex items-center gap-2 text-gray-800 cursor-pointer">
                  <input
                    type="radio"
                    name={`soal-${currentSoal.id}`}
                    value="C"
                    onChange={() => handleJawabanChange(currentSoal.id, "C")}
                    className="accent-blue-600"
                  />{" "}
                  <span>C. {currentSoal.pilihanC}</span>
                </label>
                <label className="flex items-center gap-2 text-gray-800 cursor-pointer">
                  <input
                    type="radio"
                    name={`soal-${currentSoal.id}`}
                    value="D"
                    onChange={() => handleJawabanChange(currentSoal.id, "D")}
                    className="accent-blue-600"
                  />{" "}
                  <span>D. {currentSoal.pilihanD}</span>
                </label>
              </div>
            )}
            {currentSoal.tipe === "essai" && (
              <textarea
                className="w-full border border-gray-300 p-2 rounded mt-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Tulis jawaban Anda di sini..."
                value={jawaban[currentSoal.id] || ""}
                onChange={(e) =>
                  handleJawabanChange(currentSoal.id, e.target.value)
                }
              />
            )}
          </div>

          {currentFeedback ? (
            <div
              className={`p-4 rounded-md mb-4 ${
                currentFeedback.benar
                  ? "bg-green-100 border-l-4 border-green-600"
                  : "bg-red-100 border-l-4 border-red-600"
              }`}
            >
              <p
                className={`font-bold text-lg ${currentFeedback.benar ? "text-green-800" : "text-red-800"}`}
              >
                {currentFeedback.benar ? "✓ BENAR" : "✗ SALAH"}
              </p>
              <p className="text-gray-800 mt-1">{currentFeedback.penjelasan}</p>
              <button
                onClick={nextSoal}
                className="mt-3 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
              >
                {currentIndex + 1 === soal.length
                  ? "Lihat Hasil Akhir"
                  : "Soal Berikutnya →"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleCekJawaban}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
            >
              Cek Jawaban
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
