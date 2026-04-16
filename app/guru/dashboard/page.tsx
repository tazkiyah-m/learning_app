"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import SidebarGuru from "@/components/guru/SidebarGuru";
import OverviewCards from "@/components/guru/OverviewCards";
import SiswaOnlineList from "@/components/guru/SiswaOnlineList";
import BuatSoalForm from "@/components/guru/BuatSoalForm";
import KelolaUjianList from "@/components/guru/KelolaUjianList";
import MonitoringSiswa from "@/components/guru/MonitoringSiswa";
import NilaiSiswaTable from "@/components/guru/NilaiSiswaTable";

export default function DashboardGuru() {
  const router = useRouter();
  const { user, logout } = useUser();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [totalUjian, setTotalUjian] = useState(0);
  const [totalSiswa, setTotalSiswa] = useState(0);

  useEffect(() => {
    if (!user) router.push("/");
    const fetchStats = async () => {
      try {
        const [ujianRes, siswaRes] = await Promise.all([
          fetch("/api/total-ujian"),
          fetch("/api/total-siswa"),
        ]);
        const ujianData = await ujianRes.json();
        const siswaData = await siswaRes.json();
        setTotalUjian(ujianData.total || 0);
        setTotalSiswa(siswaData.total || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [user, router]);

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <>
            <OverviewCards totalUjian={totalUjian} totalSiswa={totalSiswa} />
            <div className="mt-6">
              <SiswaOnlineList />
            </div>
          </>
        );
      case "buat-soal":
        return <BuatSoalForm />;
      case "kelola-ujian":
        return <KelolaUjianList />;
      case "monitoring":
        return <MonitoringSiswa />;
      case "nilai-siswa":
        return <NilaiSiswaTable />;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <SidebarGuru activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
          <main className="flex-1 space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-900">
                Dashboard Guru
              </h1>
              <button
                onClick={handleLogout}
                className="text-red-500 text-sm hover:underline"
              >
                Logout
              </button>
            </div>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
