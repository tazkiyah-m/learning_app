"use client";

import { useEffect, useState } from "react";

interface ActiveStudent {
  id: number;
  name: string;
  email: string;
  lastActivity: string;
}

export default function SiswaOnlineList() {
  const [students, setStudents] = useState<ActiveStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveStudents = async () => {
    try {
      const res = await fetch("/api/active-students");
      const data = await res.json();
      if (res.ok && data.data) {
        setStudents(data.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Failed to fetch active students", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveStudents();
    const interval = setInterval(fetchActiveStudents, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5 text-center text-gray-500">
        Memuat data siswa...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5">
      <h3 className="text-md font-semibold text-blue-800 mb-3">
        Siswa Aktif (5 menit terakhir)
      </h3>
      {students.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Tidak ada siswa aktif saat ini
        </p>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0"
            >
              <div>
                <p className="font-medium text-gray-800">{student.name}</p>
                <p className="text-xs text-gray-400">{student.email}</p>
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                aktif {student.lastActivity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
