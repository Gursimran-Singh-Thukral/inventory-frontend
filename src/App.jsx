import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { InventoryProvider } from './context/InventoryContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Items from './pages/Items';
import Transactions from './pages/Transactions';

const Layout = ({ children, isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoginPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-darkbg text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Sidebar with Theme Toggle */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <header className={`md:hidden border-b p-4 flex items-center justify-between shadow-sm z-30 ${isDarkMode ? 'bg-darkcard border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="font-bold text-xl">IMS Pro</div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply 'dark' class to HTML tag whenever isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <InventoryProvider>
      <Router>
        <Layout isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            {/* PASS THE PROP DOWN */}
            <Route path="/dashboard" element={<Dashboard isDarkMode={isDarkMode} />} />
            <Route path="/items" element={<Items isDarkMode={isDarkMode} />} />
            <Route path="/transactions" element={<Transactions isDarkMode={isDarkMode} />} />
          </Routes>
        </Layout>
      </Router>
    </InventoryProvider>
  );
}

export default App;