import React, { useState } from 'react';
import { Plus, Trash2, Shield, Repeat, Layout as LayoutIcon, Type, MessageSquare, AlertCircle } from 'lucide-react';
import { MarkingScheme, CustomRules } from '../types';

interface AdminProps {
  schemes: MarkingScheme[];
  onAddScheme: (scheme: MarkingScheme) => void;
  onDeleteScheme: (id: string) => void;
}

const Admin: React.FC<AdminProps> = ({ schemes, onAddScheme, onDeleteScheme }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newScheme, setNewScheme] = useState<Partial<MarkingScheme>>({
    id: '',
    subject: '',
    question: '',
    referenceAnswer: '',
    keywords: [],
    maxScore: 10,
    customRules: {
      strictGrammar: false,
      penalizeRepetition: false,
      requireStructure: false,
      additionalInstructions: ''
    }
  });

  const [keywordInput, setKeywordInput] = useState('');

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !newScheme.keywords?.includes(keywordInput.trim())) {
      setNewScheme({
        ...newScheme,
        keywords: [...(newScheme.keywords || []), keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setNewScheme({
      ...newScheme,
      keywords: newScheme.keywords?.filter(k => k !== kw)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newScheme.id && newScheme.subject && newScheme.question) {
      onAddScheme(newScheme as MarkingScheme);
      setIsAdding(false);
      setNewScheme({
        id: '',
        subject: '',
        question: '',
        referenceAnswer: '',
        keywords: [],
        maxScore: 10,
        customRules: {
          strictGrammar: false,
          penalizeRepetition: false,
          requireStructure: false,
          additionalInstructions: ''
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Marking Schemes</h2>
          <p className="text-slate-500">Create and manage grading rules for different questions.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
        >
          {isAdding ? <Type className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{isAdding ? 'View Schemes' : 'Add New Scheme'}</span>
        </button>
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Create New Marking Scheme</h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Question ID / Code</label>
                <input 
                  type="text" 
                  value={newScheme.id}
                  onChange={e => setNewScheme({...newScheme, id: e.target.value})}
                  className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500" 
                  placeholder="e.g. ENG-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Subject</label>
                <input 
                  type="text" 
                  value={newScheme.subject}
                  onChange={e => setNewScheme({...newScheme, subject: e.target.value})}
                  className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500" 
                  placeholder="e.g. English Literature"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Max Score (Points)</label>
                <input 
                  type="number" 
                  value={newScheme.maxScore}
                  onChange={e => setNewScheme({...newScheme, maxScore: parseInt(e.target.value)})}
                  className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500" 
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Question Text</label>
                <textarea 
                  value={newScheme.question}
                  onChange={e => setNewScheme({...newScheme, question: e.target.value})}
                  className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500 min-h-[100px]" 
                  placeholder="Type the full question here..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Reference Answer (Ideal Response)</label>
                <textarea 
                  value={newScheme.referenceAnswer}
                  onChange={e => setNewScheme({...newScheme, referenceAnswer: e.target.value})}
                  className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500 min-h-[150px]" 
                  placeholder="What is the perfect answer?"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Key Concepts / Keywords</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value)}
                    className="flex-1 rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Add a required concept..."
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  />
                  <button 
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-6 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {newScheme.keywords?.map(kw => (
                    <span key={kw} className="inline-flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                      {kw}
                      <button onClick={() => handleRemoveKeyword(kw)} className="ml-2 hover:text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {newScheme.keywords?.length === 0 && <p className="text-slate-400 text-xs italic">No keywords added yet.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-indigo-600" />
              Advanced Grading Rules
            </h4>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    id="strictGrammar"
                    checked={newScheme.customRules?.strictGrammar}
                    onChange={e => setNewScheme({
                      ...newScheme, 
                      customRules: {...newScheme.customRules as CustomRules, strictGrammar: e.target.checked}
                    })}
                    className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="strictGrammar" className="cursor-pointer">
                    <span className="block font-semibold text-slate-900">Strict Grammar & Spelling</span>
                    <span className="text-sm text-slate-500">Deduct points if writing has significant errors.</span>
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    id="penalizeRepetition"
                    checked={newScheme.customRules?.penalizeRepetition}
                    onChange={e => setNewScheme({
                      ...newScheme, 
                      customRules: {...newScheme.customRules as CustomRules, penalizeRepetition: e.target.checked}
                    })}
                    className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="penalizeRepetition" className="cursor-pointer">
                    <span className="block font-semibold text-slate-900">Penalize Repetition</span>
                    <span className="text-sm text-slate-500">Deduct points for redundant phrasing.</span>
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    id="requireStructure"
                    checked={newScheme.customRules?.requireStructure}
                    onChange={e => setNewScheme({
                      ...newScheme, 
                      customRules: {...newScheme.customRules as CustomRules, requireStructure: e.target.checked}
                    })}
                    className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="requireStructure" className="cursor-pointer">
                    <span className="block font-semibold text-slate-900">Required Essay Structure</span>
                    <span className="text-sm text-slate-500">Check for Intro, Body, and Conclusion.</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Expected Tone</label>
                  <select 
                    value={newScheme.customRules?.toneExpectation}
                    onChange={e => setNewScheme({
                      ...newScheme, 
                      customRules: {...newScheme.customRules as CustomRules, toneExpectation: e.target.value as any}
                    })}
                    className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Creative">Creative</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Additional AI Instructions</label>
                  <input 
                    type="text" 
                    value={newScheme.customRules?.additionalInstructions}
                    onChange={e => setNewScheme({
                      ...newScheme, 
                      customRules: {...newScheme.customRules as CustomRules, additionalInstructions: e.target.value}
                    })}
                    className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-indigo-500" 
                    placeholder="e.g. 'Use technical terms from Chapter 5'"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-8 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
              >
                Save Marking Scheme
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid gap-6">
          {schemes.map(scheme => (
            <div key={scheme.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:border-indigo-200 transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded mb-2 uppercase tracking-wider">
                      {scheme.subject}
                    </span>
                    <h4 className="text-xl font-bold text-slate-900">[{scheme.id}] {scheme.question.substring(0, 100)}...</h4>
                  </div>
                  <button 
                    onClick={() => onDeleteScheme(scheme.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Scheme"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center text-slate-600 text-sm">
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Max Points: <b>{scheme.maxScore}</b></span>
                  </div>
                  <div className="flex items-center text-slate-600 text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    <span>Keywords: <b>{scheme.keywords.length}</b></span>
                  </div>
                  {scheme.customRules.strictGrammar && (
                    <div className="flex items-center text-green-600 text-sm bg-green-50 px-2 py-1 rounded">
                      <Shield className="w-3 h-3 mr-1" />
                      Strict Grammar
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-500 italic">Reference Answer provided: {scheme.referenceAnswer.length} characters</p>
                <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Edit Details</button>
              </div>
            </div>
          ))}

          {schemes.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No marking schemes created yet.</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-4 text-indigo-600 font-bold hover:underline"
              >
                Create your first scheme
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;