"use client";

import { useRef, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import TentangSection from "@/components/sections/TentangSection";
import LayananSection from "@/components/sections/LayananSection";
import KeunggulanSection from "@/components/sections/KeunggulanSection";
import BeritaSection from "@/components/sections/BeritaSection";
import KontakSection from "@/components/sections/KontakSection";
import LoginModal from "@/components/LoginModal";

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [modalOpen, setModalOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<"siswa" | "guru">("siswa");

  const sectionRefs = {
    home: useRef<HTMLElement>(null),
    tentang: useRef<HTMLElement>(null),
    layanan: useRef<HTMLElement>(null),
    keunggulan: useRef<HTMLElement>(null),
    berita: useRef<HTMLElement>(null),
    kontak: useRef<HTMLElement>(null),
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section");
            if (id) setActiveSection(id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px -50% 0px" },
    );

    Object.entries(sectionRefs).forEach(([key, ref]) => {
      if (ref.current) {
        ref.current.setAttribute("data-section", key);
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (sectionKey: string) => {
    const ref = sectionRefs[sectionKey as keyof typeof sectionRefs];
    if (ref.current && typeof window !== "undefined") {
      const yOffset = -80;
      const y =
        ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleLoginClick = (role: "siswa" | "guru") => {
    setLoginRole(role);
    setModalOpen(true);
  };

  return (
    <>
      <Navbar activeSection={activeSection} onNavigate={scrollTo} />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 space-y-24 sm:space-y-32 md:space-y-40">
          <section ref={sectionRefs.home}>
            <HeroSection onLoginClick={handleLoginClick} />
          </section>
          <section ref={sectionRefs.tentang}>
            <TentangSection />
          </section>
          <section ref={sectionRefs.layanan}>
            <LayananSection />
          </section>
          <section ref={sectionRefs.keunggulan}>
            <KeunggulanSection />
          </section>
          <section ref={sectionRefs.berita}>
            <BeritaSection />
          </section>
          <section ref={sectionRefs.kontak}>
            <KontakSection />
          </section>
          <footer className="pt-12 sm:pt-16 pb-6 sm:pb-8 border-t border-blue-200 text-center text-gray-500 text-xs sm:text-sm">
            <p className="text-sm sm:text-base">
              &copy; 2025 Platform Ujian Digital - MTs Madani Alauddin. All
              rights reserved.
            </p>
            <p className="mt-2 sm:mt-3 text-gray-400">
              Bontotangnga, Paccinongan, Somba Opu, Kab. Gowa, Sulawesi Selatan
            </p>
          </footer>
        </div>
      </main>
      <LoginModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        role={loginRole}
      />
    </>
  );
}
