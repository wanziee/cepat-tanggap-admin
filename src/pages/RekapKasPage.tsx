import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getApi } from "../utils/api";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type KasItem = {
  id: number;
  tanggal: string;
  keterangan: string;
  jenis: "pemasukan" | "pengeluaran";
  jumlah: number;
  saldo: number;
  rt?: string;
  rw?: string;
  user_id?: number;
  created_at?: string;
};

const formatMonthYear = (date: Date) => {
  const monthName = date.toLocaleString("id-ID", { month: "long" });
  const year = date.getFullYear();
  return `${monthName}-${year}`;
};

export const RekapKasPage = () => {
  const [searchParams] = useSearchParams();
  const rtParam = searchParams.get("rt");

  const hiddenRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<KasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [currentRt, setCurrentRt] = useState<string | null>(null);
  const [currentRw, setCurrentRw] = useState<string | null>(null);

  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('');
  const [availableMonthsYears, setAvailableMonthsYears] = useState<string[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formJumlah, setFormJumlah] = useState('');
  const [formJenis, setFormJenis] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().slice(0, 10));

  const currentUserId = 1; // Pastikan ini diisi dengan user ID yang sebenarnya

  const fetchKas = async () => {
    try {
      setLoading(true);
      setError("");
      const query = new URLSearchParams();
      if (rtParam) query.append("rt", rtParam);

      const api = getApi();
      const res = await api.get(`/api/rekap-kas?${query.toString()}`);
      let kasData: KasItem[] = res.data?.data;

      if (!Array.isArray(kasData)) {
        throw new Error("Format data tidak valid dari server.");
      }

      kasData.forEach(item => {
        if (!item.created_at) {
          item.created_at = new Date(item.tanggal).toISOString();
        }
      });

      // Saldo dihitung ulang setiap kali fetch
      kasData.sort((a, b) => {
        const dateA = new Date(a.tanggal).getTime();
        const dateB = new Date(b.tanggal).getTime();
        if (dateA === dateB) {
          return (new Date(a.created_at || 0).getTime() || a.id) - (new Date(b.created_at || 0).getTime() || b.id);
        }
        return dateA - dateB;
      });

      let currentSaldo = 0;
      const processedKasData = kasData.map((item) => {
        const jumlahNum = parseFloat(item.jumlah.toString().replace(/[^0-9.-]+/g,""));
        
        if (item.jenis === "pemasukan") {
          currentSaldo += jumlahNum;
        } else if (item.jenis === "pengeluaran") {
          currentSaldo -= jumlahNum;
        }
        return { ...item, saldo: currentSaldo };
      });

      processedKasData.sort((a, b) => {
          const dateA = new Date(a.tanggal).getTime();
          const dateB = new Date(b.tanggal).getTime();
          if (dateA === dateB) {
              return (new Date(b.created_at || 0).getTime() || b.id) - (new Date(a.created_at || 0).getTime() || a.id);
          }
          return dateB - dateA;
      });

      setData(processedKasData);

      if (processedKasData.length > 0) {
        setCurrentRt(processedKasData[0].rt || null);
        setCurrentRw(processedKasData[0].rw || null);

        const months = new Set<string>();
        processedKasData.forEach(item => {
          months.add(formatMonthYear(new Date(item.tanggal)));
        });
        const sortedMonths = Array.from(months).sort((a, b) => {
          const [monthNameA, yearA] = a.split('-');
          const [monthNameB, yearB] = b.split('-');
          const dateA = new Date(`${monthNameA} 1, ${yearA}`);
          const dateB = new Date(`${monthNameB} 1, ${yearB}`);
          return dateB.getTime() - dateA.getTime();
        });
        setAvailableMonthsYears(sortedMonths);
        if (sortedMonths.length > 0 && !selectedMonthYear) {
            setSelectedMonthYear(sortedMonths[0]);
        }
      } else {
        setCurrentRt(rtParam);
        setCurrentRw(null);
        setAvailableMonthsYears([]);
        setSelectedMonthYear('');
      }

    } catch (err: any) {
      console.error("Failed to fetch or process kas data:", err);
      setError("Gagal memuat atau memproses data rekap kas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKas();
  }, [rtParam]); // Hapus selectedMonthYear dari dependensi, fetchKas akan trigger jika berhasil POST

  const filteredDataByMonth = useMemo(() => {
    if (!selectedMonthYear) {
      return [];
    }
    return data.filter(item => formatMonthYear(new Date(item.tanggal)) === selectedMonthYear);
  }, [data, selectedMonthYear]);

  const itemsForSelectedMonth = filteredDataByMonth;
  const totalPemasukanSelectedMonth = itemsForSelectedMonth
    .filter((item) => item.jenis === "pemasukan")
    .reduce((sum, item) => sum + item.jumlah, 0);

  const totalPengeluaranSelectedMonth = itemsForSelectedMonth
    .filter((item) => item.jenis === "pengeluaran")
    .reduce((sum, item) => sum + item.jumlah, 0);

  const saldoTerakhirSelectedMonth = itemsForSelectedMonth.length > 0
    ? itemsForSelectedMonth[0].saldo
    : 0;


  const handlePrintPDF = () => {
    const input = hiddenRef.current;
    if (!input || !selectedMonthYear) {
      alert("Elemen untuk pencetakan PDF belum siap atau belum ada bulan yang dipilih.");
      console.error("PDF element not found or no month selected.");
      return;
    }

    console.log(`[DEBUG] PDF input for ${selectedMonthYear}:`, input.innerHTML);

    let filename = `Laporan_Kas_${selectedMonthYear}`;
    if (currentRt) {
      filename += `_RT${currentRt}`;
    }
    if (currentRw) {
      filename += `_RW${currentRw}`;
    }
    filename += `.pdf`;

    setTimeout(() => {
      html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: true,
        scrollY: -window.scrollY
      })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        let position = 0;

        if (imgHeight > pdfHeight) {
          let heightLeft = imgHeight;
          while (heightLeft > 0) {
            const pageHeight = Math.min(pdfHeight, heightLeft);
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight);
            heightLeft -= pageHeight;
            position -= pdfHeight;

            if (heightLeft > 0) {
              pdf.addPage();
            }
          }
        } else {
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        }

        pdf.save(filename);
      })
      .catch((err) => {
        console.error("Error generating PDF with html2canvas and jsPDF:", err);
        alert("Gagal menghasilkan PDF. Mohon periksa konsol untuk detailnya.");
      });
    }, 500);
  };

  const handleAddKas = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formKeterangan || !formJumlah || !formTanggal || parseFloat(formJumlah) <= 0) {
      alert('Mohon lengkapi semua field dengan benar.');
      return;
    }

    try {
      setLoading(true);
      const api = getApi();
      const payload = {
        keterangan: formKeterangan,
        jenis: formJenis,
        jumlah: parseFloat(formJumlah),
        tanggal: formTanggal,
        rt: currentRt,
        rw: currentRw,
        user_id: currentUserId,
        // Hapus field 'saldo' dari payload. Backend yang akan menghitungnya.
        // saldo: saldoTerakhirSelectedMonth // <--- BARIS INI DIHAPUS
      };

      await api.post('/api/rekap-kas', payload);

      setFormKeterangan('');
      setFormJumlah('');
      setFormJenis('pemasukan');
      setFormTanggal(new Date().toISOString().slice(0, 10));
      setShowForm(false);

      // Setelah data ditambahkan, panggil ulang fetchKas untuk memuat data terbaru
      // ini akan memastikan saldo juga dihitung ulang dengan benar
      await fetchKas(); 
      alert('Data kas berhasil ditambahkan!');

    } catch (err: any) {
      console.error("Failed to add kas data:", err);
      setError("Gagal menambahkan data kas. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
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
    <div className="max-w-6xl mx-auto p-6 ">
      <h1 className="text-2xl font-bold text-gray-800 mb-3">
      Rekap Kas {currentRt && `RT ${currentRt}`} {currentRw && `RW ${currentRw}`}
      </h1>

      <div className="flex justify-between items-center mb-4">


        <div className="flex gap-2">
          <label htmlFor="filterMonthYear" className="sr-only">
            Pilih Bulan dan Tahun
          </label>
          <select
            id="filterMonthYear"
            value={selectedMonthYear}
            onChange={(e) => setSelectedMonthYear(e.target.value)}
            className="border border-gray-300 text-sm px-3 py-2 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Pilih Bulan & Tahun --</option>
            {availableMonthsYears.map(my => (
              <option key={my} value={my}>{my}</option>
            ))}
          </select>
        </div>
                <button
          onClick={() => setShowForm(true)}
          className="bg-[#0B39AA] hover:bg-[#2F57C6] text-white px-4 py-2 rounded shadow transition duration-150 ease-in-out"
        >
          + Tambah Transaksi
        </button>
      </div>

      {/* Modal / Form Tambah Kas */}
      {showForm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Tambah Transaksi Kas</h2>
            <form onSubmit={handleAddKas} className="space-y-4">
              <div>
                <label htmlFor="formTanggal" className="block text-sm font-medium text-gray-700">Tanggal</label>
                <input
                  type="date"
                  id="formTanggal"
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="formKeterangan" className="block text-sm font-medium text-gray-700">Keterangan</label>
                <input
                  type="text"
                  id="formKeterangan"
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Contoh: Iuran warga Januari"
                  required
                />
              </div>
              <div>
                <label htmlFor="formJumlah" className="block text-sm font-medium text-gray-700">Jumlah</label>
                <input
                  type="number"
                  id="formJumlah"
                  value={formJumlah}
                  onChange={(e) => setFormJumlah(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Contoh: 50000"
                  min="1"
                  required
                />
              </div>
              <div>
                <label htmlFor="formJenis" className="block text-sm font-medium text-gray-700">Jenis</label>
                <select
                  id="formJenis"
                  value={formJenis}
                  onChange={(e) => setFormJenis(e.target.value as 'pemasukan' | 'pengeluaran')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md shadow-sm transition duration-150 ease-in-out"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm transition duration-150 ease-in-out"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedMonthYear && filteredDataByMonth.length > 0 ? (
        <div className="space-y-4  pt-6">
          <h2 className="text-xl font-semibold text-black">{selectedMonthYear}</h2>


          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm  text-gray-500">
              <thead className="bg-gray-50 text-lef px-6 py-3 text-left text-xs font-medium text-gray-500 uppercaset">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3 text-right">Jumlah</th>
                  <th className="px-4 py-3 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredDataByMonth.length > 0 ? (
                  filteredDataByMonth.map((item) => (
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
                      Tidak ada data untuk bulan ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 border-l-4 border-green-600 p-2 rounded shadow-sm">
              <p className="text-green-800 font-medium">Total Pemasukan</p>
              <p className="text-lg font-bold text-green-700 mt-1">
                Rp{totalPemasukanSelectedMonth.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-600 p-2 rounded shadow-sm">
              <p className="text-red-800 font-medium">Total Pengeluaran</p>
              <p className="text-lg font-bold text-red-700 mt-1">
                Rp{totalPengeluaranSelectedMonth.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-2 rounded shadow-sm">
              <p className="text-indigo-800 font-medium">Saldo Terakhir Bulan Ini</p>
              <p className="text-lg font-bold text-indigo-700 mt-1">
                Rp{saldoTerakhirSelectedMonth.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          <div
            ref={hiddenRef}
            style={{
              position: "absolute",
              left: "-9999px",
              top: "-9999px",
              width: "210mm",
              padding: "20mm",
              boxSizing: "border-box",
              backgroundColor: "white",
              zIndex: -1,
            }}
          >
            <h2 style={{ fontSize: "16pt", fontWeight: "bold", marginBottom: "15pt", textAlign: "center", fontFamily: "sans-serif" }}>
              Rekap Kas Bulan {selectedMonthYear} {currentRt && `RT ${currentRt}`} {currentRw && `RW ${currentRw}`}
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
                {itemsForSelectedMonth.length > 0 ? (
                  itemsForSelectedMonth.map((item) => (
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
                  <td colSpan={2} style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right", fontWeight: "bold", color: "green" }}>Rp{totalPemasukanSelectedMonth.toLocaleString("id-ID")}</td>
                </tr>
                <tr style={{ backgroundColor: "#f9f9f9" }}>
                  <td colSpan={3} style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right", fontWeight: "bold" }}>Total Pengeluaran:</td>
                  <td colSpan={2} style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right", fontWeight: "bold", color: "red" }}>Rp{totalPengeluaranSelectedMonth.toLocaleString("id-ID")}</td>
                </tr>
                <tr style={{ backgroundColor: "#e6e6ff" }}>
                  <td colSpan={3} style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right", fontWeight: "bold" }}>Saldo Terakhir Bulan Ini:</td>
                  <td colSpan={2} style={{ border: "1pt solid #ccc", padding: "8pt", textAlign: "right", fontWeight: "bold", color: "blue" }}>Rp{saldoTerakhirSelectedMonth.toLocaleString("id-ID")}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handlePrintPDF}
              className="bg-[#0B39AA] hover:bg-[#2F57C6] text-white px-4 py-2 mt-2 rounded shadow transition duration-150 ease-in-out"
            >
              Cetak PDF {selectedMonthYear}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Pilih bulan dan tahun untuk melihat rekap kas.</p>
      )}

      {selectedMonthYear && filteredDataByMonth.length === 0 && (
        <p className="text-center text-gray-500">Tidak ada data kas untuk bulan "{selectedMonthYear}" ini.</p>
      )}

      {!selectedMonthYear && (
          <p className="text-center text-gray-500">Pilih bulan dan tahun dari dropdown di atas untuk menampilkan data.</p>
      )}
    </div>
  );
};