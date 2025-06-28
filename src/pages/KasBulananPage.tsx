import { useEffect, useState } from "react";
import { getApi } from "../utils/api";

// Tipe data untuk item Kas Bulanan (sesuai dengan respons backend Anda)
type KasBulananItem = {
  id: number;
  filename: string;
  filepath: string; // Misal: /uploads/nama_file_unik.pdf
  mimetype: string;
  filesize: number;
  description: string;
  uploaded_by_user_id: number;
  related_rt?: string; // Opsional
  related_rw?: string; // Opsional
  upload_date: string; // Tanggal dalam format string
  createdAt: string;
  updatedAt: string;
  uploader?: { // Jika Anda menyertakan data uploader dari asosiasi
    id: number;
    nama: string;
    email: string;
  };
};

// --- Komponen Modal (Bisa dipecah menjadi file terpisah untuk kebersihan) ---
interface UploadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  fileToUpload: File | null;
  setFileToUpload: (file: File | null) => void;
  descriptionInput: string;
  setDescriptionInput: (description: string) => void;
  uploading: boolean;
  uploadErrorMsg: string;
}

const UploadFormModal: React.FC<UploadFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  fileToUpload,
  setFileToUpload,
  descriptionInput,
  setDescriptionInput,
  uploading,
  uploadErrorMsg,
}) => {
  if (!isOpen) return null;

  return (
<div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center p-2 sm:p-6">
  <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Form Tambah Laporan Kas Baru</h2>
        {uploadErrorMsg && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm">
            {uploadErrorMsg}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              id="modal-description"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Contoh: Laporan kas bulan Juni 2025"
              required
            />
          </div>

          <div>
            <label htmlFor="modal-file-upload" className="block text-sm font-medium text-gray-700 mb-1">File PDF</label>
            <input
              type="file"
              id="modal-file-upload"
              accept="application/pdf"
              onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              required
            />
            {fileToUpload && (
              <p className="mt-2 text-sm text-gray-500">File dipilih: {fileToUpload.name}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md shadow-sm transition duration-150 ease-in-out"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition duration-150 ease-in-out"
            >
              {uploading ? "Mengunggah..." : "Upload Laporan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- Akhir Komponen Modal ---

export const KasBulananPage = () => {
  const [kasBulananData, setKasBulananData] = useState<KasBulananItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadFormModal, setShowUploadFormModal] = useState(false); // Diubah namanya menjadi modal
  
  // State untuk form upload
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [descriptionInput, setDescriptionInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");

  const fetchKasBulanan = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = getApi();
      const response = await api.get("/api/kas-bulanan");
      setKasBulananData(response.data.data);
    } catch (err: any) {
      console.error("Gagal mengambil data kas bulanan:", err);
      setError(err.response?.data?.message || "Gagal memuat data kas bulanan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKasBulanan();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileToUpload) {
      setUploadErrorMsg("Mohon pilih file PDF terlebih dahulu.");
      return;
    }

    setUploading(true);
    setUploadSuccessMsg("");
    setUploadErrorMsg(""); // Reset error modal sebelum submit

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("description", descriptionInput);

    try {
      const api = getApi();
      const res = await api.post("/api/kas-bulanan/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadSuccessMsg(res.data?.message || "File berhasil diunggah!");
      setFileToUpload(null);
      setDescriptionInput("");
      setShowUploadFormModal(false); // Sembunyikan modal setelah sukses upload
      fetchKasBulanan(); // Muat ulang data setelah upload
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadErrorMsg(err.response?.data?.message || "Gagal mengunggah file.");
    } finally {
      setUploading(false);
    }
  };

  const handleViewPdf = (filepath: string) => {
    const baseUrl = getApi().defaults.baseURL;
const fullUrl = `${baseUrl}/uploads/${filepath}`;
// Misal baseUrl = http://localhost:3000
// item.filepath = kas/123456.pdf → URL final: http://localhost:3000/uploads/kas/123456.pdf

    window.open(fullUrl, '_blank');
  };

  const handleCloseModal = () => {
    setShowUploadFormModal(false);
    setFileToUpload(null); // Bersihkan state file
    setDescriptionInput(""); // Bersihkan state deskripsi
    setUploadErrorMsg(""); // Bersihkan pesan error modal
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Data PDF Kas Bulanan</h1>
        <button
          onClick={() => {
            setShowUploadFormModal(true);
            setUploadSuccessMsg(""); // Reset pesan sukses global
            setUploadErrorMsg(""); // Reset pesan error global
          }}
          className="bg-[#0B39AA] hover:bg-[#2F57C6] text-white px-4 py-2 rounded shadow transition duration-150 ease-in-out"
        >
          + Tambah Laporan Baru
        </button>
      </div>

      {/* Pesan sukses global (jika modal ditutup setelah sukses) */}
      {uploadSuccessMsg && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4">
          {uploadSuccessMsg}
        </div>
      )}
      {/* Pesan error global (jika terjadi error di luar modal) */}
      {error && ( // Ini error dari fetch data
        <div className="text-red-600 p-4 text-center border border-red-300 rounded-md bg-red-50">
          <p>{error}</p>
          <p>Silakan coba muat ulang halaman atau periksa koneksi Anda.</p>
        </div>
      )}

      <UploadFormModal
        isOpen={showUploadFormModal}
        onClose={handleCloseModal}
        onSubmit={handleUploadSubmit}
        fileToUpload={fileToUpload}
        setFileToUpload={setFileToUpload}
        descriptionInput={descriptionInput}
        setDescriptionInput={setDescriptionInput}
        uploading={uploading}
        uploadErrorMsg={uploadErrorMsg} // Kirim pesan error ke modal
      />

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full" />
          <p className="ml-3 text-blue-700">Memuat data PDF...</p>
        </div>
      ) : kasBulananData.length === 0 ? (
        <div className="text-center text-gray-500 p-8 border border-gray-200 rounded-md bg-gray-50">
          <p className="mb-2">Tidak ada laporan kas bulanan yang ditemukan.</p>
          <p>Klik "Tambah Laporan Baru" untuk mengunggah dokumen pertama.</p>
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
              {kasBulananData.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-blue-600 hover:underline cursor-pointer"
                      onClick={() => handleViewPdf(item.filepath)}>
                    {item.filename}
                  </td>
                  <td className="px-4 py-3">{item.description || '-'}</td>
                  <td className="px-4 py-3">{item.uploader?.nama || 'N/A'}</td>
                  <td className="px-4 py-3">{item.related_rt && item.related_rw ? `RT ${item.related_rt}/RW ${item.related_rw}` : '-'}</td>
                  <td className="px-4 py-3">{new Date(item.upload_date).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleViewPdf(item.filepath)}
                      className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs py-1 px-2 rounded-md bg-indigo-50 hover:bg-indigo-100 transition duration-150 ease-in-out"
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