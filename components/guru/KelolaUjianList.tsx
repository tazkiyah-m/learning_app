"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Ujian {
  id: number;
  judul: string;
  mataPelajaran: string;
  durasi: number;
  createdAt: string;
}

export default function KelolaUjianList() {
  const [ujianList, setUjianList] = useState<Ujian[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUjian = async () => {
    try {
      const res = await fetch("/api/ujian/list");
      const data = await res.json();
      if (res.ok) setUjianList(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUjian();
  }, []);

  const handleHapus = async (id: number) => {
    if (!confirm("Yakin ingin menghapus ujian ini?")) return;
    // Implementasi hapus (tambahkan endpoint DELETE di backend jika perlu)
    alert("Fitur hapus belum tersedia");
  };

  if (loading) return <div className="p-4 text-center">Memuat...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Kelola Ujian</h2>
      {ujianList.length === 0 ? (
        <p className="text-gray-500">Belum ada ujian yang dibuat.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Judul
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Mata Pelajaran
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Durasi
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Tanggal
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ujianList.map((ujian) => (
                <tr key={ujian.id}>
                  <td className="px-4 py-2 text-gray-800">{ujian.judul}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {ujian.mataPelajaran}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {ujian.durasi} menit
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-sm">
                    {ujian.createdAt}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      href={`/guru/ujian/${ujian.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Detail
                    </Link>
                    <button
                      onClick={() => handleHapus(ujian.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
