import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button 
          onClick={onMenuClick} 
          className="menu-button"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="header-title">FinTrack Macedonia</h1>
      </div>

      <div className="header-right">
        <div className="user-info">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-details">
            <span className="user-name">{user?.fullName}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout} 
          className="logout-button"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;