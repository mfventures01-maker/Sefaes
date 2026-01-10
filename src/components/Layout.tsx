import React from 'react';
import { AppState } from '../types';
import { Home, ClipboardCheck, Settings, BarChart3, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeState: AppState;
  onNavigate: (state: AppState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeState, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: AppState.HOME, label: 'Dashboard', icon: Home },
    { id: AppState.ASSESS, label: 'New Assessment', icon: ClipboardCheck },
    { id: AppState.ADMIN, label: 'Marking Schemes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div 
                className="flex-shrink-0 flex items-center cursor-pointer group"
                onClick={() => onNavigate(AppState.HOME)}
              >
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:bg-indigo-700 transition-colors">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="ml-3 text-xl font-bold text-slate-900 tracking-tight">SEFAES</span>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                    ${activeState === item.id 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold
                  ${activeState === item.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2026 SEFAES - Sentiment and Emotion Free Assessment and Evaluation System</p>
          <p className="mt-1 font-medium text-slate-400 italic">"Objective Grading for Fair Education"</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;