import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from '../utils/withRouter';
import type { WithRouterProps } from '../utils/withRouter';
import { 
  FiLayout, 
  FiPlusCircle, 
  FiList, 
  FiRotateCcw, 
  FiLogOut,
  FiUser
} from 'react-icons/fi';

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
      { name: 'Dashboard', path: '/petugas/dashboard', icon: FiLayout },
      { name: 'Input Temuan', path: '/petugas/input', icon: FiPlusCircle },
      { name: 'Daftar Laporan', path: '/petugas/reports', icon: FiList },
      { name: 'Riwayat Penyerahan', path: '/petugas/history', icon: FiRotateCcw },
    ];

    const adminLinks = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: FiLayout },
      { name: 'Manajemen User', path: '/admin/users', icon: FiUser },
      { name: 'Log Aktivitas', path: '/admin/logs', icon: FiList },
    ];

    const links = role === 'Petugas' ? petugasLinks : adminLinks;

    return (
      <aside className="w-72 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50">
        <div className="p-8 border-b border-gray-100/80">
          <img src="/assets/logo-balikin.png" alt="Balikin" className="h-10 drop-shadow-sm" />
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link 
                key={link.name} 
                to={link.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-1' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100/80 bg-white space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
              <FiUser size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{role}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Session</p>
            </div>
          </div>
          <button 
            onClick={this.handleLogout} 
            className="flex items-center gap-3 w-full px-5 py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all duration-300 group"
          >
            <FiLogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    );
  }
}

export const Sidebar = withRouter(SidebarComponent);
