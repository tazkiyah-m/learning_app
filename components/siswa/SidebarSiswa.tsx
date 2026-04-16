"use client";

interface SidebarSiswaProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  namaSiswa: string;
  onGantiNama: () => void;
  onLogout: () => void;
}

export default function SidebarSiswa({
  activeMenu,
  setActiveMenu,
  namaSiswa,
  onGantiNama,
  onLogout,
}: SidebarSiswaProps) {
  const menus = [
    { key: "beranda", label: "Beranda" },
    { key: "ujian-tersedia", label: "Ujian Tersedia" },
    { key: "riwayat", label: "Riwayat" },
  ];

  return (
    <aside className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-blue-100 p-5 self-stretch flex flex-col">
      {/* Profil Siswa */}
      <div className="mb-6 pb-4 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
            {namaSiswa.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{namaSiswa}</p>
            <p className="text-xs text-blue-600">Siswa</p>
          </div>
        </div>
        <button
          onClick={onGantiNama}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition"
        >
          Ganti Nama
        </button>
      </div>

      {/* Menu */}
      <nav className="space-y-1 flex-1">
        {menus.map((menu) => (
          <button
            key={menu.key}
            onClick={() => setActiveMenu(menu.key)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              activeMenu === menu.key
                ? "bg-blue-50 text-blue-700 font-medium border-l-3 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {menu.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="mt-4 w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
      >
        Keluar
      </button>
    </aside>
  );
}
