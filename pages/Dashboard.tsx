import React from 'react';
import { Upload, Zap, CheckCircle, BarChart } from 'lucide-react';
import { AppState } from '../types';

interface DashboardProps {
  onNavigate: (state: AppState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      <div className="text-center py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Automated Essay Evaluation
          <span className="block text-indigo-600">Without The Bias</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-8">
          SEFAES utilizes advanced OCR and semantic analysis to grade handwritten essays 
          fairly, consistently, and instantly. Powered by PaddleOCR and Gemini.
        </p>
        <button 
          onClick={() => onNavigate(AppState.ASSESS)}
          className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:scale-105"
        >
          <Upload className="w-5 h-5 mr-2" />
          Start New Assessment
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Instant OCR</h3>
          <p className="text-slate-600">
            Upload handwritten documents or PDF scans. Our engine converts them to text in seconds.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Unbiased Scoring</h3>
          <p className="text-slate-600">
            Semantic matching against reference answers ensures objective grading free from emotional bias.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <BarChart className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Deep Analytics</h3>
          <p className="text-slate-600">
            Get detailed feedback on missing concepts, keyword usage, and suggestions for improvement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
