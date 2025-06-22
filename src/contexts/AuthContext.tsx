import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type UserRole = 'admin' | 'rt' | 'rw';

interface User {
  id: string;
  name: string;
  email: string;
  nik: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (emailOrNik: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'user';
const TOKEN_KEY = 'token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const setUserWithPersistence = (userData: User | null) => {
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    setUser(userData);
  };

  const setTokenWithPersistence = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
          const api = axios.create({
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${savedToken}`
            },
          });

          const response = await api.get('/api/auth/me');

          const userData = response.data?.data;
          if (!userData) throw new Error('Data user tidak ditemukan');

          const user: User = {
            id: userData.id,
            name: userData.nama || userData.name || 'User',
            email: userData.email,
            nik: userData.nik || '',
            role: (userData.role as UserRole) || 'admin',
          };

          setUserWithPersistence(user);
          setTokenWithPersistence(savedToken);
        } else {
          setUserWithPersistence(null);
          setTokenWithPersistence(null);
        }
      } catch (err) {
        console.error('Auth check failed', err);
        setUserWithPersistence(null);
        setTokenWithPersistence(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Buat instance axios dengan konfigurasi default
      const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const response = await api.post('/api/auth/admin/login', { email, password }, {
        withCredentials: true
      });

      const userData = response.data?.data?.user;
      const token = response.data?.data?.token;

      if (!userData || !token) throw new Error('Data respons tidak lengkap');

      const user: User = {
        id: userData.id,
        name: userData.nama || userData.name || 'Admin',
        email: userData.email,
        nik: userData.nik || '',
        role: (userData.role as UserRole) || 'admin',
      };

      setUserWithPersistence(user);
      setTokenWithPersistence(token);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);

      const errorMessage =
        err?.response?.data?.message || err?.message || 'Login gagal';
      alert(errorMessage); // ✅ feedback ke user
      setError(errorMessage);
      setUserWithPersistence(null);
      setTokenWithPersistence(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUserWithPersistence(null);
    setTokenWithPersistence(null);
    navigate('/login');
  };

  useEffect(() => {
    document.title = user
      ? `Cepat Tanggap - ${user.role.toUpperCase()} Dashboard`
      : 'Cepat Tanggap - Login';
  }, [user]);

  const contextValue = {
    user,
    login,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading ? (
        children
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
