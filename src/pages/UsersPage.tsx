import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { UserIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

type User = {
  id: number;
  nik: string;
  nama: string;
  email: string;
  role: string;
  alamat: string;
  no_hp: string;
  created_at: string;
};

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token tidak ditemukan. Silakan login kembali.');
        }
        
        console.log('Mengambil data pengguna...');
        
        // Buat instance axios dengan baseURL yang benar
        const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:3000');
        console.log('Base URL:', baseURL);
        
        const api = axios.create({
          baseURL: baseURL,
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        // Log URL lengkap yang akan diakses
        const fullUrl = `${baseURL}/api/users`;
        console.log('Mengirim request ke:', fullUrl);
        
        // Kirim request
        const response = await api.get('/api/users');
        
        console.log('Response dari API:', response);
        
        if (response.data && Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        } else if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          throw new Error('Format data tidak valid');
        }
      } catch (err: any) {
        console.error('Error detail:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers
          }
        });
        
        if (err.response?.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
          // Redirect ke halaman login
          window.location.href = '/login';
        } else if (err.response?.data?.message) {
          setError(`Gagal memuat data: ${err.response.data.message}`);
        } else {
          setError(`Gagal memuat data: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        const token = localStorage.getItem('token');
        const api = axios.create({
          baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api',
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Menghapus user dengan ID:', userId);
        await api.delete(`/users/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (err: any) {
        console.error('Error deleting user:', err);
        alert(err.response?.data?.message || 'Gagal menghapus pengguna');
      }
    }
  };

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
        <button
          onClick={() => {}}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <UserIcon className="h-5 w-5 mr-2" />
          Tambah Pengguna
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIK
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((userItem) => (
                <tr key={userItem.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {userItem.nik}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {userItem.nama}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userItem.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      userItem.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : userItem.role === 'rw' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {userItem.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
