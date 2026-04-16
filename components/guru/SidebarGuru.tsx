"use client";

interface SidebarGuruProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export default function SidebarGuru({
  activeMenu,
  setActiveMenu,
}: SidebarGuruProps) {
  const menus = [
    { key: "dashboard", label: "Dashboard" },
    { key: "buat-soal", label: "Buat Soal" },
    { key: "kelola-ujian", label: "Kelola Ujian" },
    { key: "monitoring", label: "Monitoring" },
    { key: "nilai-siswa", label: "Nilai Siswa" },
  ];

  return (
    <aside className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-blue-100 p-5 self-stretch flex flex-col">
      <h2 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-100 pb-2">
        Menu Guru
      </h2>
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
    </aside>
  );
}
