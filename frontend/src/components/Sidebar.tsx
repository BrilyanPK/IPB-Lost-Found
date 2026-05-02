import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  role: 'Petugas' | 'Admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate('/login');
  };

  const petugasLinks = [
    { name: 'Dashboard', path: '/petugas/dashboard' },
    { name: 'Input Temuan', path: '/petugas/input' },
    { name: 'Daftar Laporan', path: '/petugas/reports' },
    { name: 'Riwayat Penyerahan', path: '/petugas/history' },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Manajemen User', path: '/admin/users' },
    { name: 'Log Aktivitas', path: '/admin/logs' },
  ];

  const links = role === 'Petugas' ? petugasLinks : adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <img src="/assets/logo-balikin.png" alt="Balikin" className="h-10" />
        <p className="text-sm text-gray-500 font-medium mt-1">Panel {role}</p>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link 
              key={link.name} 
              to={link.path}
              className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="block w-full text-center px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors">
          Logout
        </button>
      </div>
    </aside>
  );
};
