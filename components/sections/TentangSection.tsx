import ScrollSection from "../ScrollSection";

export default function TentangSection() {
  return (
    <section>
      <ScrollSection>
        <div className="max-w-5xl mx-auto px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 text-center mb-8 sm:mb-12 border-b-2 border-blue-300 inline-block w-full pb-2 sm:pb-4">
            Tentang MTs Madani Alauddin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-blue-100 order-2 md:order-1">
              <img
                src="https://placehold.co/600x400/e6f0ff/1e40af?text=MTs+Madani+Alauddin"
                alt="MTs Madani Alauddin"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="space-y-4 sm:space-y-6 text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed order-1 md:order-2">
              <p>
                <strong className="text-blue-800">MTs Madani Alauddin</strong>{" "}
                adalah madrasah swasta di Bontotangnga, Gowa, Sulawesi Selatan,
                yang berfungsi sebagai laboratorium sekolah (lab school) di
                bawah naungan Yayasan Keluarga Besar UIN Alauddin Makassar.
              </p>
              <p>
                Madrasah ini berfokus pada keunggulan IMTAQ, IPTEK, akhlak
                terpuji, dan berwawasan lingkungan. Terletak di Bontotangnga,
                Kecamatan Somba Opu, Kabupaten Gowa.
              </p>
              <p>
                <strong>Visi:</strong> Menjadi pusat unggulan pembinaan sumber
                daya manusia yang unggul dalam ilmu pengetahuan, teknologi, dan
                berakhlakul karimah.
              </p>
              <p>
                MTs Madani merupakan bagian dari lembaga pendidikan terpadu yang
                juga mencakup RA, MI, dan MA Madani Alauddin.
              </p>
            </div>
          </div>
        </div>
      </ScrollSection>
    </section>
  );
}
