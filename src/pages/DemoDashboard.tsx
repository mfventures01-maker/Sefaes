import React from 'react';
import { useSystemStore } from '../state/systemState';
import { AdminSetup } from '../ui/admin/AdminSetup';
import { TeacherExamPanel } from '../ui/teacher/TeacherExamPanel';
import { StudentTerminal } from '../ui/student/StudentTerminal';
import { UserRole } from '../domain/roles';
import {
  ShieldAlert,
  User,
  Users,
  Settings,
  ArrowRight,
  TrendingUp,
  Brain,
  Activity,
  Layers
} from 'lucide-react';

const DemoDashboard: React.FC = () => {
  const {
    systemState,
    activeExamEvent,
    studentsEnrolled,
    currentRole,
    setCurrentRole,
    reset
  } = useSystemStore();

  const statesList: Array<{ name: typeof systemState; label: string; desc: string }> = [
    { name: 'setup', label: '1. Setup', desc: 'Initialize school & seed students' },
    { name: 'ready', label: '2. Ready', desc: 'Teacher designs exam event' },
    { name: 'exam_active', label: '3. Live', desc: 'Students enter terminals & submit' },
    { name: 'grading', label: '4. Grading', desc: 'Compile submissions & finalize' },
    { name: 'completed', label: '5. Done', desc: 'Results locked & archived' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
      {/* Simulation Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              SEFAES Exam Event Kernel
            </h1>
          </div>
          <p className="text-slate-500 font-medium">
            Deterministic Finite State Machine • Phase 1 Core Specification
          </p>
        </div>

        {/* Global Reset */}
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-white hover:bg-slate-900 hover:text-white text-slate-600 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center space-x-2"
        >
          <Activity className="w-4 h-4" />
          <span>Reset Simulation</span>
        </button>
      </header>

      {/* Role Switcher Toolbar */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider">Simulated Identity Controller</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Switch roles below to simulate the institutional assessment flow
            </p>
          </div>
        </div>

        <div className="flex space-x-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700/50">
          {(['admin', 'teacher', 'student'] as UserRole[]).map((role) => {
            const isActive = currentRole === role;
            return (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>
      </section>

      {/* State Machine Progress Monitor */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statesList.map((s, idx) => {
          const isActive = systemState === s.name;
          const isDone = statesList.findIndex((item) => item.name === systemState) > idx;

          return (
            <div
              key={s.name}
              className={`p-5 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
                  : isDone
                  ? 'bg-slate-100/50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-100 opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    isActive ? 'text-indigo-600' : isDone ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
                {isActive && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />}
              </div>
              <h5 className="font-black text-slate-800 tracking-tight text-sm uppercase">{s.name}</h5>
              <p className="text-[10px] font-medium text-slate-500 mt-1 leading-snug">{s.desc}</p>
            </div>
          );
        })}
      </section>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Active Panel based on Simulated Role */}
        <main className="lg:col-span-8 space-y-6">
          <div className="border-l-4 border-indigo-600 pl-4 py-1">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              Active Console View
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Simulating: <span className="text-indigo-600 font-black">{currentRole}</span>
            </p>
          </div>

          {currentRole === 'admin' && <AdminSetup />}
          {currentRole === 'teacher' && <TeacherExamPanel />}
          {currentRole === 'student' && <StudentTerminal />}
        </main>

        {/* Right Side: Kernel Inspection Panel */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="border-l-4 border-slate-800 pl-4 py-1">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              Kernel Inspector
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Live Database Reflection
            </p>
          </div>

          <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-xl space-y-6">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                Current System Kernel State
              </h4>
              <div className="flex items-center space-x-3 bg-slate-800 p-4 rounded-xl border border-slate-700/50">
                <Layers className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">SystemState</p>
                  <p className="text-lg font-black tracking-tight text-white uppercase mt-0.5">
                    {systemState}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                Active Exam Event Payload
              </h4>
              {activeExamEvent ? (
                <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700/50 font-mono text-xs text-slate-300">
                  <div>
                    <span className="text-indigo-400">ID:</span> {activeExamEvent.id}
                  </div>
                  <div>
                    <span className="text-indigo-400">Title:</span> {activeExamEvent.title}
                  </div>
                  <div>
                    <span className="text-indigo-400">State:</span> {activeExamEvent.state}
                  </div>
                  <div>
                    <span className="text-indigo-400">Questions:</span> {activeExamEvent.questions.length}
                  </div>
                  <div>
                    <span className="text-indigo-400">Submissions:</span> {activeExamEvent.submissions.length}
                  </div>
                  <div className="pt-2 border-t border-slate-700 text-[10px] text-slate-400 space-y-1">
                    <div>Created: {new Date(activeExamEvent.createdAt).toLocaleTimeString()}</div>
                    {activeExamEvent.startedAt && (
                      <div>Started: {new Date(activeExamEvent.startedAt).toLocaleTimeString()}</div>
                    )}
                    {activeExamEvent.completedAt && (
                      <div>Completed: {new Date(activeExamEvent.completedAt).toLocaleTimeString()}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/50 text-center text-xs font-bold text-slate-500 uppercase">
                  No Active Exam Event Created
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                Enrolled Students
              </h4>
              {studentsEnrolled.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {studentsEnrolled.map((id) => (
                    <span
                      key={id}
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono font-bold"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-500 uppercase">
                  No students seeded yet
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DemoDashboard;
