import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { Menu, X } from 'lucide-react';

const PortalLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Desktop Fixed & Mobile Drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 border-r border-slate-700 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="absolute right-0 top-0 -mr-12 pt-4 lg:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-slate-800"
                    >
                        <span className="sr-only">Close sidebar</span>
                        <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                </div>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sm:px-6">
                    <div className="flex flex-1 items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                <span className="font-extrabold text-sm">S</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">SEFAES</span>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Desktop Top Header (Optional - Can add user profile, notifications) */}
                <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center px-8 shadow-sm justify-end">
                    <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium text-slate-600">Admin Portal</div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center ring-2 ring-slate-200">
                            <span className="text-indigo-600 font-bold text-xs uppercase">AD</span>
                        </div>
                    </div>
                </header>

                {/* Main scrollable area */}
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PortalLayout;
