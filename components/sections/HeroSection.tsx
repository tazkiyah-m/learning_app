"use client";

import ScrollSection from "../ScrollSection";

interface HeroSectionProps {
  onLoginClick: (role: "siswa" | "guru") => void;
}

export default function HeroSection({ onLoginClick }: HeroSectionProps) {
  return (
    <section className="min-h-[80vh] sm:min-h-[90vh] flex flex-col justify-center">
      <ScrollSection>
        <div className="text-center max-w-4xl mx-auto px-2">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-6">
            Platform Ujian Digital
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-blue-700 mb-4 sm:mb-8">
            Ujian Lebih Mudah, Lebih Cerdas
          </p>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2">
            Sistem ujian online dengan fitur canggih — timer otomatis, kunci
            jawaban, monitoring real-time, dan riwayat lengkap dengan penjelasan
            soal. Dikembangkan khusus untuk MTs Madani Alauddin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <button
              onClick={() => onLoginClick("siswa")}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 sm:py-4 px-6 sm:px-10 rounded-xl shadow-lg transition text-base sm:text-lg"
            >
              Masuk sebagai Siswa
            </button>
            <button
              onClick={() => onLoginClick("guru")}
              className="bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold py-3 sm:py-4 px-6 sm:px-10 rounded-xl shadow-md transition text-base sm:text-lg"
            >
              Masuk sebagai Guru
            </button>
          </div>
        </div>
      </ScrollSection>
    </section>
  );
}
