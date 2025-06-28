import {
  ArrowLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getApi } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

type User = {
  nama: string;
  email: string;
  nik: string;
  role: string;
  no_hp: string;
  alamat?: string;
};

type Laporan = {
  id: number;
  kategori: string;
  deskripsi: string;
  foto?: string;
  lokasi: string;
  kd_laporan: string;
  status: "pending" | "diproses" | "selesai" | "ditolak";
  createdAt: string;
  user?: User;
};

const statusColorMap: Record<Laporan["status"], string> = {
  pending: "bg-gray-100 text-gray-800",
  diproses: "bg-yellow-100 text-yellow-800",
  selesai: "bg-green-100 text-green-800",
  ditolak: "bg-red-100 text-red-800",
};

export const LaporanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [laporan, setLaporan] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Laporan["status"]>("pending");
  const [tanggapan, setTanggapan] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const api = getApi();
        const res = await api.get(`/api/laporan/${id}`);
        const data: Laporan = res.data.data;
        setLaporan(data);
        setStatus(data.status);
      } catch {
        setError("Gagal memuat detail laporan");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleSubmit = async () => {
    try {
      const api = getApi();
      const formData = new FormData();

      formData.append("status", status);
      formData.append("tanggapan", tanggapan);
      if (file) {
        formData.append("foto", file);
      }

      await api.put(`/api/laporan/${laporan?.id}/status`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/laporan");
    } catch (err) {
      alert("Gagal menyimpan perubahan.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!laporan) return <p className="text-gray-600">Laporan tidak ditemukan.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
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
        <span className="text-gray-400 font-medium">
          Laporan #{laporan.kd_laporan}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Detail Laporan */}
        <div className="lg:col-span-3 order-2 lg:order-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Detail Laporan</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Kategori:</p>
              <p>{laporan.kategori}</p>
            </div>
            <div>
              <p className="font-semibold">Lokasi:</p>
              <p>{laporan.lokasi}</p>
            </div>
            <div>
              <p className="font-semibold">Tanggal Buat:</p>
              <p>{new Date(laporan.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-semibold">Status:</p>
              <span
                className={`inline-block mt-1 px-2 py-1 text-sm rounded-full ${statusColorMap[laporan.status]}`}
              >
                {laporan.status.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold">Permasalahan:</p>
              <p>{laporan.deskripsi}</p>
            </div>
          </div>

          <hr className="my-6 border-t border-gray-200" />

          {/* Detail Pelapor */}
          <div className="">
            <h2 className="text-xl font-bold text-gray-800 mb-4">👤 Detail Pelapor</h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="font-semibold">Nama:</p>
                <p>{laporan.user?.nama || "-"}</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>{laporan.user?.email?.trim() || "-"}</p>
              </div>
              <div>
                <p className="font-semibold">NIK:</p>
                <p>{laporan.user?.nik || "-"}</p>
              </div>
              <div>
                <p className="font-semibold">Nomor HP:</p>
                <p>{laporan.user?.no_hp || "-"}</p>
              </div>
              <div>
                <p className="font-semibold">Alamat:</p>
                <p>{laporan.user?.alamat || "-"}</p>
              </div>
              <div>
                <p className="font-semibold">Role:</p>
                <p>{laporan.user?.role || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Foto & Form */}
        <div className="lg:col-span-3 order-1 lg:order-2 flex flex-col gap-6">
          {laporan.foto && (
            <img
              src={`http://localhost:3000${laporan.foto}`}
              alt="Foto Laporan"
              className="w-full h-64 object-cover rounded-lg shadow"
            />
          )}

          {/* Form Ubah Status (hanya untuk admin) */}
          {user?.role === "admin" && (
            <div className="space-y-4 bg-white p-6 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700">
                Ubah Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Laporan["status"])}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="ditolak">Ditolak</option>
                <option value="pending">Pending</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
              </select>

              <label className="block text-sm font-medium text-gray-700">
                Tanggapan
              </label>
              <textarea
                value={tanggapan}
                onChange={(e) => setTanggapan(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Masukkan tanggapan..."
                rows={3}
              />

              <label className="block text-sm font-medium text-gray-700">
                Foto Tanggapan
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded"
              />

              {file && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">Preview Foto:</p>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded border"
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Simpan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
