import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', {
        full_name: fullName,
        email: email,
        password: password,
        role: 'Pencari'
      });
      
      // Auto login
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', res.data.access_token);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 min-h-screen">
      <Card className="w-full max-w-md p-8 shadow-lg border-t-4 border-t-primary">
        <div className="text-center mb-8">
          <img src="/assets/logo-balikin.png" alt="Balikin" className="h-20 mx-auto mb-4" />
          <p className="text-sm text-gray-500 mt-2">Daftar untuk membuat laporan kehilangan</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input 
            label="Nama Lengkap" 
            type="text" 
            placeholder="Misal: Budi Santoso" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
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
            placeholder="Minimal 6 karakter" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button className="w-full mt-2" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Sign Up'}
          </Button>
        </form>
        <div className="mt-8 text-center text-sm text-gray-600 font-medium">
          Sudah punya akun? <Link to="/login" className="text-primary hover:text-blue-700 hover:underline">Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
