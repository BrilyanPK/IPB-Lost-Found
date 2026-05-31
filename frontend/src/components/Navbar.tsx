import { Component } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { ProfileDropdown } from './ProfileDropdown';

// Object Oriented Models
class NavItem {
  label: string;
  path: string;
  constructor(label: string, path: string) {
    this.label = label;
    this.path = path;
  }
}

interface NavbarProps {
  navigate: ReturnType<typeof useNavigate>;
  location: ReturnType<typeof useLocation>;
}

interface NavbarState {
  isMobileMenuOpen: boolean;
  isLoggedIn: boolean;
  userName: string;
}

class NavbarComponent extends Component<NavbarProps, NavbarState> {
  private navLinks: NavItem[];

  constructor(props: NavbarProps) {
    super(props);
    this.navLinks = [
      new NavItem('Beranda', '/home'),
      new NavItem('Buat Laporan', '/report-lost'),
      new NavItem('Laporanku', '/my-reports'),
    ];

    this.state = {
      isMobileMenuOpen: false,
      isLoggedIn: false,
      userName: 'Nurcholis Saputra', // Fallback dari referensi
    };
  }

  componentDidMount() {
    this.checkAuthStatus();
  }

  componentDidUpdate(prevProps: NavbarProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({ isMobileMenuOpen: false });
      this.checkAuthStatus();
    }
  }

  private checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    let loggedIn = false;
    let name = 'Nurcholis Saputra';

    if (token) {
      loggedIn = true;
      try {
        const decoded: any = jwtDecode(token);
        if (decoded && decoded.sub) {
           name = decoded.sub; 
        }
      } catch (e) {
        // Abaikan jika token invalid
      }
    }
    
    this.setState({ isLoggedIn: loggedIn, userName: name });
  };

  private handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.setState({ isLoggedIn: false, isMobileMenuOpen: false });
    this.props.navigate('/home');
  };

  private toggleMenu = () => {
    this.setState((prevState) => ({ isMobileMenuOpen: !prevState.isMobileMenuOpen }));
  };

  renderDesktopMenu() {
    return (
      <div className="hidden md:flex items-center justify-between flex-1 ml-16">
        {/* Navigation Links (Centered area) */}
        <div className="flex items-center gap-8 mx-auto">
          {this.navLinks.map((link, idx) => {
            const isActive = this.props.location.pathname.includes(link.path);
            return (
              <Link 
                key={idx} 
                to={link.path} 
                className={`font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Action Area */}
        <div className="flex items-center">
          {this.state.isLoggedIn ? (
            <ProfileDropdown 
              userName={this.state.userName} 
              onLogout={this.handleLogout}
              showName={false}
              position="bottom"
            />
          ) : (
            <Link to="/login" className="text-gray-600 font-medium hover:text-primary transition-colors">Masuk</Link>
          )}
        </div>
      </div>
    );
  }

  renderMobileMenu() {
    if (!this.state.isMobileMenuOpen) return null;

    return (
      <div className="md:hidden fixed inset-0 z-40 bg-white flex flex-col pt-[72px] px-6 animate-in slide-in-from-top-2">
         {/* Links Stack */}
         <div className="flex flex-col mt-4">
           {this.navLinks.map((link, idx) => {
              const isActive = this.props.location.pathname.includes(link.path);
              return (
                <Link 
                  key={idx} 
                  to={link.path} 
                  className={`text-base py-5 border-b border-gray-100 ${
                    isActive ? 'font-medium text-primary' : 'text-gray-600'
                  }`}
                  onClick={() => this.setState({ isMobileMenuOpen: false })}
                >
                  {link.label}
                </Link>
              );
            })}
         </div>

         {/* Bottom Section */}
         <div className="mt-auto pb-8 pt-6">
            {this.state.isLoggedIn && (
               <div className="mb-6">
                 <ProfileDropdown 
                   userName={this.state.userName} 
                   onLogout={this.handleLogout}
                   showName={true}
                   position="top"
                 />
               </div>
            )}
            
            <div className="text-sm text-gray-500">
               © Copyright 2025, All Rights Reserved by Balikin
            </div>
         </div>
      </div>
    );
  }

  render() {
    return (
      <>
        <nav className="bg-white px-6 py-4 flex items-center sticky top-0 z-50 shadow-sm border-b border-gray-100 relative">
          {/* Logo */}
          <Link to="/home" className="z-50 shrink-0">
             <img src="/assets/logo-balikin.png" alt="Balikin" className="h-8 md:h-10" />
          </Link>

          {/* Desktop Nav */}
          {this.renderDesktopMenu()}

          {/* Mobile Toggle / Actions */}
          <div className="flex md:hidden items-center gap-6 z-50 ml-auto">
             {!this.state.isLoggedIn && !this.state.isMobileMenuOpen && (
                <Link to="/login" className="text-gray-600 font-medium text-sm">Daftar</Link>
             )}
             <button 
               onClick={this.toggleMenu}
               className="text-gray-900 focus:outline-none"
             >
                {this.state.isMobileMenuOpen ? <FiX className="w-7 h-7" /> : <FiMenu className="w-7 h-7" />}
             </button>
          </div>
        </nav>
        
        {/* Mobile Menu Overlay */}
        {this.renderMobileMenu()}
      </>
    );
  }
}

// HOC Wrapper untuk menyuntikkan Hooks ke Class Component (Mempertahankan OOP)
export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return <NavbarComponent navigate={navigate} location={location} />;
};
