import React, { useState } from 'react';
import { useSystemStore } from '../../state/systemState';
import { examEventEngine } from '../../engine/examEventEngine';
import { GraduationCap, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export const StudentTerminal: React.FC = () => {
  const {
    systemState,
    activeExamEvent,
    studentsEnrolled,
    currentRole,
    currentStudentId,
    setCurrentStudentId
  } = useSystemStore();

  const [joined, setJoined] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleJoin = () => {
    if (!currentStudentId) {
      setError('Please select a student ID to simulate.');
      return;
    }
    if (!activeExamEvent) return;

    try {
      setError(null);
      examEventEngine.joinExamEvent(currentRole, activeExamEvent.id, currentStudentId);
      setJoined(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOptionChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = () => {
    if (!activeExamEvent || !currentStudentId) return;
    try {
      setError(null);
      // Validate that all questions are answered
      const unanswered = activeExamEvent.questions.some((q) => !answers[q.id]);
      if (unanswered) {
        throw new Error('Please answer all questions before submitting.');
      }

      examEventEngine.submitExamEvent(
        currentRole,
        activeExamEvent.id,
        currentStudentId,
        answers
      );
      setJoined(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Determine if this student has already submitted
  const hasSubmitted = activeExamEvent?.submissions.some(
    (sub) => sub.studentId === currentStudentId
  );

  // If state is not active or no event exists, show NO ACTIVE EXAM EVENT
  if (systemState !== 'exam_active' || !activeExamEvent) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
            NO ACTIVE EXAM EVENT
          </h3>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mt-2">
            The exam is not currently in progress or active.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Student Assessment Deck</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeExamEvent.title}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-red-50 text-red-600 animate-pulse">
          LIVE EVENT ACTIVE
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-black text-rose-600 uppercase tracking-tight">
          Error: {error}
        </div>
      )}

      {!joined && !hasSubmitted ? (
        <div className="space-y-4">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Select Student Identity (Simulation)
            </label>
            <select
              value={currentStudentId || ''}
              onChange={(e) => {
                setCurrentStudentId(e.target.value || null);
                setError(null);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700"
            >
              <option value="">-- Choose Enrolled Student --</option>
              {studentsEnrolled.map((id) => (
                <option key={id} value={id}>
                  Student ID: {id}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleJoin}
            className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-md uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <span>Enter Terminal & Start Exam</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : hasSubmitted ? (
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-md font-black text-slate-800 uppercase tracking-tight">Answers Submitted</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
              Your terminal has synchronized and locked all responses.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs font-bold text-indigo-700">
            Simulating Student: <span className="font-black">{currentStudentId}</span>
          </div>

          <div className="space-y-6">
            {activeExamEvent.questions.map((q, idx) => (
              <div key={q.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <p className="text-sm font-black text-slate-800">
                  {idx + 1}. {q.questionText}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleOptionChange(q.id, opt)}
                        className={`text-left p-3.5 rounded-xl text-xs font-black transition-all border ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-rose-600 hover:bg-slate-900 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-md uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Exam Answers</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentTerminal;
