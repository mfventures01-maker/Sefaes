import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useInstitutionStore } from '../store/useInstitutionStore';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    FileText,
    CheckSquare,
    BarChart,
    Settings,
    LogOut,
    Building,
    GraduationCap,
    HardHat,
    FolderTree,
    FileBarChart,
    Target
} from 'lucide-react';

interface SidebarProps {
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
    const { institutionType, clearInstitution } = useInstitutionStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearInstitution();
        // Assuming you have an auth logout process here, clear session
        localStorage.clear();
        navigate('/login');
    };

    const menuMap = {
        secondary: [
            { label: 'Dashboard', path: '/portal/secondary/dashboard', icon: LayoutDashboard },
            { label: 'Students', path: '/portal/secondary/students', icon: GraduationCap },
            { label: 'Exams', path: '/portal/secondary/exams', icon: FileText },
            { label: 'Scripts', path: '/portal/secondary/scripts', icon: CheckSquare },
            { label: 'Grading', path: '/portal/secondary/grading', icon: Target },
            { label: 'Results', path: '/portal/secondary/results', icon: FileBarChart },
        ],
        university: [
            { label: 'Dashboard', path: '/portal/university/dashboard', icon: LayoutDashboard },
            { label: 'Faculties', path: '/portal/university/faculties', icon: Building },
            { label: 'Departments', path: '/portal/university/departments', icon: FolderTree },
            { label: 'Courses', path: '/portal/university/courses', icon: BookOpen },
            { label: 'Students', path: '/portal/university/students', icon: GraduationCap },
            { label: 'Exams', path: '/portal/university/exams', icon: FileText },
            { label: 'Scripts', path: '/portal/university/scripts', icon: CheckSquare },
            { label: 'Grading', path: '/portal/university/grading', icon: Target },
            { label: 'Results', path: '/portal/university/results', icon: FileBarChart },
            { label: 'Analytics', path: '/portal/university/analytics', icon: BarChart },
        ],
        polytechnic: [
            { label: 'Dashboard', path: '/portal/polytechnic/dashboard', icon: LayoutDashboard },
            { label: 'Faculties', path: '/portal/polytechnic/faculties', icon: Building },
            { label: 'Departments', path: '/portal/polytechnic/departments', icon: FolderTree },
            { label: 'Courses', path: '/portal/polytechnic/courses', icon: BookOpen },
            { label: 'Students', path: '/portal/polytechnic/students', icon: GraduationCap },
            { label: 'Exams', path: '/portal/polytechnic/exams', icon: FileText },
            { label: 'Scripts', path: '/portal/polytechnic/scripts', icon: CheckSquare },
            { label: 'Grading', path: '/portal/polytechnic/grading', icon: Target },
            { label: 'Results', path: '/portal/polytechnic/results', icon: FileBarChart },
            { label: 'Analytics', path: '/portal/polytechnic/analytics', icon: BarChart },
        ],
        corporate: [
            { label: 'Dashboard', path: '/portal/corporate/dashboard', icon: LayoutDashboard },
            { label: 'Employees', path: '/portal/corporate/employees', icon: HardHat },
            { label: 'Training Modules', path: '/portal/corporate/training', icon: BookOpen },
            { label: 'Assessments', path: '/portal/corporate/assessments', icon: CheckSquare },
            { label: 'Reports', path: '/portal/corporate/reports', icon: FileBarChart },
            { label: 'Analytics', path: '/portal/corporate/analytics', icon: BarChart },
        ]
    };

    const type = institutionType || 'secondary';
    const menuItems = menuMap[type];

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300">
            <div className="flex items-center space-x-3 px-6 py-6 border-b border-slate-800">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <span className="font-extrabold text-xl">S</span>
                </div>
                <span className="text-2xl font-black tracking-tight text-white">SEFAES</span>
            </div>

            <div className="px-6 py-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Workspace</div>
                <div className="font-semibold text-slate-200 capitalize">{type} Portal</div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${isActive
                                ? 'bg-indigo-600/10 text-indigo-400'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 mr-3 shrink-0" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-semibold text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
