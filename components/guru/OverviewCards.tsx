"use client";

interface OverviewCardsProps {
  totalUjian: number;
  totalSiswa: number;
}

export default function OverviewCards({
  totalUjian,
  totalSiswa,
}: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5">
        <p className="text-sm text-gray-500">Total Ujian</p>
        <p className="text-3xl font-bold text-blue-700">{totalUjian}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5">
        <p className="text-sm text-gray-500">Total Siswa</p>
        <p className="text-3xl font-bold text-blue-700">{totalSiswa}</p>
      </div>
    </div>
  );
}
