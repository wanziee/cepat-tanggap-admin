import {
  UserIcon,
  MapIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApi } from "../utils/api";

type User = {
  nama: string;
  email: string;
  nik: string;
  role: string;
  no_hp: string;
};

type Laporan = {
  id: number;
  kategori: string;
  deskripsi: string;
  foto?: string;
  lokasi: string;
  status: "pending" | "diproses" | "selesai";
  createdAt: string;
  user?: User;
};

const statusColorMap: Record<Laporan["status"], string> = {
  pending: "bg-red-100 text-red-800",
  diproses: "bg-yellow-100 text-yellow-800",
  selesai: "bg-green-100 text-green-800",
};

export const LaporanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const api = getApi();
        const res = await api.get(`/api/laporan/${id}`);
        setLaporan(res.data.data);
      } catch {
        setError("Gagal memuat detail laporan");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!laporan)
    return <p className="text-gray-600">Laporan tidak ditemukan.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Tombol Kembali */}

      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-4"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Kembali
      </button>

      <div className="text-sm text-gray-600 mb-4 flex items-center space-x-1">
        <Link to="/laporan" className="text-gray-400 hover:underline">
          Laporan
        </Link>
        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
        <span className="text-gray-400 font-medium">Laporan #{laporan.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Detail Laporan */}
        <div className="lg:col-span-3 order-2 lg:order-1 bg-white p-6 rounded-lg shadow divide-y divide-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📝 Detail Laporan
          </h2>
          <div className="space-y-4 pb-4">
            <p>
              <strong>Kategori:</strong> {laporan.kategori}
            </p>
            <p className="flex items-center text-gray-700">
              <MapPinIcon className="w-5 h-5 mr-2" />
              {laporan.lokasi}
            </p>
            <p className="flex items-center text-gray-700">
              <CalendarIcon className="w-5 h-5 mr-2" />
              {new Date(laporan.createdAt).toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`ml-2 px-2 py-1 text-sm rounded-full ${
                  statusColorMap[laporan.status]
                }`}
              >
                {laporan.status.toUpperCase()}
              </span>
            </p>
          </div>
          <div className="pt-4">
            <p className="font-medium">Deskripsi:</p>
            <p className="text-gray-600">{laporan.deskripsi}</p>
          </div>
        </div>

        {/* Foto */}
        {laporan.foto && (
          <div className="lg:col-span-3 order-1 lg:order-2">
            <img
              src={`http://localhost:3000${laporan.foto}`}
              alt="Foto Laporan"
              className="w-full h-64 object-cover rounded-lg shadow"
            />
          </div>
        )}

        {/* Detail Pelapor */}
        <div className="lg:col-span-3 order-3 bg-white p-6 rounded-lg shadow divide-y divide-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            👤 Detail Pelapor
          </h2>
          <div className="space-y-4 text-gray-700 pt-2">
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 mr-2" /> {laporan.user?.nama || "-"}
            </div>
            <div className="flex items-center">
              <MapIcon className="w-5 h-5 mr-2" /> {laporan.user?.email || "-"}
            </div>
            <div className="flex items-center">
              <PhoneIcon className="w-5 h-5 mr-2" />{" "}
              {laporan.user?.no_hp || "-"}
            </div>
            <div className="flex items-center">
              <span className="w-5 h-5 mr-2" /> <strong>Role:</strong>{" "}
              {laporan.user?.role || "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
