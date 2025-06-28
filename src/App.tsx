import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/UsersPage';
import { WargaPage } from './pages/WargaPage'
import { TambahWargaPage } from './pages/TambahWargaPage';
import { LaporanPage } from './pages/LaporanPage'
import { LaporanDetailPage } from './pages/LaporanDetailPage';
import  {RekapKasPage}  from './pages/RekapKasPage'

import { Layout } from './components/Layout';
import { KasBulananPage } from './pages/KasBulananPage'
import { PantauKasPage } from './pages/PantauKasPage';


// Define the roles that are allowed to access the admin panel
const allowedRoles = ['admin', 'rt', 'rw'];

// A wrapper for routes that require authentication
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
          <p className="mt-2">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Layout wrapper with auth
const LayoutWrapper = () => (
  <AuthWrapper>
    <Layout>
      <Outlet />
    </Layout>
  </AuthWrapper>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
<Route element={<LayoutWrapper />}>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/users" element={<UsersPage />} />
  <Route path="/warga" element={<WargaPage />} />
  <Route path="/warga/tambah" element={<TambahWargaPage />} />
  <Route path="/laporan" element={<LaporanPage />} />
  <Route path="/laporan/:id" element={<LaporanDetailPage />} />
  <Route path="/rekap-kas" element={<RekapKasPage />} />
  <Route path="/upload-kas" element={<KasBulananPage />} />
  <Route path="/pantau-kas" element={<PantauKasPage />} />
</Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
