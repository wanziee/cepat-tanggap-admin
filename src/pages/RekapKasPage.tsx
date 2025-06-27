import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getApi } from "../utils/api";
import html2pdf from "html2pdf.js";

type KasItem = {
  id: number;
  tanggal: string;
  keterangan: string;
  jenis: "pemasukan" | "pengeluaran";
  jumlah: number;
  saldo: number;
};

export const RekapKasPage = () => {
  const [searchParams] = useSearchParams();
  const rt = searchParams.get("rt");

  const hiddenRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [data, setData] = useState<KasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterJenis, setFilterJenis] = useState<"semua" | "pemasukan" | "pengeluaran">("semua");

  useEffect(() => {
    const fetchKas = async () => {
      try {
        const query = new URLSearchParams();
        if (rt) query.append("rt", rt);

        const api = getApi();
        const res = await api.get(`/api/rekap-kas?${query.toString()}`);
        const kasData = res.data?.data;

        if (!Array.isArray(kasData)) throw new Error("Format data tidak valid.");

        kasData.sort((a: KasItem, b: KasItem) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

        setData(kasData);
      } catch (err: any) {
        setError("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchKas();
  }, [rt]);

  const formatMonth = (tanggal: string) =>
    new Date(tanggal).toLocaleString("id-ID", { month: "long", year: "numeric" });

  const groupedByMonth = data.reduce((acc: Record<string, KasItem[]>, item) => {
    const key = formatMonth(item.tanggal);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const handlePrintPDF = (month: string) => {
    const input = hiddenRefs.current[month];
    if (!input) {
      alert("Data belum siap dicetak.");
      return;
    }

    const opt = {
      margin: 0.5,
      filename: `rekap-kas-${month}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(input)
      .save()
      .catch((err: any) => {
        console.error("Error generating PDF:", err);
        alert("Gagal menghasilkan PDF.");
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-indigo-500 rounded-full" />
      </div>
    );
  }

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">💰 Rekap Kas {rt && `RT ${rt}`}</h1>

      <div className="flex justify-end mb-4">
        <select
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value as any)}
          className="border border-gray-300 text-sm px-3 py-2 rounded shadow-sm"
        >
          <option value="semua">Semua Jenis</option>
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>
      </div>

      {Object.entries(groupedByMonth).map(([month, items]) => {
        const filteredItems =
          filterJenis === "semua" ? items : items.filter((item) => item.jenis === filterJenis);

        const totalPemasukan = items
          .filter((item) => item.jenis === "pemasukan")
          .reduce((sum, item) => sum + item.jumlah, 0);

        const totalPengeluaran = items
          .filter((item) => item.jenis === "pengeluaran")
          .reduce((sum, item) => sum + item.jumlah, 0);

        const saldoTerakhir = items.length > 0 ? items[0].saldo : 0;

        return (
          <div key={month} className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold text-indigo-700">{month}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded shadow-sm">
                <p className="text-green-800 font-medium">Total Pemasukan</p>
                <p className="text-lg font-bold text-green-700 mt-1">
                  Rp{totalPemasukan.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded shadow-sm">
                <p className="text-red-800 font-medium">Total Pengeluaran</p>
                <p className="text-lg font-bold text-red-700 mt-1">
                  Rp{totalPengeluaran.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-3 rounded shadow-sm">
                <p className="text-indigo-800 font-medium">Saldo Terakhir</p>
                <p className="text-lg font-bold text-indigo-700 mt-1">
                  Rp{saldoTerakhir.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="overflow-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                <thead className="bg-indigo-50 text-indigo-700 text-left">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Keterangan</th>
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3 text-right">Jumlah</th>
                    <th className="px-4 py-3 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">{item.tanggal}</td>
                      <td className="px-4 py-2">{item.keterangan}</td>
                      <td className="px-4 py-2 capitalize">{item.jenis}</td>
                      <td className="px-4 py-2 text-right">Rp{item.jumlah.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-2 text-right">Rp{item.saldo.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Elemen tersembunyi untuk PDF */}
            <div
              ref={(el: HTMLDivElement | null): void => {
  hiddenRefs.current[month] = el;
}}
              style={{ position: "absolute", left: "-9999px", top: "0" }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>{month}</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr>
                    {["Tanggal", "Keterangan", "Jenis", "Jumlah", "Saldo"].map((text) => (
                      <th key={text} style={{ border: "1px solid black", padding: "5px", textAlign: "left" }}>
                        {text}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ border: "1px solid black", padding: "5px" }}>{item.tanggal}</td>
                      <td style={{ border: "1px solid black", padding: "5px" }}>{item.keterangan}</td>
                      <td style={{ border: "1px solid black", padding: "5px" }}>{item.jenis}</td>
                      <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
                        Rp{item.jumlah.toLocaleString("id-ID")}
                      </td>
                      <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
                        Rp{item.saldo.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handlePrintPDF(month)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 mt-2 rounded shadow"
              >
                Cetak PDF
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};



//           <div
//   key={month}
//   ref={(el: HTMLDivElement | null) => {
//     sectionRefs.current[month] = el;
//   }}
//   className="space-y-4 border-t pt-6"
// ></div>