import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getApi } from "../utils/api";
import html2canvas from 'html2canvas'; // Import html2canvas
import { jsPDF } from 'jspdf';         // Import jsPDF

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

  const hiddenRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [data, setData] = useState<KasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterJenis, setFilterJenis] = useState<"semua" | "pemasukan" | "pengeluaran">("semua");

  useEffect(() => {
    const fetchKas = async () => {
      try {
        setLoading(true);
        setError("");
        const query = new URLSearchParams();
        if (rt) query.append("rt", rt);

        const api = getApi();
        const res = await api.get(`/api/rekap-kas?${query.toString()}`);
        const kasData = res.data?.data;

        if (!Array.isArray(kasData)) {
          throw new Error("Format data tidak valid dari server.");
        }

        kasData.sort((a: KasItem, b: KasItem) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

        setData(kasData);
      } catch (err: any) {
        console.error("Failed to fetch kas data:", err);
        setError("Gagal memuat data rekap kas.");
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
    const input = hiddenRefs.current.get(month);
    if (!input) {
      alert("Elemen untuk pencetakan PDF belum siap atau tidak ditemukan.");
      console.error("PDF element not found for month:", month);
      return;
    }

    console.log(`[DEBUG] PDF input for ${month}:`, input.innerHTML);

    // Memberi waktu lebih banyak bagi browser untuk merender elemen tersembunyi
    setTimeout(() => {
      html2canvas(input, {
        scale: 2, // Anda bisa coba 1 atau 2. Lebih tinggi = lebih tajam, tapi bisa masalah di browser tertentu.
        useCORS: true, // Penting jika ada gambar dari domain lain
        logging: true, // Aktifkan ini untuk melihat log html2canvas di konsol
        // allowTaint: true, // Coba ini jika ada masalah dengan gambar cross-origin
        scrollY: -window.scrollY // Fix for capturing elements not at the top of the viewport
      })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png'); // Gunakan 'image/png' untuk kualitas lebih baik
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm', // Ubah unit menjadi 'mm' untuk perhitungan yang lebih mudah dengan A4
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        let position = 0; // Posisi vertikal di PDF

        // Jika gambar terlalu tinggi untuk satu halaman, pecah menjadi beberapa halaman
        if (imgHeight > pdfHeight) {
          let heightLeft = imgHeight;
          while (heightLeft > 0) {
            const pageHeight = Math.min(pdfHeight, heightLeft);
            // Menambahkan gambar ke PDF. Parameter: data, format, x, y, width, height
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight);
            heightLeft -= pageHeight;
            position -= pdfHeight; // Pindah ke bagian selanjutnya dari gambar untuk halaman berikutnya

            if (heightLeft > 0) {
              pdf.addPage();
            }
          }
        } else {
          // Jika gambar muat dalam satu halaman
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        }

        pdf.save(`rekap-kas-${month}.pdf`);
      })
      .catch((err) => {
        console.error("Error generating PDF with html2canvas and jsPDF:", err);
        alert("Gagal menghasilkan PDF. Mohon periksa konsol untuk detailnya.");
      });
    }, 500); // Delay tetap 500ms
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-indigo-500 rounded-full" />
        <p className="ml-3 text-indigo-700">Memuat data kas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center">
        <p>{error}</p>
        <p>Silakan coba muat ulang halaman.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">💰 Rekap Kas {rt && `RT ${rt}`}</h1>

      <div className="flex justify-end mb-4">
        <label htmlFor="filterJenis" className="sr-only">
          Filter Jenis Transaksi
        </label>
        <select
          id="filterJenis"
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value as any)}
          className="border border-gray-300 text-sm px-3 py-2 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="semua">Semua Jenis</option>
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>
      </div>

      {Object.entries(groupedByMonth).length === 0 && (
        <p className="text-center text-gray-500">Belum ada data kas untuk ditampilkan.</p>
      )}

      {Object.entries(groupedByMonth).map(([month, items]) => {
        const filteredItemsForDisplay =
          filterJenis === "semua" ? items : items.filter((item) => item.jenis === filterJenis);

        const itemsForCalculations = items; // Untuk total di UI, tidak tergantung filter jenis

        const totalPemasukan = itemsForCalculations
          .filter((item) => item.jenis === "pemasukan")
          .reduce((sum, item) => sum + item.jumlah, 0);

        const totalPengeluaran = itemsForCalculations
          .filter((item) => item.jenis === "pengeluaran")
          .reduce((sum, item) => sum + item.jumlah, 0);

        const saldoTerakhirBulanIni = items.length > 0 ? items[0].saldo : 0;

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
                <p className="text-indigo-800 font-medium">Saldo Terakhir Bulan Ini</p>
                <p className="text-lg font-bold text-indigo-700 mt-1">
                  Rp{saldoTerakhirBulanIni.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
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
                  {filteredItemsForDisplay.length > 0 ? (
                    filteredItemsForDisplay.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2">{item.tanggal}</td>
                        <td className="px-4 py-2">{item.keterangan}</td>
                        <td className="px-4 py-2 capitalize">{item.jenis}</td>
                        <td className="px-4 py-2 text-right">Rp{item.jumlah.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-2 text-right">Rp{item.saldo.toLocaleString("id-ID")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
                        Tidak ada data untuk filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/*
              Elemen tersembunyi yang akan dicetak ke PDF.
              Ini harus berisi semua data yang ingin Anda lihat di PDF.
            */}
            <div
              ref={(el) => {
                if (el) hiddenRefs.current.set(month, el);
                else hiddenRefs.current.delete(month);
              }}
              style={{
                position: "absolute",
                left: "-9999px",
                top: "-9999px",
                width: "210mm", // Lebar A4 dalam mm
                padding: "20mm", // Padding untuk konten PDF
                boxSizing: "border-box",
                backgroundColor: "white",
                zIndex: -1,
                // height: "fit-content", // Pastikan elemen bisa tumbuh sesuai kontennya
                // overflow: "hidden", // Ini bisa tetap, tapi tidak sepenting sebelumnya
              }}
            >
              <h2 style={{ fontSize: "16pt", fontWeight: "bold", marginBottom: "15pt", textAlign: "center", fontFamily: "sans-serif" }}>
                Rekap Kas Bulan {month} {rt && `RT ${rt}`}
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt", fontFamily: "sans-serif", border: "1pt solid #ccc" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f2f2f2" }}>
                    {["Tanggal", "Keterangan", "Jenis", "Jumlah", "Saldo"].map((text) => (
                      <th
                        key={text}
                        style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: text === "Jumlah" || text === "Saldo" ? "right" : "left", fontWeight: "bold" }}
                      >
                        {text}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ border: "1pt solid #ccc", padding: "8pt" }}>{item.tanggal}</td>
                        <td style={{ border: "1pt solid #ccc", padding: "8pt" }}>{item.keterangan}</td>
                        <td style={{ border: "1pt solid #ccc", padding: "8pt", textTransform: "capitalize" }}>{item.jenis}</td>
                        <td style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right" }}>Rp{item.jumlah.toLocaleString("id-ID")}</td>
                        <td style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right" }}>Rp{item.saldo.toLocaleString("id-ID")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "center", color: "#888" }}>
                        Tidak ada data untuk bulan ini.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: "#f9f9f9" }}>
                    <td colSpan={3} style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right", fontWeight: "bold" }}>Total Pemasukan:</td>
                    <td colSpan={2} style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right", fontWeight: "bold", color: "green" }}>Rp{totalPemasukan.toLocaleString("id-ID")}</td>
                  </tr>
                  <tr style={{ backgroundColor: "#f9f9f9" }}>
                    <td colSpan={3} style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right", fontWeight: "bold" }}>Total Pengeluaran:</td>
                    <td colSpan={2} style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right", fontWeight: "bold", color: "red" }}>Rp{totalPengeluaran.toLocaleString("id-ID")}</td>
                  </tr>
                  <tr style={{ backgroundColor: "#e6e6ff" }}>
                    <td colSpan={3} style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right", fontWeight: "bold" }}>Saldo Terakhir Bulan Ini:</td>
                    <td colSpan={2} style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right", fontWeight: "bold", color: "blue" }}>Rp{saldoTerakhirBulanIni.toLocaleString("id-ID")}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handlePrintPDF(month)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 mt-2 rounded shadow transition duration-150 ease-in-out"
              >
                Cetak PDF {month}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};