import React, { useState } from 'react';
import {  PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AssessmentResult } from '../types';
import { ArrowLeft, Download, Check, X, FileText, Sparkles, GitCompare } from 'lucide-react';
import { diffWords } from 'diff';

interface ResultsProps {
  result: AssessmentResult | null;
  onBack: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, onBack }) => {
  const [activeTab, setActiveTab] = useState<'raw' | 'augmented' | 'diff'>(result?.augmentedText ? 'augmented' : 'raw');

  if (!result) return <div className="text-center p-12">No results available yet.</div>;

  const scoreData = [
    { name: 'Score', value: result.similarityScore },
    { name: 'Remaining', value: 100 - result.similarityScore }
  ];
  
  const COLORS = ['#4F46E5', '#E2E8F0'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Assessment
        </button>
        <div className="flex items-center space-x-2">
           <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Question ID:</span>
           <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{result.questionId}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Final Score</h3>
          <div className="h-48 w-full relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">{result.awardedPoints} / {result.maxPoints}</span>
                <span className="text-sm text-slate-500 font-medium">Points</span>
             </div>
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Final Grade</span>
            <div className={`text-3xl font-bold mt-1 
              ${['A', 'A+'].includes(result.finalGrade) ? 'text-green-600' : 
                ['B', 'B+'].includes(result.finalGrade) ? 'text-blue-600' :
                ['C', 'D'].includes(result.finalGrade) ? 'text-yellow-600' : 'text-red-600'
              }`}>
              {result.finalGrade}
            </div>
            <p className="text-xs text-slate-400 mt-2">({result.similarityScore}% semantic match)</p>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-slate-700">AI Feedback Summary</h3>
            <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600">
              <Download className="w-5 h-5" />
            </button>
          </div>
          <p className="text-slate-600 leading-relaxed mb-6 italic">
            "{result.feedback}"
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <h4 className="flex items-center text-green-800 font-semibold mb-3">
                <Check className="w-4 h-4 mr-2" />
                Matched Concepts
              </h4>
              <ul className="space-y-2">
                {result.matchedKeywords.length > 0 ? (
                  result.matchedKeywords.map((k, i) => (
                    <li key={i} className="flex items-start text-sm text-green-700">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                      {k}
                    </li>
                  ))
                ) : <span className="text-sm text-green-600 italic">None detected</span>}
              </ul>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <h4 className="flex items-center text-red-800 font-semibold mb-3">
                <X className="w-4 h-4 mr-2" />
                Missed Concepts
              </h4>
              <ul className="space-y-2">
                 {result.missedKeywords.length > 0 ? (
                  result.missedKeywords.map((k, i) => (
                    <li key={i} className="flex items-start text-sm text-red-700">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                      {k}
                    </li>
                  ))
                ) : <span className="text-sm text-red-600 italic">None missed!</span>}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Text Analysis Viewer */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
           <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Analyzed Text Content</h3>
           {result.augmentedText && (
             <div className="flex space-x-1 bg-white rounded-lg p-1 border border-slate-200">
               <button 
                 onClick={() => setActiveTab('raw')}
                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'raw' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
               >
                 Raw OCR
               </button>
               <button 
                 onClick={() => setActiveTab('augmented')}
                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center ${activeTab === 'augmented' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}
               >
                 <Sparkles className="w-3 h-3 mr-1" />
                 Augmented
               </button>
               <button 
                 onClick={() => setActiveTab('diff')}
                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center ${activeTab === 'diff' ? 'bg-orange-50 text-orange-700' : 'text-slate-500 hover:text-slate-900'}`}
               >
                 <GitCompare className="w-3 h-3 mr-1" />
                 Diff View
               </button>
             </div>
           )}
        </div>
        
        <div className="p-6">
          {activeTab === 'raw' && (
             <div className="prose prose-sm max-w-none text-slate-600 font-mono whitespace-pre-wrap">
               {result.rawOcrText}
             </div>
          )}
          {activeTab === 'augmented' && (
            <div className="prose prose-sm max-w-none text-indigo-900 font-mono whitespace-pre-wrap bg-indigo-50/50 p-4 rounded-lg border border-indigo-50">
               {result.augmentedText}
             </div>
          )}
          {activeTab === 'diff' && result.augmentedText && (
            <div className="prose prose-sm max-w-none font-mono whitespace-pre-wrap text-sm leading-relaxed">
               {diffWords(result.rawOcrText, result.augmentedText).map((part, index) => (
                 <span 
                    key={index} 
                    className={`${
                        part.added ? 'bg-green-100 text-green-700 border-b-2 border-green-200' : 
                        part.removed ? 'bg-red-50 text-red-400 line-through decoration-red-300 opacity-70 mx-0.5 select-none' : 
                        'text-slate-500'
                    }`}
                    title={part.added ? 'Added by AI' : part.removed ? 'Removed from OCR' : 'Unchanged'}
                >
                    {part.value}
                </span>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;