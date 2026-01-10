import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, RefreshCw, ChevronRight, AlertCircle, Check, Sparkles, Wand2, X, AlertTriangle } from 'lucide-react';
import { MarkingScheme, AssessmentResult } from '../types';
import { performOCR, gradeEssay, augmentEssayText } from '../services/geminiService';

interface AssessmentProps {
  schemes: MarkingScheme[];
  onComplete: (result: AssessmentResult) => void;
}

const Assessment: React.FC<AssessmentProps> = ({ schemes, onComplete }) => {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemes[0]?.id || '');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [ocrText, setOcrText] = useState<string>('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Augmentation State
  const [augmentationEnabled, setAugmentationEnabled] = useState(true);
  const [augmentedText, setAugmentedText] = useState<string>('');
  const [isAugmenting, setIsAugmenting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please ensure permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setImage(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const runOCR = async () => {
    if (!image) return;
    setIsProcessing(true);
    setError(null);
    setStatus('Initializing AI Vision Engine...');
    
    try {
      setStatus('Analyzing handwriting...');
      const text = await performOCR(image);
      setOcrText(text);
      setAugmentedText(''); 
      
      if (text.length > 5 && augmentationEnabled) {
        setStatus('Optimizing text structure...');
        try {
            const enhanced = await augmentEssayText(text);
            setAugmentedText(enhanced);
        } catch (e) {
            console.error("Auto-augmentation failed", e);
        }
      }
      
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to recognize text. Please try a clearer image or ensure the handwriting is legible.");
      setStatus('');
    } finally {
      setIsProcessing(false);
    }
  };

  const runAugmentation = async () => {
    if (!ocrText) return;
    setIsAugmenting(true);
    try {
      const text = await augmentEssayText(ocrText);
      setAugmentedText(text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAugmenting(false);
    }
  };

  const runGrading = async () => {
    if (!ocrText || !selectedSchemeId) return;
    setIsProcessing(true);
    setStatus('Analyzing semantic similarity...');

    const scheme = schemes.find(s => s.id === selectedSchemeId);
    if (!scheme) return;

    const textToGrade = (augmentationEnabled && augmentedText) ? augmentedText : ocrText;

    try {
      const resultData = await gradeEssay(textToGrade, scheme);
      
      const fullResult: AssessmentResult = {
        id: Date.now().toString(),
        questionId: scheme.id,
        studentName: 'Student #' + Math.floor(Math.random() * 1000),
        rawOcrText: ocrText,
        augmentedText: (augmentationEnabled && augmentedText) ? augmentedText : undefined,
        similarityScore: resultData.similarityScore,
        awardedPoints: resultData.awardedPoints,
        maxPoints: scheme.maxScore,
        finalGrade: resultData.finalGrade,
        feedback: resultData.feedback,
        matchedKeywords: resultData.matchedKeywords || [],
        missedKeywords: resultData.missedKeywords || [],
        timestamp: Date.now()
      };

      onComplete(fullResult);
    } catch (err) {
      console.error(err);
      setError("An error occurred during grading. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">1. Upload Essay</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Question / Marking Scheme</label>
            <select 
              value={selectedSchemeId}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {schemes.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.id}] {s.subject}: {s.question.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">OCR Process Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {!showCamera ? (
            <div className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer relative
                  ${image ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
                {image ? (
                  <div className="space-y-4">
                    <img src={image} alt="Preview" className="max-h-64 mx-auto rounded shadow-lg object-contain" />
                    <p className="text-indigo-700 font-medium">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-4 py-8">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-900">Drop essay image here</p>
                      <p className="text-slate-500">or click to browse files</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="px-3 text-slate-500 text-sm font-medium">OR</span>
                <div className="border-t border-slate-200 w-full"></div>
              </div>

              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span>Use Camera</span>
              </button>
            </div>
          ) : (
            <div className="relative bg-black rounded-xl overflow-hidden aspect-[4/3] flex flex-col">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="flex-1 w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 p-6 flex items-center justify-center space-x-8 bg-gradient-to-t from-black/50 to-transparent">
                <button 
                  onClick={stopCamera}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <button 
                  onClick={capturePhoto}
                  className="p-1 rounded-full border-4 border-white hover:scale-105 transition-transform"
                >
                  <div className="w-14 h-14 bg-white rounded-full"></div>
                </button>
                <div className="w-12"></div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={runOCR}
              disabled={!image || isProcessing || showCamera}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-white transition-all
                ${!image || isProcessing || showCamera ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'}
              `}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{status}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Extract Text (AI Powered)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">2. Verify Extracted Text</h2>
            <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 text-sm underline">Re-upload</button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Original Image</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 sticky top-4">
                   {image && <img src={image} alt="Original" className="w-full h-auto" />}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Extracted Text <span className="text-slate-400 font-normal">(Editable)</span>
                </label>
                <textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  className="w-full p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed min-h-[200px]"
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-slate-800">AI Text Cleanup</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={augmentationEnabled}
                      onChange={(e) => setAugmentationEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <p className="text-xs text-slate-500 mb-4">
                  Corrects spelling/grammar errors from the student's writing and minor OCR glitches.
                </p>

                {augmentationEnabled && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {!augmentedText && !isAugmenting && (
                      <button 
                        onClick={runAugmentation}
                        className="w-full py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 flex items-center justify-center transition-colors"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Regenerate Cleanup
                      </button>
                    )}

                    {isAugmenting && (
                      <div className="flex items-center justify-center py-4 text-indigo-600 bg-white rounded-lg border border-indigo-100">
                         <Loader2 className="w-5 h-5 animate-spin mr-2" />
                         <span className="text-sm">Enhancing text...</span>
                      </div>
                    )}

                    {augmentedText && !isAugmenting && (
                      <div>
                        <label className="block text-xs font-semibold text-indigo-900 mb-1">Cleaned Version (Used for grading)</label>
                        <textarea
                          value={augmentedText}
                          onChange={(e) => setAugmentedText(e.target.value)}
                          className="w-full p-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed min-h-[150px] bg-white"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!augmentationEnabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-3">
                   <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                   <p className="text-sm text-blue-800">
                     Using raw extracted text. Spelling errors may affect grading accuracy.
                   </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={runGrading}
              disabled={isProcessing || (augmentationEnabled && isAugmenting)}
              className={`
                flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold text-white transition-all
                ${(isProcessing || (augmentationEnabled && isAugmenting)) ? 'bg-slate-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'}
              `}
            >
              {isProcessing ? (
                 <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{status}</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Analyze & Grade</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Assessment;