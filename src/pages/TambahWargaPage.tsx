import { useState } from "react";
import { getApi } from "../utils/api";
import { useNavigate } from "react-router-dom";

export const TambahWargaPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nik: "",
    nama: "",
    email: "",
    no_hp: "",
    rt: "",
    rw: "",
    alamat: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const api = getApi();
      await api.post("/api/users", {
        ...formData,
        role: "warga",
      });
      alert("Warga berhasil ditambahkan");
      navigate("/warga");
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menambahkan warga");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Tambah Warga</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label htmlFor="nik" className="block mb-1 font-medium text-gray-700">NIK</label>
    <input
      id="nik"
      type="text"
      name="nik"
      value={formData.nik}
      onChange={handleChange}
      className="w-full border px-3 py-2 rounded"
      required
    />
  </div>

  <div>
    <label htmlFor="nama" className="block mb-1 font-medium text-gray-700">Nama</label>
    <input
      id="nama"
      type="text"
      name="nama"
      value={formData.nama}
      onChange={handleChange}
      className="w-full border px-3 py-2 rounded"
      required
    />
  </div>

  {/* <div>
    <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email</label>
    <input
      id="email"
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      className="w-full border px-3 py-2 rounded"
    />
  </div> */}

  <div>
    <label htmlFor="no_hp" className="block mb-1 font-medium text-gray-700">No HP</label>
    <input
      id="no_hp"
      type="text"
      name="no_hp"
      value={formData.no_hp}
      onChange={handleChange}
      className="w-full border px-3 py-2 rounded"
    />
  </div>

  <div>
    <label htmlFor="rt" className="block mb-1 font-medium text-gray-700">RT</label>
    <input
      id="rt"
      type="text"
      name="rt"
      value={formData.rt}
      onChange={handleChange}
      inputMode="numeric"
      pattern="\d*"
      maxLength={3}
      className="w-full border px-3 py-2 rounded"
      required
    />
  </div>

  <div>
    <label htmlFor="rw" className="block mb-1 font-medium text-gray-700">RW</label>
    <input
      id="rw"
      type="text"
      name="rw"
      value={formData.rw}
      onChange={handleChange}
      inputMode="numeric"
      pattern="\d*"
      maxLength={3}
      className="w-full border px-3 py-2 rounded"
      required
    />
  </div>

  {/* <div>
    <label htmlFor="alamat" className="block mb-1 font-medium text-gray-700">Alamat</label>
    <textarea
      id="alamat"
      name="alamat"
      value={formData.alamat}
      onChange={handleChange}
      className="w-full border px-3 py-2 rounded"
    ></textarea>
  </div> */}

  <div className="flex justify-end gap-3">
    <button
      type="button"
      onClick={() => navigate("/warga")}
      className="bg-gray-300 px-4 py-2 rounded"
    >
      Batal
    </button>
    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-2 rounded"
      disabled={loading}
    >
      {loading ? "Menyimpan..." : "Simpan"}
    </button>
  </div>
</form>

    </div>
  );
};
