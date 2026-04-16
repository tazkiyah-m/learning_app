"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

interface Ujian {
  id: number;
  judul: string;
  mataPelajaran: string;
  durasi: number;
  createdAt: string;
}

export default function UjianTersediaList() {
  const { user } = useUser();
  const [ujian, setUjian] = useState<Ujian[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchUjian = async () => {
      try {
        const res = await fetch(`/api/siswa/ujian-tersedia?siswaId=${user.id}`);
        const data = await res.json();
        if (res.ok) setUjian(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUjian();
  }, [user]);

  if (loading)
    return (
      <div className="bg-white p-4 rounded shadow text-gray-600">Memuat...</div>
    );
  if (ujian.length === 0)
    return (
      <div className="bg-white p-4 rounded shadow text-gray-600">
        Belum ada ujian tersedia.
      </div>
    );

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Ujian Tersedia
      </h2>
      <div className="space-y-3">
        {ujian.map((u) => (
          <div
            key={u.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-gray-800">{u.judul}</p>
              <p className="text-sm text-gray-500">
                {u.mataPelajaran} · {u.durasi} menit
              </p>
            </div>
            <Link
              href={`/siswa/ujian/${u.id}`}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              Mulai
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
