import ScrollSection from "../ScrollSection";

const beritaList = [
  {
    title: "Penerapan Ujian Digital di MTs Madani",
    date: "20 Maret 2025",
    excerpt:
      "MTs Madani resmi menggunakan platform ujian digital untuk ujian tengah semester.",
  },
  {
    title: "Pelatihan Guru: Manajemen Ujian Online",
    date: "15 Maret 2025",
    excerpt:
      "Para guru MTs Madani mengikuti pelatihan penggunaan fitur monitoring real-time.",
  },
  {
    title: "Webinar Nasional: Transformasi Ujian Madrasah",
    date: "10 Maret 2025",
    excerpt:
      "Kepala MTs Madani menjadi narasumber tentang digitalisasi ujian berbasis madrasah.",
  },
];

export default function BeritaSection() {
  return (
    <section>
      <ScrollSection>
        <div className="max-w-6xl mx-auto px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 text-center mb-8 sm:mb-12 border-b-2 border-blue-300 inline-block w-full pb-2 sm:pb-4">
            Berita & Edukasi MTs Madani
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {beritaList.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100 hover:shadow-xl transition"
              >
                <div className="h-32 sm:h-40 bg-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm sm:text-base">
                  Thumbnail
                </div>
                <div className="p-4 sm:p-6">
                  <p className="text-xs text-gray-400">{item.date}</p>
                  <h3 className="font-bold text-blue-800 text-lg sm:text-xl mt-1 sm:mt-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed">
                    {item.excerpt}
                  </p>
                  <button className="text-blue-600 text-xs sm:text-sm font-medium mt-3 sm:mt-4 hover:underline">
                    Baca Selengkapnya →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollSection>
    </section>
  );
}
