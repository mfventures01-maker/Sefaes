import React, { useState } from 'react';
import { useSystemStore } from '../../state/systemState';
import { examEventEngine } from '../../engine/examEventEngine';
import { Database, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminSetup: React.FC = () => {
  const { systemState, institutionName, studentsEnrolled, currentRole, reset } = useSystemStore();
  const [schoolName, setSchoolName] = useState('Lagos City Academy');
  const [studentsInput, setStudentsInput] = useState('STU-001, STU-002, STU-003, STU-004');
  const [error, setError] = useState<string | null>(null);

  const handleInitialize = () => {
    try {
      setError(null);
      const studentIds = studentsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (studentIds.length === 0) {
        throw new Error('Please enter at least one enrolled student ID.');
      }

      examEventEngine.initializeSystem(currentRole, schoolName, studentIds);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Admin Control Center</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Boot & Seed Configuration</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
          systemState === 'setup' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          State: {systemState}
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-black text-rose-600 uppercase tracking-tight">
          Error: {error}
        </div>
      )}

      {systemState === 'setup' ? (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              Institution Name
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              placeholder="e.g., Lagos City Academy"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              Enrolled Student IDs (Comma Separated)
            </label>
            <textarea
              value={studentsInput}
              onChange={(e) => setStudentsInput(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
              placeholder="STU-001, STU-002, STU-003"
            />
          </div>

          <button
            onClick={handleInitialize}
            className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-md uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>Initialize Institution & Set Ready</span>
          </button>
        </div>
      ) : (
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-start space-x-3 text-slate-600">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-800">
                System is initialized and <span className="text-indigo-600 font-black">READY</span>.
              </p>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase">
                Active Institution: <span className="font-bold text-slate-600">{institutionName}</span>
              </p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase">
                Enrolled Students: <span className="font-bold text-slate-600">{studentsEnrolled.length} ({studentsEnrolled.join(', ')})</span>
              </p>
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full py-3 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset System Kernel</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSetup;
