"use client";

import { useState } from "react";
import ScrollSection from "../ScrollSection";

export default function KontakSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section>
      <ScrollSection>
        <div className="max-w-3xl mx-auto px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 text-center mb-8 sm:mb-12 border-b-2 border-blue-300 inline-block w-full pb-2 sm:pb-4">
            Hubungi Kami
          </h2>
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 md:p-10 border border-blue-100">
            {submitted ? (
              <div className="text-center text-green-600 py-8 sm:py-12 text-base sm:text-xl">
                Terima kasih! Pesan Anda telah terkirim.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                    Pesan
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 sm:py-3 rounded-lg transition text-base sm:text-lg"
                >
                  Kirim Pesan
                </button>
              </form>
            )}
          </div>
        </div>
      </ScrollSection>
    </section>
  );
}
