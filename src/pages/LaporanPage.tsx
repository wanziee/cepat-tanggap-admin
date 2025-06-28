import { useEffect, useState } from "react";
import { getApi } from "../utils/api";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Link, useSearchParams } from "react-router-dom";

type Laporan = {
  id: number;
  user_id: string;
  kategori: string;
  deskripsi: string;
  foto: string;
  lokasi: string;
  status: string;
  kd_laporan: string;
  created_at: string;
  updated_at: string;
  user?: {
    nik: string;
    nama: string;
    email: string;
    role: string;
  };
};

export const LaporanPage = () => {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");
  const [laporans, setLaporans] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLaporans = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      try {
        const api = getApi();
        const res = await api.get("/api/laporan");
        const data = res.data?.data ?? res.data;

        if (!Array.isArray(data)) throw new Error("Format data tidak valid");

        // 🔍 Filter berdasarkan query `status`, jika bukan allLaporan
        const filtered =
          statusFilter === "allLaporan" || !statusFilter
            ? data
            : data.filter((lap) => lap.status === statusFilter);

        setLaporans(filtered);
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 401) {
          setError("Sesi Anda telah berakhir. Silakan login kembali.");
          window.location.href = "/login";
        } else {
          setError(
            `Gagal memuat data: ${err.response?.data?.message || err.message}`
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLaporans();
  }, [statusFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
        role="alert"
      >
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-0 lg:p-3">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {statusFilter === "pending"
            ? "Laporan Masuk"
            : statusFilter === "diproses"
            ? "Laporan Diproses"
            : statusFilter === "selesai"
            ? "Laporan Selesai"
            : "Semua Laporan"}
        </h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama Pelapor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Foto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Permasalahan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Lokasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {laporans.map((lap) => (
                <tr key={lap.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {lap.user?.nama || "Tidak diketahui"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {lap.kategori}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {lap.foto ? (
                      <img
                        src={`http://localhost:3000${lap.foto}`}
                        alt="Laporan"
                        className="h-30 w-100 object-cover rounded-sm"
                      />
                    ) : (
                      <span className="text-gray-400 italic">
                        Tidak ada foto
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {lap.deskripsi}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {lap.lokasi}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lap.status === "selesai"
                          ? "bg-green-100 text-green-800"
                          : lap.status === "diproses"
                          ? "bg-yellow-100 text-yellow-800"
                          : lap.status === "pending"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800" 
                      }`}
                    >
                      {lap.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative group mr-4 p-2">
                      <Link
                        to={`/laporan/${lap.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </Link>
                      <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-10
                        before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-t-gray-800"
                      >
                        Detail
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {laporans.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Tidak ada laporan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
