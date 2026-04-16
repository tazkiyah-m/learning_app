"use client";

import { useState } from "react";

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const navItems = [
  { key: "home", label: "Beranda" },
  { key: "tentang", label: "Tentang" },
  { key: "layanan", label: "Layanan" },
  { key: "keunggulan", label: "Keunggulan" },
  { key: "berita", label: "Berita" },
  { key: "kontak", label: "Kontak" },
];

export default function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (key: string) => {
    onNavigate(key);
    setIsOpen(false); // tutup menu setelah navigasi
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-blue-100">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
          Platform Ujian Digital
        </div>

        {/* Desktop menu (hidden di mobile) */}
        <div className="hidden sm:flex gap-5 md:gap-8 text-sm md:text-base">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavigate(item.key)}
              className={`hover:text-blue-700 transition px-1 py-1 whitespace-nowrap ${
                activeSection === item.key
                  ? "text-blue-700 font-semibold border-b-2 border-blue-700"
                  : "text-gray-600"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tombol hamburger (hanya tampil di mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1.5 focus:outline-none"
          aria-label="Menu"
        >
          <span
            className={`block w-6 h-0.5 bg-gray-700 transition-transform duration-300 ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-gray-700 transition-opacity duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-gray-700 transition-transform duration-300 ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Menu dropdown untuk mobile */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 border-t border-blue-100" : "max-h-0"
        }`}
      >
        <div className="flex flex-col py-2 px-4 space-y-1 bg-white/95 backdrop-blur-sm">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavigate(item.key)}
              className={`text-left px-3 py-2 rounded-lg transition ${
                activeSection === item.key
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
