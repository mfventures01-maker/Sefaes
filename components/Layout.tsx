import React from 'react';
import { BookOpen, FileText, Settings, Home, Menu, X } from 'lucide-react';
import { AppState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeState: AppState;
  onNavigate: (state: AppState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeState, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const NavItem = ({ state, icon: Icon, label }: { state: AppState; icon: any; label: string }) => (
    <button
      onClick={() => {
        onNavigate(state);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-6 py-4 text-sm font-medium transition-colors duration-200
        ${activeState === state 
          ? 'text-indigo-600 bg-indigo-50 border-r-4 border-indigo-600' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">SEFAES</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col space-y-1">
          <NavItem state={AppState.HOME} icon={Home} label="Dashboard" />
          <NavItem state={AppState.ASSESS} icon={FileText} label="Process Essays" />
          <NavItem state={AppState.RESULTS} icon={BookOpen} label="Results Analytics" />
          <NavItem state={AppState.ADMIN} icon={Settings} label="Admin / Schemes" />
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-100">
          <div className="bg-indigo-50 rounded-xl p-4">
            <h4 className="text-indigo-900 font-semibold text-sm">Pro Mode Active</h4>
            <p className="text-indigo-600 text-xs mt-1">Using Gemini 2.5 Flash for high-speed analysis.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-slate-200">
           <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-lg text-slate-800">SEFAES</span>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
