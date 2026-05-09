import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from '../utils/withRouter';
import type { WithRouterProps } from '../utils/withRouter';

interface SidebarProps extends WithRouterProps {
  role: 'Petugas' | 'Admin';
}

class SidebarComponent extends Component<SidebarProps> {
  handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    this.props.navigate('/login');
  };

  render() {
    const { role, location } = this.props;
    
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
      <aside className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50">
        <div className="p-6 border-b border-gray-100/80">
          <img src="/assets/logo-balikin.png" alt="Balikin" className="h-10 drop-shadow-sm" />
          <p className="text-xs text-gray-400 font-black tracking-widest uppercase mt-3">Panel {role}</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name} 
                to={link.path}
                className={`block px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-1' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100/80 bg-white">
          <button 
            onClick={this.handleLogout} 
            className="flex items-center justify-center gap-3 w-full px-4 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm group"
          >
            <span className="group-hover:scale-110 transition-transform">Logout</span>
          </button>
        </div>
      </aside>
    );
  }
}

export const Sidebar = withRouter(SidebarComponent);
