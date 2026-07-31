import React, { useState } from 'react';
import { useSystemStore } from '../../state/systemState';
import { examEventEngine } from '../../engine/examEventEngine';
import { BookOpen, Send, CheckSquare, Eye, Loader2 } from 'lucide-react';
import { ExamQuestion } from '../../domain/examEvent';

export const TeacherExamPanel: React.FC = () => {
  const { systemState, activeExamEvent, currentRole } = useSystemStore();
  const [examTitle, setExamTitle] = useState('Biology Terminal Quiz');
  const [error, setError] = useState<string | null>(null);

  // Hardcoded standard template questions (these are real payload questions, not mock runtime UI states)
  const defaultQuestions: ExamQuestion[] = [
    {
      id: 'Q1',
      questionText: 'What is the primary function of mitochondria in a cell?',
      options: [
        'A. Photosynthesis',
        'B. Cellular respiration & ATP generation',
        'C. Protein synthesis',
        'D. Storage of water & waste'
      ]
    },
    {
      id: 'Q2',
      questionText: 'Which organelle contains chlorophyll and absorbs sunlight?',
      options: [
        'A. Ribosome',
        'B. Nucleus',
        'C. Chloroplast',
        'D. Golgi apparatus'
      ]
    }
  ];

  const handleCreate = () => {
    try {
      setError(null);
      examEventEngine.createExamEvent(
        currentRole,
        'SCHOOL-MAIN',
        'TEACHER-001',
        examTitle,
        defaultQuestions
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePublish = () => {
    if (!activeExamEvent) return;
    try {
      setError(null);
      examEventEngine.publishExamEvent(currentRole, activeExamEvent.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleComplete = () => {
    if (!activeExamEvent) return;
    try {
      setError(null);
      examEventEngine.completeExamEvent(currentRole, activeExamEvent.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Teacher Exam Console</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Exam Lifecycle Controller</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
          systemState === 'ready' ? 'bg-indigo-50 text-indigo-600' :
          systemState === 'exam_active' ? 'bg-red-50 text-red-600' :
          systemState === 'grading' ? 'bg-amber-50 text-amber-600' :
          systemState === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
        }`}>
          State: {systemState}
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-black text-rose-600 uppercase tracking-tight">
          Error: {error}
        </div>
      )}

      {/* State-Based Operations */}
      <div className="space-y-4">
        {systemState === 'setup' && (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Waiting for admin to initialize system...
            </p>
          </div>
        )}

        {systemState === 'ready' && (
          <div className="space-y-4">
            {!activeExamEvent ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Questions Included:
                  </span>
                  {defaultQuestions.map((q, idx) => (
                    <div key={q.id} className="text-xs font-semibold text-slate-600">
                      {idx + 1}. {q.questionText}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleCreate}
                  className="w-full py-4 bg-emerald-600 hover:bg-slate-900 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-md uppercase tracking-wider flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Create Exam Event</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-wider">Exam Event Created</p>
                  <h4 className="text-md font-black text-slate-800 mt-1">{activeExamEvent.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 font-mono mt-1">ID: {activeExamEvent.id}</p>
                </div>
                <button
                  onClick={handlePublish}
                  className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-md uppercase tracking-wider flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Exam Event (Go Live)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {systemState === 'exam_active' && activeExamEvent && (
          <div className="p-5 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <p className="text-xs font-black text-rose-600 uppercase tracking-wider">Exam Event Live</p>
            </div>
            <h4 className="text-md font-black text-slate-800">{activeExamEvent.title}</h4>
            <p className="text-xs font-bold text-slate-500">
              Students are currently taking the exam. Waiting for student submissions...
            </p>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Submissions received: {activeExamEvent.submissions.length}
              </span>
            </div>
          </div>
        )}

        {systemState === 'grading' && activeExamEvent && (
          <div className="space-y-4">
            <div className="p-5 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-3">
              <p className="text-xs font-black text-amber-600 uppercase tracking-wider">Grading Queue Active</p>
              <h4 className="text-md font-black text-slate-800">{activeExamEvent.title}</h4>
              <p className="text-xs font-bold text-slate-500">
                All exam scripts submitted. Ready to compile and lock scores.
              </p>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                  Submissions To Grade:
                </span>
                {activeExamEvent.submissions.map((sub) => (
                  <div key={sub.studentId} className="flex justify-between items-center text-xs font-bold text-slate-600 py-1 bg-white px-3 rounded-lg border border-slate-100 mb-1">
                    <span>Student: {sub.studentId}</span>
                    <span className="text-amber-600">Pending Evaluation</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleComplete}
              className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-md uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Finalize Grading & Complete Event</span>
            </button>
          </div>
        )}

        {systemState === 'completed' && activeExamEvent && (
          <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
            <p className="text-xs font-black text-emerald-600 uppercase tracking-wider">Exam Event Completed</p>
            <h4 className="text-md font-black text-slate-800">{activeExamEvent.title}</h4>
            <p className="text-xs font-bold text-slate-500">
              Exam has concluded. All results are locked.
            </p>
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Final Student Submissions:
              </span>
              {activeExamEvent.submissions.map((sub) => (
                <div key={sub.studentId} className="flex justify-between items-center text-xs font-bold text-slate-700 py-1 bg-white px-3 rounded-lg border border-slate-100">
                  <span>Student: {sub.studentId}</span>
                  <span className="text-emerald-600 font-black">SUBMITTED & GRADED</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherExamPanel;
