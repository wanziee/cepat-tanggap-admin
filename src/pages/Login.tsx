import { useState } from "react";
// import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import logoRounded from "../assets/logoRounded.png"

export const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading } = useAuth();
  // const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(identifier, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B39AA]">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-center mb-3">
<img
  src={logoRounded}
  alt="Logo Rounded"
  className="h-20 w-20 object-contain"
/>

          
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-900">
          Selamat Datang
        </h2>
        <p className="text-center text-sm text-gray-600">
          Silakan masuk dengan akun Anda
        </p>

        {/* Error handling */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="identifier"
            placeholder="Email atau NIK"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span>Ingat saya</span>
            </label>
            <a href="#" className="text-blue-600 hover:underline">
              Lupa password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition duration-200"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};
