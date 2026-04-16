"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import Link from "next/link";

interface RiwayatItem {
  id: number;
  judul: string;
  mataPelajaran: string;
  nilai: number;
  tanggal: string;
}

export default function RiwayatList() {
  const { user } = useUser();
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRiwayat = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/siswa/riwayat/${user.id}`);
      const data = await res.json();
      if (res.ok) setRiwayat(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, [user]);

  const handleHapus = async (id: number) => {
    if (!confirm("Yakin ingin menghapus riwayat ini?")) return;
    try {
      const res = await fetch(`/api/siswa/hapus-riwayat/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Riwayat dihapus");
        fetchRiwayat();
      } else {
        alert("Gagal menghapus");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    }
  };

  if (loading)
    return (
      <div className="bg-white p-4 rounded shadow text-gray-600">
        Memuat riwayat...
      </div>
    );
  if (riwayat.length === 0)
    return (
      <div className="bg-white p-4 rounded shadow text-gray-600">
        Belum ada ujian yang diselesaikan.
      </div>
    );

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Riwayat Ujian
      </h2>
      <div className="space-y-3">
        {riwayat.map((item) => (
          <div
            key={item.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-gray-800">{item.judul}</p>
              <p className="text-sm text-gray-500">
                {item.mataPelajaran} · {item.tanggal}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-blue-700">{item.nilai}</span>
              <Link
                href={`/siswa/hasil/${item.id}`}
                className="text-blue-600 text-sm hover:underline"
              >
                Detail
              </Link>
              <button
                onClick={() => handleHapus(item.id)}
                className="text-red-500 text-sm hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
