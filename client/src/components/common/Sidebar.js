// COMPLETE: client/src/components/common/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  BarChart3,
  Brain, // AI ASSISTANT IMPORT
  X 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navigationItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      to: '/expenses',
      icon: CreditCard,
      label: 'Expenses',
    },
    {
      to: '/analytics',
      icon: BarChart3,
      label: 'Analytics',
    },
    // NEW AI ASSISTANT MENU ITEM
    {
      to: '/ai',
      icon: Brain,
      label: 'AI Assistant',
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2>FinTrack</h2>
          <button 
            onClick={onClose}
            className="sidebar-close"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="nav-item">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => 
                      `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-version">
            <span>Made by Endrit Mamuti © 2025</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;