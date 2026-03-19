import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BookOpen, GraduationCap, CheckCircle, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { gradingService } from '../services/gradingService';

const Dashboard: React.FC = () => {
  const { schoolId } = useStore();
  const [results, setResults] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    avgScore: 0,
    highestScore: 0,
    lowestScore: 0,
    passRate: 0,
    totalGraded: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [schoolId]);

  const fetchDashboardData = async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await gradingService.loadAllGradingResults(schoolId);

      // PHASE 1 & 2: Normalize data to array
      const safeData = data ?? [];

      const formatted = safeData.map((d: any) => ({
        id: d.id,
        studentName: d.answer_scripts?.students ? `${d.answer_scripts.students.first_name} ${d.answer_scripts.students.last_name}` : 'Unknown',
        examTitle: d.answer_scripts?.exams?.exam_title || 'Unknown Exam',
        score: d.score,
        feedback: d.ai_feedback,
      }));

      // PHASE 3: Guarded state update
      setResults(formatted);

      // Calculate Metrics Defensively
      if (formatted.length > 0) {
        const scores = formatted.map(f => f.score);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);

        const passed = scores.filter(s => s >= 50).length;
        const passRate = (passed / scores.length) * 100;

        setMetrics({
          avgScore: Math.round(avg),
          highestScore: highest,
          lowestScore: lowest,
          passRate: Math.round(passRate),
          totalGraded: formatted.length
        });
      } else {
        setMetrics({
          avgScore: 0,
          highestScore: 0,
          lowestScore: 0,
          passRate: 0,
          totalGraded: 0
        });
      }
    } catch (err: any) {
      console.error('DASHBOARD_FETCH_FAILURE:', err);
      setError(err.message || 'Failed to load dashboard metrics.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!schoolId) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">No School Registered</h2>
        <p className="mt-2 text-slate-600">Please register a school first.</p>
      </div>
    );
  }

  // Chart Data format for Recharts
  // Group by score distribution (0-20, 21-40, 41-60, 61-80, 81-100)
  const distribution = [
    { range: '0-20', count: results.filter(r => r.score <= 20).length },
    { range: '21-40', count: results.filter(r => r.score > 20 && r.score <= 40).length },
    { range: '41-60', count: results.filter(r => r.score > 40 && r.score <= 60).length },
    { range: '61-80', count: results.filter(r => r.score > 60 && r.score <= 80).length },
    { range: '81-100', count: results.filter(r => r.score > 80).length },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">School Analytics Dashboard</h2>
        <p className="text-slate-500">Overview of academic performance and recent AI grading batches.</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Synchronizing with SEFAES Core...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center space-x-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <div>
            <h3 className="font-bold">Dashboard Synchronization Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="bg-indigo-50 border border-indigo-100 p-12 rounded-[2rem] text-center">
          <TrendingUp className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready for Intelligence</h3>
          <p className="text-slate-600 max-w-md mx-auto mb-8">
            Your environment is initialized. Start uploading exam scripts and the AI engine will populate this dashboard with real-time analytics.
          </p>
          <button
            onClick={() => window.location.href = '/portal/secondary/scripts'}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
          >
            Upload First Script
          </button>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <>


          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-500">Average Score</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{metrics.avgScore}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-500">Highest Score</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{metrics.highestScore}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-500">Pass Rate</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{metrics.passRate}%</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-500">Total Graded</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{metrics.totalGraded}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Column */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Score Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="range" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table Column */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Recent Grading Results</h3>
              </div>

              <div className="overflow-x-auto h-[400px] overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {results.length > 0 ? results.map((result) => (
                      <tr key={result.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {result.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {result.examTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.score >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {result.score} / 100
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          <div className="max-w-xs truncate" title={result.feedback}>
                            {result.feedback}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                          No graded scripts available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};




export default Dashboard;