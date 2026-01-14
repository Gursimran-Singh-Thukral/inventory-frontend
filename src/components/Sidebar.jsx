import React from 'react';
import { LayoutDashboard, Package, ClipboardList, LogOut, X, Moon, Sun } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar, isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: LayoutDashboard, text: 'Dashboard', path: '/dashboard' },
    { icon: Package, text: 'Items', path: '/items' },
    { icon: ClipboardList, text: 'Transactions', path: '/transactions' },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-secondary text-white shadow-2xl z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:shadow-none flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 text-2xl font-bold border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="text-primary" /> IMS Pro
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => toggleSidebar(false)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.path 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.text}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          
          {/* THEME TOGGLE (Now inside Sidebar) */}
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 text-gray-400 p-3 hover:bg-gray-800 w-full rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* LOGOUT */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-400 p-3 hover:bg-gray-800 w-full rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;