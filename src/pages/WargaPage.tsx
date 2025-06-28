import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getApi } from "../utils/api";
import { UserIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

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

export const WargaPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedRT, setSelectedRT] = useState("semua");
  const [selectedRW, setSelectedRW] = useState("semua");

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      try {
        const api = getApi();
        const res = await api.get("/api/users");
        const data = res.data?.data ?? res.data;

        if (!Array.isArray(data)) throw new Error("Format data tidak valid");

        let warga = data.filter((u: User) => u.role === "warga");

        // Filter sesuai role
if (user?.role === "rt") {
  warga = warga.filter(
    (u) => u.rt?.toString() === user.rt?.toString() && u.rw?.toString() === user.rw?.toString()
  );
} else if (user?.role === "rw") {
  warga = warga.filter((u) => u.rw?.toString() === user.rw?.toString());
}


        setUsers(warga);
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

    fetchUsers();
  }, [user]);

  const handleDelete = async (userId: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;

    try {
      const api = getApi();
      await api.delete(`/api/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err: any) {
      console.error("Error deleting user:", err);
      alert(err.response?.data?.message || "Gagal menghapus pengguna");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchRT = selectedRT === "semua" || user.rt === selectedRT;
    const matchRW = selectedRW === "semua" || user.rw === selectedRW;
    return matchRT && matchRW;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-0 lg:p-3">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Warga</h1>
        <button
          onClick={() => navigate("/warga/tambah")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <UserIcon className="h-5 w-5 mr-2" />
          Tambah Warga
        </button>
      </div>

      {/* Filter hanya untuk admin */}
      {user?.role === "admin" && (
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Filter RT</label>
            <select
              value={selectedRT}
              onChange={(e) => setSelectedRT(e.target.value)}
              className="ml-2 border border-gray-300 rounded p-1"
            >
              <option value="semua">Semua</option>
              {[...new Set(users.map((u) => u.rt))].map((rt) => (
                <option key={rt} value={rt}>
                  RT {rt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Filter RW</label>
            <select
              value={selectedRW}
              onChange={(e) => setSelectedRW(e.target.value)}
              className="ml-2 border border-gray-300 rounded p-1"
            >
              <option value="semua">Semua</option>
              {[...new Set(users.map((u) => u.rw))].map((rw) => (
                <option key={rw} value={rw}>
                  RW {rw}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RW</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((userItem) => (
                <tr key={userItem.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{userItem.nik}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{userItem.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{userItem.rt}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{userItem.rw}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {!userItem.email?.trim() ? "-" : userItem.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        userItem.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : userItem.role === "rw"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {userItem.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => {}}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(userItem.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={user?.id?.toString() === userItem.id.toString()}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Tidak ada warga ditemukan.
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
