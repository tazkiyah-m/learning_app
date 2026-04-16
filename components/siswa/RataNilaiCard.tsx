"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

export default function RataNilaiCard() {
  const { user } = useUser();
  const [rata, setRata] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchRata = async () => {
      try {
        const res = await fetch(`/api/siswa/rata-rata/${user.id}`);
        const data = await res.json();
        setRata(data.rataRata || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRata();
  }, [user]);

  if (loading)
    return (
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5 text-gray-600">
        Memuat...
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5">
      <h3 className="text-md font-semibold text-gray-800 mb-2">
        Rata-rata Nilai
      </h3>
      <p className="text-3xl font-bold text-blue-700">{rata}</p>
    </div>
  );
}
