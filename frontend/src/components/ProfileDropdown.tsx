import React, { Component, createRef } from 'react';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { withRouter } from '../utils/withRouter';
import type { WithRouterProps } from '../utils/withRouter';

interface ProfileDropdownProps {
  userName: string;
  avatarUrl?: string;
  onLogout: () => void;
  showName?: boolean;
  className?: string;
  position?: 'top' | 'bottom';
}

type Props = ProfileDropdownProps & WithRouterProps;

interface ProfileDropdownState {
  isOpen: boolean;
}

class ProfileDropdownComponent extends Component<Props, ProfileDropdownState> {
  private dropdownRef = createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside = (event: MouseEvent) => {
    if (this.dropdownRef.current && !this.dropdownRef.current.contains(event.target as Node)) {
      this.setState({ isOpen: false });
    }
  };

  toggleDropdown = () => {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  };

  render() {
    const { userName, avatarUrl, onLogout, showName = true, className = '', position = 'bottom' } = this.props;
    const { isOpen } = this.state;

    const defaultAvatar = `https://ui-avatars.com/api/?name=${userName}&background=f3f4f6&color=374151`;
    
    const dropdownClasses = position === 'top' 
      ? 'bottom-full mb-2 origin-bottom' 
      : 'top-full mt-2 origin-top';

    return (
      <div className={`relative ${className}`} ref={this.dropdownRef}>
        {/* Trigger */}
        <button 
          onClick={this.toggleDropdown}
          className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-50 transition-all focus:outline-none"
        >
          <img 
            src={avatarUrl || defaultAvatar} 
            alt={userName} 
            className="w-10 h-10 rounded-full border border-gray-200 bg-white object-cover shadow-sm"
          />
          {showName && (
            <div className="flex flex-1 items-center justify-between">
              <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{userName}</span>
              <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 ${dropdownClasses}`}>
            <div className="px-4 py-2 border-b border-gray-50 mb-1 text-left">
              <p className="text-xs text-gray-500">Masuk sebagai</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
            </div>
            
            <button 
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors text-left"
              onClick={() => {
                this.setState({ isOpen: false });
                this.setState({ isOpen: false });
                this.props.navigate('/profile');
              }}
            >
              <FiUser size={16} />
              Profil Saya
            </button>
            
            <button 
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              onClick={() => {
                this.setState({ isOpen: false });
                onLogout();
              }}
            >
              <FiLogOut size={16} />
              Keluar
            </button>
          </div>
        )}
      </div>
    );
  }
}

export const ProfileDropdown = withRouter(ProfileDropdownComponent);
