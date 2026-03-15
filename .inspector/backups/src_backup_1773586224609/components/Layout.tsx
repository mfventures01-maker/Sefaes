import React, { useState } from 'react';
import { Home, ClipboardCheck, Settings, Users, FileText, Menu, X, LogOut, FileSearch, Building, BookOpen, BarChart2, ShieldCheck } from 'lucide-react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { clearSession } = useStore();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/school-settings', label: 'School Settings', icon: Building },
    { path: '/classes', label: 'Classes', icon: Settings },
    { path: '/students', label: 'Students', icon: Users },
    { path: '/subjects', label: 'Subjects', icon: BookOpen },
    { path: '/exams', label: 'Exams', icon: FileText },
    { path: '/scripts', label: 'Scripts', icon: ClipboardCheck },
    { path: '/grading', label: 'Grading Queue', icon: FileSearch },
    { path: '/results', label: 'Results', icon: BarChart2 },
    { path: '/marking-schemes', label: 'Marking Schemes', icon: ShieldCheck },
  ];

  const handleLogout = () => {
    clearSession();
    navigate('/register-school');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
          <span className="font-bold text-lg">S</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">SEFAES</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
              <span className="font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">SEFAES</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-slate-300 hover:bg-slate-800 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 shadow-xl flex flex-col pt-16" onClick={e => e.stopPropagation()}>
              <button
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
              <SidebarContent />
            </div>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;