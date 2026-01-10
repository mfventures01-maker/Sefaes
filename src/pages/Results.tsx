import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CheckCircle2, XCircle, ChevronLeft, Download, Award, Target, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { AssessmentResult } from '../types';
import { diffWords } from 'diff';

interface ResultsProps {
  result: AssessmentResult | null;
  onBack: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, onBack }) => {
  if (!result) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">No result found</h2>
        <button onClick={onBack} className="mt-4 text-indigo-600 font-bold hover:underline flex items-center justify-center mx-auto">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Go Back
        </button>
      </div>
    );
  }

  const chartData = [
    { name: 'Awarded', value: result.awardedPoints },
    { name: 'Remaining', value: result.maxPoints - result.awardedPoints }
  ];

  const COLORS = ['#4f46e5', '#e2e8f0'];

  const renderDiff = () => {
    if (!result.augmentedText) return <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{result.rawOcrText}</p>;
    
    const changes = diffWords(result.rawOcrText, result.augmentedText);
    
    return (
      <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
        {changes.map((part, index) => {
          if (part.added) {
            return <span key={index} className="bg-green-100 text-green-800 rounded px-0.5">{part.value}</span>;
          }
          if (part.removed) {
            return <span key={index} className="bg-red-100 text-red-800 line-through px-0.5">{part.value}</span>;
          }
          return <span key={index}>{part.value}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center text-slate-500 hover:text-slate-800 mb-2 font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Assessment
          </button>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assessment Results</h2>
          <p className="text-slate-500">Evaluation for <b>{result.studentName}</b> • {new Date(result.timestamp).toLocaleDateString()}</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all">
            <Download className="w-4 h-4" />
            <span>Save to Cloud</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Score Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Final Grade</h3>
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-slate-900">{result.finalGrade}</span>
                <span className="text-sm font-bold text-slate-500 mt-1">{result.awardedPoints}/{result.maxPoints} pts</span>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs font-bold text-indigo-700 uppercase mb-1">Similarity</p>
                <p className="text-2xl font-black text-indigo-900">{result.similarityScore}%</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Max Score</p>
                <p className="text-2xl font-black text-slate-800">{result.maxPoints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-indigo-600" />
              Keyword Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Matched Concepts</p>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords.map((kw, idx) => (
                    <span key={idx} className="flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-sm font-medium border border-green-100">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {kw}
                    </span>
                  ))}
                  {result.matchedKeywords.length === 0 && <p className="text-sm text-slate-400 italic">No matches found.</p>}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Missed Concepts</p>
                <div className="flex flex-wrap gap-2">
                  {result.missedKeywords.map((kw, idx) => (
                    <span key={idx} className="flex items-center px-2 py-1 bg-red-50 text-red-700 rounded text-sm font-medium border border-red-100">
                      <XCircle className="w-3 h-3 mr-1" />
                      {kw}
                    </span>
                  ))}
                  {result.missedKeywords.length === 0 && <p className="text-sm text-slate-400 italic">No missed keywords.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
                AI feedback & Summary
              </h3>
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="p-8">
              <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100 mb-8">
                <p className="text-indigo-900 leading-relaxed font-medium italic">
                  "{result.feedback}"
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest border-b border-slate-100 pb-2">
                    Evaluated Text Analysis
                  </h4>
                  <div className="prose prose-slate max-w-none">
                     {renderDiff()}
                  </div>
                </div>

                {result.augmentedText && (
                  <div className="flex items-start bg-blue-50 border border-blue-100 rounded-lg p-4 space-x-3">
                    <Sparkles className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      <b>Text Optimization Enabled:</b> We used an AI-cleaned version for grading to account for OCR errors or illegible handwriting, while preserving the student's original intent.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Core Competency</p>
                  <p className="text-lg font-extrabold text-slate-900">{result.similarityScore > 70 ? 'High Mastery' : result.similarityScore > 40 ? 'Moderate Mastery' : 'Limited Mastery'}</p>
                </div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Semantic Accuracy</p>
                  <p className="text-lg font-extrabold text-slate-900">{result.similarityScore}% Match</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;