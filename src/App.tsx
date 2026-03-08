import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SchoolRegistration from './pages/SchoolRegistration';
import SchoolSettings from './pages/SchoolSettings';
import ClassSetup from './pages/ClassSetup';
import SubjectManagement from './pages/SubjectManagement';
import StudentUpload from './pages/StudentUpload';
import ExamCreation from './pages/ExamCreation';
import ScriptUpload from './pages/ScriptUpload';
import GradingQueue from './pages/GradingQueue';
import Results from './pages/Results';
import MarkingSchemes from './pages/MarkingSchemes';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register-school" replace />} />
        <Route path="/register-school" element={<SchoolRegistration />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/school-settings" element={<SchoolSettings />} />
          <Route path="/classes" element={<ClassSetup />} />
          <Route path="/subjects" element={<SubjectManagement />} />
          <Route path="/students" element={<StudentUpload />} />
          <Route path="/exams" element={<ExamCreation />} />
          <Route path="/scripts" element={<ScriptUpload />} />
          <Route path="/grading" element={<GradingQueue />} />
          <Route path="/results" element={<Results />} />
          <Route path="/marking-schemes" element={<MarkingSchemes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
