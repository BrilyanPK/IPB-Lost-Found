import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  role?: string;
  sub?: string;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('Attempting login for:', email);
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const token = res.data.access_token;
      console.log('Login successful, token received');
      localStorage.setItem('token', token);
      
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('Decoded token:', decoded);
      
      const role = (decoded.role || '').toLowerCase();
      console.log('Role identified:', role);
      
      if (role === 'pencari') {
        navigate('/home');
      } else if (role === 'petugas') {
        navigate('/petugas/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        console.warn('Unknown role, redirecting to home');
        navigate('/home');
      }
    } catch (err: unknown) {
      console.error('Login error details:', err);
      const error = err as { response?: { data?: { detail?: unknown } } };
      const detail = error.response?.data?.detail;
      let errorMessage = 'Login gagal, periksa kredensial Anda';
      
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (detail && typeof detail === 'object') {
        errorMessage = JSON.stringify(detail);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 min-h-screen">
      <Card className="w-full max-w-md p-8 shadow-lg border-t-4 border-t-primary">
        <div className="text-center mb-8 relative">
          <Link to="/home" className="inline-block mt-4">
            <img src="/assets/logo-balikin.png" alt="Balikin" className="h-16 mx-auto hover:opacity-90 transition-opacity" />
          </Link>
          <p className="text-sm text-gray-500 mt-3 font-medium">Masuk ke akun Anda</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <Input 
            label="Email" 
            type="email" 
            placeholder="budi@apps.ipb.ac.id" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button className="w-full mt-4 py-3" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Sign In'}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Atau lanjutkan dengan</span>
            </div>
          </div>

          <button 
            type="button" 
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </form>
        <div className="mt-8 text-center text-sm text-gray-600 font-medium">
          Belum punya akun Pencari? <Link to="/register" className="text-primary hover:text-blue-700 hover:underline">Register</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
