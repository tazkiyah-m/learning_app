"use client";

import { useEffect, useState } from "react";

interface Siswa {
  id: number;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

interface DetailSiswa {
  siswa: { id: number; name: string; email: string };
  riwayat: Array<{
    id: number;
    judul: string;
    mataPelajaran: string;
    nilai: number;
    tanggal: string;
  }>;
}

export default function MonitoringSiswa() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<DetailSiswa | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSiswa = async () => {
    try {
      const res = await fetch("/api/guru/semua-siswa");
      const data = await res.json();
      if (res.ok) setSiswaList(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiswa();
    const interval = setInterval(fetchSiswa, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/guru/detail-siswa/${id}`);
      const data = await res.json();
      if (res.ok) setSelectedSiswa(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center text-gray-600">Memuat data siswa...</div>
    );
  if (siswaList.length === 0)
    return (
      <div className="p-4 text-center text-gray-600">
        Tidak ada siswa terdaftar.
      </div>
    );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Monitoring Siswa
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {siswaList.map((siswa) => (
          <div
            key={siswa.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition"
            onClick={() => handleDetail(siswa.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-800">{siswa.name}</p>
                <p className="text-sm text-gray-500">{siswa.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Terdaftar: {siswa.createdAt}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  siswa.status === "online"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {siswa.status === "online" ? "Online" : "Offline"}
              </span>
            </div>
            <button className="mt-3 text-blue-600 text-sm hover:underline">
              Lihat Detail →
            </button>
          </div>
        ))}
      </div>

      {/* Modal detail siswa */}
      {selectedSiswa && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSiswa(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedSiswa.siswa.name}
              </h3>
              <button
                onClick={() => setSelectedSiswa(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <p className="text-gray-600 mb-2">
              Email: {selectedSiswa.siswa.email}
            </p>
            <h4 className="font-semibold mt-4 mb-2 text-gray-800">
              Riwayat Ujian:
            </h4>
            {selectedSiswa.riwayat.length === 0 ? (
              <p className="text-gray-500">Belum pernah mengerjakan ujian.</p>
            ) : (
              <div className="space-y-2">
                {selectedSiswa.riwayat.map((r) => (
                  <div
                    key={r.id}
                    className="border p-2 rounded flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{r.judul}</p>
                      <p className="text-sm text-gray-500">
                        {r.mataPelajaran} - {r.tanggal}
                      </p>
                    </div>
                    <span className="font-bold text-blue-700">{r.nilai}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
