"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { SiswaProvider } from "@/context/SiswaContext";
import SidebarSiswa from "@/components/siswa/SidebarSiswa";
import RataNilaiCard from "@/components/siswa/RataNilaiCard";
import UjianTersediaList from "@/components/siswa/UjianTersediaList";
import RiwayatList from "@/components/siswa/RiwayatList";

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useUser();
  const [activeMenu, setActiveMenu] = useState("beranda");
  const [namaSiswa, setNamaSiswa] = useState(user?.name || "Siswa");

  // Redirect jika tidak login
  useEffect(() => {
    if (!user) {
      router.push("/");
    } else {
      setNamaSiswa(user.name);
    }
  }, [user, router]);

  // Kirim ping aktivitas setiap 30 detik
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        await fetch("/api/update-activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
      } catch (err) {
        console.error("Failed to update activity", err);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleGantiNama = () => {
    const namaBaru = prompt("Masukkan nama baru:", namaSiswa);
    if (namaBaru && namaBaru.trim()) setNamaSiswa(namaBaru.trim());
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null; // jangan render sebelum redirect

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <SidebarSiswa
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            namaSiswa={namaSiswa}
            onGantiNama={handleGantiNama}
            onLogout={handleLogout}
          />
          <main className="flex-1">
            {activeMenu === "beranda" && (
              <>
                <div className="mb-6">
                  <RataNilaiCard />
                </div>
                <UjianTersediaList />
              </>
            )}
            {activeMenu === "ujian-tersedia" && <UjianTersediaList />}
            {activeMenu === "riwayat" && <RiwayatList />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardSiswa() {
  return (
    <SiswaProvider>
      <DashboardContent />
    </SiswaProvider>
  );
}
