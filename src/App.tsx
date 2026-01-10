import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import Admin from './pages/Admin';
import { AppState, AssessmentResult, MarkingScheme } from './types';
import { DEFAULT_MARKING_SCHEMES } from './constants';

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>(AppState.HOME);
  const [schemes, setSchemes] = useState<MarkingScheme[]>(DEFAULT_MARKING_SCHEMES);
  const [currentResult, setCurrentResult] = useState<AssessmentResult | null>(null);

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setCurrentResult(result);
    setCurrentState(AppState.RESULTS);
  };

  const handleAddScheme = (scheme: MarkingScheme) => {
    setSchemes([...schemes, scheme]);
  };

  const handleDeleteScheme = (id: string) => {
    setSchemes(schemes.filter(s => s.id !== id));
  };

  const renderContent = () => {
    switch (currentState) {
      case AppState.HOME:
        return <Dashboard onNavigate={setCurrentState} />;
      case AppState.ASSESS:
        return <Assessment schemes={schemes} onComplete={handleAssessmentComplete} />;
      case AppState.RESULTS:
        return <Results result={currentResult} onBack={() => setCurrentState(AppState.ASSESS)} />;
      case AppState.ADMIN:
        return (
          <Admin 
            schemes={schemes} 
            onAddScheme={handleAddScheme} 
            onDeleteScheme={handleDeleteScheme} 
          />
        );
      default:
        return <Dashboard onNavigate={setCurrentState} />;
    }
  };

  return (
    <Layout activeState={currentState} onNavigate={setCurrentState}>
      {renderContent()}
    </Layout>
  );
};

export default App;
