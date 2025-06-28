import { useEffect, useMemo, useState } from "react";
import { getApi } from "../utils/api";

type KasBulananItem = {
  id: number;
  filename: string;
  filepath: string;
  mimetype: string;
  filesize: number;
  description: string;
  uploaded_by_user_id: number;
  related_rt?: string;
  related_rw?: string;
  upload_date: string;
  createdAt: string;
  updatedAt: string;
  uploader?: {
    id: number;
    nama: string;
    email: string;
  };
};

export const PantauKasPage = () => {
  const [kasBulananData, setKasBulananData] = useState<KasBulananItem[]>([]);
  const [filteredData, setFilteredData] = useState<KasBulananItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterRT, setFilterRT] = useState("");
  const [filterRW, setFilterRW] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

  const fetchKasBulanan = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = getApi();
      const response = await api.get("/api/kas-bulanan");
      setKasBulananData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat data kas bulanan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKasBulanan();
  }, []);

  useEffect(() => {
    let data = kasBulananData;

    if (filterRT) {
      data = data.filter((item) => item.related_rt === filterRT);
    }
    if (filterRW) {
      data = data.filter((item) => item.related_rw === filterRW);
    }
    if (filterBulan) {
      data = data.filter(
        (item) => new Date(item.upload_date).getMonth() + 1 === parseInt(filterBulan)
      );
    }
    if (filterTahun) {
      data = data.filter(
        (item) => new Date(item.upload_date).getFullYear().toString() === filterTahun
      );
    }

    setFilteredData(data);
  }, [filterRT, filterRW, filterBulan, filterTahun, kasBulananData]);

const handleViewPdf = (filepath: string) => {
  const baseUrl = getApi().defaults.baseURL;
const fullUrl = `${baseUrl}/uploads/${filepath}`;
  window.open(fullUrl, "_blank");
};


  const rtOptions = useMemo(() => {
    const set = new Set<string>();
    kasBulananData.forEach((item) => {
      if (item.related_rt) set.add(item.related_rt);
    });
    return Array.from(set).sort();
  }, [kasBulananData]);

  const rwOptions = useMemo(() => {
    const set = new Set<string>();
    kasBulananData.forEach((item) => {
      if (item.related_rw) set.add(item.related_rw);
    });
    return Array.from(set).sort();
  }, [kasBulananData]);

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pantau Kas RT</h1>

      {/* Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <select
          value={filterRT}
          onChange={(e) => setFilterRT(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Semua RT</option>
          {rtOptions.map((rt) => (
            <option key={rt} value={rt}>
              RT {rt}
            </option>
          ))}
        </select>

        <select
          value={filterRW}
          onChange={(e) => setFilterRW(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Semua RW</option>
          {rwOptions.map((rw) => (
            <option key={rw} value={rw}>
              RW {rw}
            </option>
          ))}
        </select>

        <select
          value={filterBulan}
          onChange={(e) => setFilterBulan(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Semua Bulan</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((bulan) => (
            <option key={bulan} value={bulan}>
              {new Date(0, bulan - 1).toLocaleString("id-ID", { month: "long" })}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Tahun"
          value={filterTahun}
          onChange={(e) => setFilterTahun(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-10 w-10 border-t-2 border-blue-500 border-b-2 rounded-full" />
          <p className="ml-4 text-blue-700">Memuat data PDF...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center text-gray-500 p-8 border border-gray-200 rounded-md bg-gray-50">
          <p>Tidak ada laporan kas yang ditemukan dengan filter ini.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
            <thead className="bg-blue-50 text-blue-700 text-left">
              <tr>
                <th className="px-4 py-3">Nama File</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3">Diunggah Oleh</th>
                <th className="px-4 py-3">RT/RW</th>
                <th className="px-4 py-3">Tanggal Unggah</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td
                    className="px-4 py-3 font-medium text-blue-600 hover:underline cursor-pointer"
                    onClick={() => handleViewPdf(item.filepath)}
                  >
                    {item.filename}
                  </td>
                  <td className="px-4 py-3">{item.description || "-"}</td>
                  <td className="px-4 py-3">{item.uploader?.nama || "N/A"}</td>
                  <td className="px-4 py-3">
                    {item.related_rt && item.related_rw
                      ? `RT ${item.related_rt}/RW ${item.related_rw}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(item.upload_date).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleViewPdf(item.filepath)}
                      className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs py-1 px-2 rounded-md bg-indigo-50 hover:bg-indigo-100 transition"
                    >
                      Lihat PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
