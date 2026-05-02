
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100">
      <img src="/assets/logo-balikin.png" alt="Balikin" className="h-10" />
      <div className="flex items-center gap-6">
        <Link to="/home" className="text-gray-600 hover:text-primary transition-colors font-medium">Beranda</Link>
        <Link to="/report-lost" className="text-gray-600 hover:text-primary transition-colors font-medium">Buat Laporan</Link>
        <Link to="/lost-items" className="text-gray-600 hover:text-primary transition-colors font-medium">Daftar Kehilangan</Link>
        <Link to="/my-reports" className="text-gray-600 hover:text-primary transition-colors font-medium">Laporanku</Link>
        <button onClick={handleLogout} className="ml-4 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors">
          Logout
        </button>
      </div>
    </nav>
  );
};
