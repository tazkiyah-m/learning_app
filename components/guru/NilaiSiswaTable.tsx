"use client";

import { useEffect, useState } from "react";

interface Nilai {
  siswa: string;
  email: string;
  mataPelajaran: string;
  nilai: number;
  tanggal: string;
  ujianId: number;
}

export default function NilaiSiswaTable() {
  const [data, setData] = useState<Nilai[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNilai = async () => {
      try {
        const res = await fetch("/api/guru/semua-nilai");
        const result = await res.json();
        if (res.ok) setData(result.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNilai();
    // Refresh setiap 10 detik (opsional)
    const interval = setInterval(fetchNilai, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return <div className="p-4 text-center">Memuat data nilai...</div>;
  if (data.length === 0)
    return <div className="p-4 text-center">Belum ada nilai dari siswa.</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Nilai Siswa</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                Siswa
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                Email
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                Mata Pelajaran
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                Nilai
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                Tanggal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 text-gray-800">{item.siswa}</td>
                <td className="px-4 py-2 text-gray-600">{item.email}</td>
                <td className="px-4 py-2 text-gray-600">
                  {item.mataPelajaran}
                </td>
                <td className="px-4 py-2 font-bold text-blue-700">
                  {item.nilai}
                </td>
                <td className="px-4 py-2 text-gray-500 text-sm">
                  {item.tanggal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
