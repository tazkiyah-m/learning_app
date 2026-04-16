import ScrollSection from "../ScrollSection";

const keunggulanList = [
  {
    title: "Keamanan Terjamin",
    desc: "Enkripsi data dan sistem anti-curang dengan proctoring.",
  },
  {
    title: "Mudah Digunakan",
    desc: "Antarmuka sederhana untuk guru dan siswa MTs Madani.",
  },
  {
    title: "Dukungan Penuh",
    desc: "Tim support siap membantu kapan saja, termasuk pelatihan.",
  },
  {
    title: "Hemat Biaya",
    desc: "Paket khusus untuk madrasah dengan harga terjangkau.",
  },
];

export default function KeunggulanSection() {
  return (
    <section>
      <ScrollSection>
        <div className="max-w-5xl mx-auto px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 text-center mb-8 sm:mb-12 border-b-2 border-blue-300 inline-block w-full pb-2 sm:pb-4">
            Keunggulan Platform Kami
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {keunggulanList.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shrink-0 mt-1">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-1 sm:mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 sm:mt-12 bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-200 italic text-gray-700 text-sm sm:text-base md:text-lg">
            "MTs Madani Alauddin sering dijadikan tempat penelitian, termasuk
            kajian tentang penerapan manajemen strategi untuk meningkatkan mutu
            pendidikan. Platform ini mendukung riset tersebut."
          </div>
        </div>
      </ScrollSection>
    </section>
  );
}
