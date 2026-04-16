import ScrollSection from "../ScrollSection";

const layananList = [
  {
    title: "Ujian Online Terintegrasi",
    desc: "Buat ujian dengan timer otomatis, random soal, dan kunci jawaban. Terintegrasi dengan kurikulum MTs Madani.",
  },
  {
    title: "Monitoring Real-time",
    desc: "Pantau aktivitas siswa selama ujian, deteksi kecurangan, dan lihat progres langsung.",
  },
  {
    title: "Riwayat & Analisis",
    desc: "Laporan lengkap hasil ujian, grafik perkembangan, dan penjelasan setiap soal.",
  },
];

export default function LayananSection() {
  return (
    <section>
      <ScrollSection>
        <div className="max-w-6xl mx-auto px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 text-center mb-8 sm:mb-12 border-b-2 border-blue-300 inline-block w-full pb-2 sm:pb-4">
            Layanan Platform Ujian Digital
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {layananList.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-blue-100 hover:shadow-xl transition hover:-translate-y-2"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-blue-800 mb-3 sm:mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ScrollSection>
    </section>
  );
}
