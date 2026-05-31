import { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from '../utils/withRouter';
import type { WithRouterProps } from '../utils/withRouter';
import { ProfileDropdown } from './ProfileDropdown';
import { 
  FiLayout, 
  FiPlusCircle, 
  FiList, 
  FiUsers,
  FiFileText,
  FiArchive
} from 'react-icons/fi';

interface SidebarProps extends WithRouterProps {
  role: 'Petugas' | 'Admin';
}

class SidebarComponent extends Component<SidebarProps> {
  handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.props.navigate('/home');
  };

  render() {
    const { role, location } = this.props;
    
    const petugasLinks = [
      { name: 'Dashboard', path: '/petugas/dashboard', icon: FiLayout },
      { name: 'Input Temuan', path: '/petugas/input', icon: FiPlusCircle },
      { name: 'Daftar Laporan', path: '/petugas/reports', icon: FiList },
      { name: 'Riwayat Penyerahan', path: '/petugas/history', icon: FiArchive },
    ];

    const adminLinks = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: FiLayout },
      { name: 'User Management', path: '/admin/users', icon: FiUsers },
      { name: 'Activity Logs', path: '/admin/logs', icon: FiFileText },
    ];

    const links = role === 'Petugas' ? petugasLinks : adminLinks;

    

    return (
      <aside className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col z-50">
        <div className="p-6">
          <img src="/assets/logo-balikin.png" alt="Balikin" className="h-8" />
        </div>
        
        <nav className="flex-1 px-4 pt-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link 
                key={link.name} 
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-800'} />
                <span className="text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100">
          <ProfileDropdown 
            userName={role} 
            onLogout={this.handleLogout}
            position="top"
          />
        </div>
      </aside>
    );
  }
}

export const Sidebar = withRouter(SidebarComponent);
