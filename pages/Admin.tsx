import React, { useState } from 'react';
import { MarkingScheme } from '../types';
import { Plus, Trash2, Save, Sliders, MessageSquare, BookOpen, AlertTriangle, PenTool, Layout as LayoutIcon } from 'lucide-react';

interface AdminProps {
  schemes: MarkingScheme[];
  onAddScheme: (s: MarkingScheme) => void;
  onDeleteScheme: (id: string) => void;
}

const Admin: React.FC<AdminProps> = ({ schemes, onAddScheme, onDeleteScheme }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newScheme, setNewScheme] = useState<Partial<MarkingScheme>>({
    subject: '',
    question: '',
    referenceAnswer: '',
    keywords: [],
    maxScore: 10,
    customRules: {
      strictGrammar: false,
      penalizeRepetition: false,
      repetitionSeverity: 'Medium',
      requireStructure: false,
      structureComponents: '',
      toneExpectation: 'Academic',
      additionalInstructions: ''
    }
  });

  const handleSave = () => {
    if (newScheme.subject && newScheme.question && newScheme.referenceAnswer) {
      onAddScheme({
        id: Date.now().toString(),
        subject: newScheme.subject,
        question: newScheme.question,
        referenceAnswer: newScheme.referenceAnswer,
        keywords: newScheme.keywords || [],
        maxScore: newScheme.maxScore || 10,
        customRules: newScheme.customRules || {
          strictGrammar: false,
          penalizeRepetition: false,
          requireStructure: false,
          toneExpectation: 'Academic',
          additionalInstructions: ''
        }
      });
      setIsAdding(false);
      setNewScheme({ 
        subject: '', 
        question: '', 
        referenceAnswer: '', 
        keywords: [], 
        maxScore: 10,
        customRules: {
          strictGrammar: false,
          penalizeRepetition: false,
          repetitionSeverity: 'Medium',
          requireStructure: false,
          structureComponents: '',
          toneExpectation: 'Academic',
          additionalInstructions: ''
        }
      });
    }
  };

  const toggleRule = (rule: keyof typeof newScheme.customRules) => {
    if (newScheme.customRules) {
      setNewScheme({
        ...newScheme,
        customRules: {
          ...newScheme.customRules,
          [rule]: !newScheme.customRules[rule as keyof typeof newScheme.customRules]
        }
      });
    }
  };

  const updateRuleValue = (field: string, value: any) => {
    if (newScheme.customRules) {
      setNewScheme({
        ...newScheme,
        customRules: {
          ...newScheme.customRules,
          [field]: value
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Marking Schemes</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Scheme
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-xl border border-indigo-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-indigo-900">Define New Assessment Criteria</h2>
            <button onClick={() => setIsAdding(false)} className="text-indigo-400 hover:text-indigo-600">
               <span className="sr-only">Close</span>
               {/* Close Icon if needed */}
            </button>
          </div>
          
          <div className="p-6 space-y-8">
            {/* 1. Core Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Core Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Physics, Literature"
                    className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={newScheme.subject}
                    onChange={e => setNewScheme({...newScheme, subject: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Score</label>
                  <input 
                    type="number" 
                    className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={newScheme.maxScore}
                    onChange={e => setNewScheme({...newScheme, maxScore: Number(e.target.value)})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Question Prompt</label>
                  <input 
                    type="text" 
                    className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={newScheme.question}
                    onChange={e => setNewScheme({...newScheme, question: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference Answer</label>
                  <textarea 
                    className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                    placeholder="Provide the ideal answer for semantic matching..."
                    value={newScheme.referenceAnswer}
                    onChange={e => setNewScheme({...newScheme, referenceAnswer: e.target.value})}
                  />
                </div>
                 <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Required Keywords <span className="text-slate-400 font-normal">(Comma separated)</span></label>
                  <input 
                    type="text" 
                    className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. thermodynamics, entropy, heat transfer"
                    value={newScheme.keywords?.join(', ')}
                    onChange={e => setNewScheme({...newScheme, keywords: e.target.value.split(',').map(s => s.trim())})}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100"></div>

            {/* 2. Custom Grading Rules */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center">
                <Sliders className="w-4 h-4 mr-2" />
                Advanced Grading Rules
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grammar & Style */}
                <div className={`
                  p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md
                  ${newScheme.customRules?.strictGrammar ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}
                `} onClick={() => toggleRule('strictGrammar')}>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${newScheme.customRules?.strictGrammar ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                      <PenTool className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Strict Grammar</h4>
                      <p className="text-xs text-slate-500">Penalize spelling & syntax errors</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={newScheme.customRules?.strictGrammar} 
                      onChange={() => {}} // handled by parent click
                      className="ml-auto rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Repetition */}
                <div className={`
                  p-4 rounded-xl border transition-all
                  ${newScheme.customRules?.penalizeRepetition ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}
                `}>
                  <div className="flex items-start space-x-3" onClick={() => toggleRule('penalizeRepetition')}>
                    <div className={`p-2 rounded-lg mt-1 ${newScheme.customRules?.penalizeRepetition ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                         <h4 className="font-semibold text-slate-900">Redundancy Check</h4>
                         <input 
                            type="checkbox" 
                            checked={newScheme.customRules?.penalizeRepetition} 
                            onChange={() => {}} 
                            className="rounded text-orange-600 focus:ring-orange-500"
                          />
                      </div>
                      <p className="text-xs text-slate-500 mb-3">Detect repetitive arguments</p>
                      
                      {newScheme.customRules?.penalizeRepetition && (
                        <div onClick={e => e.stopPropagation()} className="bg-white/50 p-2 rounded border border-orange-100">
                          <label className="text-xs font-semibold text-orange-800 block mb-1">Penalty Severity</label>
                          <select 
                            value={newScheme.customRules.repetitionSeverity || 'Medium'}
                            onChange={(e) => updateRuleValue('repetitionSeverity', e.target.value)}
                            className="w-full text-xs border-slate-200 rounded focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="Low">Low (Forgiving)</option>
                            <option value="Medium">Medium (Balanced)</option>
                            <option value="High">High (Strict)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Structure */}
                <div className={`
                  p-4 rounded-xl border transition-all md:col-span-2
                  ${newScheme.customRules?.requireStructure ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}
                `}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg mt-1 ${newScheme.customRules?.requireStructure ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      <LayoutIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1" onClick={() => toggleRule('requireStructure')}>
                         <h4 className="font-semibold text-slate-900">Structure Enforcement</h4>
                         <input 
                            type="checkbox" 
                            checked={newScheme.customRules?.requireStructure} 
                            onChange={() => {}} 
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                      </div>
                      <p className="text-xs text-slate-500 mb-3" onClick={() => toggleRule('requireStructure')}>Ensure the essay follows a specific format (e.g. Intro, Body, Conclusion)</p>
                      
                      {newScheme.customRules?.requireStructure && (
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-blue-100">
                           <span className="text-xs font-bold text-blue-700 whitespace-nowrap">Required Components:</span>
                           <input 
                            type="text" 
                            placeholder="Intro, Arguments, Rebuttal, Conclusion"
                            className="flex-1 text-sm border-0 border-b border-blue-200 focus:ring-0 focus:border-blue-500 px-0 bg-transparent placeholder-blue-300"
                            value={newScheme.customRules.structureComponents || ''}
                            onChange={(e) => updateRuleValue('structureComponents', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tone & Style (New) */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center space-x-4">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-900 mb-1">Expected Tone</label>
                    <select 
                      value={newScheme.customRules?.toneExpectation || 'Academic'}
                      onChange={(e) => updateRuleValue('toneExpectation', e.target.value)}
                      className="w-full text-sm border-slate-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Academic">Academic / Formal</option>
                      <option value="Neutral">Neutral / Objective</option>
                      <option value="Creative">Creative / Narrative</option>
                    </select>
                  </div>
                </div>

                {/* Additional Instructions */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">Additional Instructions</label>
                  <textarea 
                    className="w-full text-sm border-slate-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 min-h-[60px]"
                    placeholder="Any specific rules for the AI? e.g. 'Ignore minor date errors'"
                    value={newScheme.customRules?.additionalInstructions}
                    onChange={e => setNewScheme({
                      ...newScheme,
                      customRules: { ...newScheme.customRules!, additionalInstructions: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
            <button onClick={() => setIsAdding(false)} className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm flex items-center transition-all">
              <Save className="w-4 h-4 mr-2" />
              Save Criteria
            </button>
          </div>
        </div>
      )}

      {/* List of Existing Schemes */}
      <div className="grid gap-4">
        {schemes.map(scheme => (
          <div key={scheme.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between group hover:border-indigo-200 transition-all">
            <div className="space-y-3 flex-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded uppercase tracking-wide">
                  {scheme.subject}
                </span>
                <h3 className="font-semibold text-slate-900 text-lg">{scheme.question}</h3>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100 italic">
                "{scheme.referenceAnswer}"
              </p>
              
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-medium text-slate-500">Keywords:</span>
                {scheme.keywords.map((k, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{k}</span>
                ))}
              </div>

              {/* Display active rules */}
              {scheme.customRules && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {scheme.customRules.strictGrammar && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                      Strict Grammar
                    </span>
                  )}
                  {scheme.customRules.penalizeRepetition && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                      No Repetition ({scheme.customRules.repetitionSeverity || 'Med'})
                    </span>
                  )}
                  {scheme.customRules.requireStructure && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100" title={scheme.customRules.structureComponents}>
                      Structure: {scheme.customRules.structureComponents ? scheme.customRules.structureComponents.substring(0, 20) + '...' : 'Yes'}
                    </span>
                  )}
                   {scheme.customRules.toneExpectation && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-100">
                      Tone: {scheme.customRules.toneExpectation}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="pl-4 border-l border-slate-100 ml-4 flex flex-col items-end space-y-2">
               <span className="text-xs font-bold text-slate-400 uppercase">Max Score</span>
               <span className="text-xl font-bold text-indigo-600">{scheme.maxScore}</span>
               <button 
                onClick={() => onDeleteScheme(scheme.id)}
                className="mt-4 text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Scheme"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
