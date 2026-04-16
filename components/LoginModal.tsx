"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: "siswa" | "guru";
}

export default function LoginModal({ isOpen, onClose, role }: LoginModalProps) {
  const router = useRouter();
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal");
        setLoading(false);
        return;
      }

      const userData = data.data || data;
      if (!userData || !userData.id || !userData.role) {
        setError("Respons server tidak valid");
        setLoading(false);
        return;
      }

      if (userData.role !== role) {
        setError(`Akun ini terdaftar sebagai ${userData.role}, bukan ${role}`);
        setLoading(false);
        return;
      }

      login({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });

      if (userData.role === "siswa") {
        router.push("/siswa/dashboard");
      } else {
        router.push("/guru/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(
        "Terjadi kesalahan koneksi ke server. Pastikan backend berjalan.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold text-blue-800 mb-2">
          Masuk sebagai {role === "siswa" ? "Siswa" : "Guru"}
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Masukkan email dan password Anda
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-800 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
            />
          </div>
          <div>
            <label className="block text-gray-800 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
        <p className="text-center text-gray-500 text-xs mt-4">
          Belum punya akun?{" "}
          <a href="/register" className="text-blue-600">
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
}
