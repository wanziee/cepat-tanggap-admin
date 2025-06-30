import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { getApi } from "../utils/api";
import {
  UsersIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import "moment/locale/id"; 

moment.locale("id");


type User = {
  id: number;
  nik: string;
  nama: string;
  email: string;
  rt: string;
  rw: string;
  role: string;
  alamat: string;
  no_hp: string;
  created_at: string;
};

type Laporan = {
  id: number;
  user_id: string;
  kategori: string;
  deskripsi: string;
  foto: string;
  lokasi: string;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    nik: string;
    nama: string;
    email: string;
    role: string;
  };
};

const getStatusColorClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "text-yellow-600";
    case "diproses":
      return "text-blue-600";
    case "selesai":
      return "text-green-600";
    case "ditolak":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [laporans, setLaporans] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = getApi();
        const userRes = await api.get("/api/users");
        const laporanRes = await api.get("/api/laporan");

        setUsers(userRes.data.data);
        setLaporans(
          laporanRes.data.data.sort(
            (a: Laporan, b: Laporan) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
        );
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPengguna = users.length;
  const totalWarga = users.filter((u) => u.role === "warga").length;
  const totalLaporan = laporans.length;

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <UserCircleIcon className="h-5 w-5" />
          <span>
            {user.name} ({user.role})
          </span>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${
          user.role === "admin" ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        {user.role === "admin" && (
          <StatCard
            icon={<UsersIcon className="h-6 w-6 text-white" />}
            bgColor="bg-blue-500"
            title="Total Pengguna"
            count={totalPengguna}
          />
        )}

        <StatCard
          icon={<UsersIcon className="h-6 w-6 text-white" />}
          bgColor="bg-green-500"
          title="Total Warga"
          count={totalWarga}
        />

        <StatCard
          icon={<DocumentTextIcon className="h-6 w-6 text-white" />}
          bgColor="bg-yellow-500"
          title="Total Laporan"
          count={totalLaporan}
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Aktivitas Terbaru
        </h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul role="list" className="divide-y divide-gray-200">
            {laporans.slice(0, 5).map((laporan) => (
              <li key={laporan.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-600">
                    {laporan.kategori}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {moment(laporan.created_at).fromNow()}
                  </div>
                </div>
                <div className="mt-1 text-sm text-gray-700 line-clamp-2">
                  {laporan.deskripsi}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Dilaporkan oleh{" "}
                  <span className="font-medium text-gray-900">
                    {laporan.user?.nama || "Pengguna"}
                  </span>{" "}
                  - Status:{" "}
                  <span className={`capitalize font-semibold ${getStatusColorClass(laporan.status)}`}>
                    {laporan.status}
                  </span>
                </div>
              </li>
            ))}
            {laporans.length === 0 && (
              <li className="px-4 py-4 text-gray-500 text-sm">
                Tidak ada laporan terbaru.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Komponen untuk statistik card
const StatCard = ({
  icon,
  bgColor,
  title,
  count,
}: {
  icon: React.ReactNode;
  bgColor: string;
  title: string;
  count: number;
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {count}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);
