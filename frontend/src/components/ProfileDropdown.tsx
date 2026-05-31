import { Component, createRef } from 'react';
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

    return (
      <div className={`relative ${className}`} ref={this.dropdownRef}>
        {/* Trigger */}
        <button 
          onClick={this.toggleDropdown}
          className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-50 transition-all focus:outline-none"
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={userName} 
              className="w-10 h-10 rounded-full border border-gray-200 bg-white object-cover shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-500 shadow-sm">
              <FiUser size={20} />
            </div>
          )}
          {showName && (
            <div className="flex flex-1 items-center justify-between">
              <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{userName}</span>
              <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`absolute w-56 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 p-1.5 z-50 animate-in fade-in zoom-in-95 ${
            position === 'top' ? 'bottom-full mb-2 left-0 origin-bottom-left' : 'top-full mt-2 right-0 origin-top-right'
          }`}>
            
            <button 
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors text-left"
              onClick={() => {
                this.setState({ isOpen: false });
                this.props.navigate('/profile');
              }}
            >
              <FiUser size={16} className="text-gray-400" />
              Profil Saya
            </button>

            <div className="h-px bg-gray-100 my-1.5 mx-2"></div>
            
            <button 
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
              onClick={() => {
                this.setState({ isOpen: false });
                onLogout();
              }}
            >
              <FiLogOut size={16} className="text-red-500" />
              Keluar
            </button>
          </div>
        )}
      </div>
    );
  }
}

export const ProfileDropdown = withRouter(ProfileDropdownComponent);
