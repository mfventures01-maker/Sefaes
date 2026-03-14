import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import PortalLayout from './components/layouts/PortalLayout';

// Public Pages
import Home from './pages/Home';
import Features from './pages/public/Features';
import Pricing from './pages/public/Pricing';
import Blog from './pages/public/Blog';
import Contact from './pages/public/Contact';

// Auth & Portal Selection
import Login from './pages/auth/Login';
import SignupPage from './pages/auth/SignupPage';
import SchoolRegistration from './pages/SchoolRegistration';
import InstitutionSelector from './pages/InstitutionSelector';

// Operational Pages (Existing Secondary)
import Dashboard from './pages/Dashboard';
import SchoolSettings from './pages/SchoolSettings';
import ClassSetup from './pages/ClassSetup';
import SubjectManagement from './pages/SubjectManagement';
import StudentUpload from './pages/StudentUpload';
import ExamCreation from './pages/ExamCreation';
import ScriptUpload from './pages/ScriptUpload';
import GradingQueue from './pages/GradingQueue';
import Results from './pages/Results';
import MarkingSchemes from './pages/MarkingSchemes';
import DemoDashboard from './pages/DemoDashboard';

// Placeholders for other institution types
import {
  FacultiesPage,
  DepartmentsPage,
  CoursesPage,
  EmployeesPage,
  TrainingModulesPage,
  AssessmentsPage,
  ReportsPage,
  AnalyticsPage
} from './pages/PlaceholderPages';

import SetupWizard from './pages/dashboard/SetupWizard';
import SchoolSetup from './pages/dashboard/SchoolSetup';
import NotFound from './pages/NotFound';
import { AuthGuard } from './components/auth/AuthGuard';

import SecondaryWorkspace from './pages/workspace/SecondaryWorkspace';
import CreateInstitution from './pages/onboarding/CreateInstitution';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website Layer */}
        <Route path="/" element={<Home />} />
        <Route element={<PublicLayout />}>
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Auth Layer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SchoolRegistration />} />
        <Route path="/forgot-password" element={<Login />} />
        <Route path="/auth/recover-account" element={<Login />} />

        {/* Portal Layer / Workspace Selection */}
        <Route path="/portal" element={<InstitutionSelector />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard/setup" element={<SetupWizard />} />

        {/* Deterministic Onboarding Pipeline & Guards */}
        <Route path="/workspace/secondary_school" element={<SecondaryWorkspace />} />
        <Route path="/onboarding/create-institution" element={<CreateInstitution />} />

        {/* Operational Layer (Protected by AuthGuard) */}
        <Route path="/portal/:type" element={
          <AuthGuard>
            <PortalLayout />
          </AuthGuard>
        }>
          {/* Shared or Secondary Routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="setup" element={<SchoolSetup />} />
          <Route path="school-settings" element={<SchoolSettings />} />
          <Route path="classes" element={<ClassSetup />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="students" element={<StudentUpload />} />
          <Route path="exams" element={<ExamCreation />} />
          <Route path="scripts" element={<ScriptUpload />} />
          <Route path="grading" element={<GradingQueue />} />
          <Route path="results" element={<Results />} />
          <Route path="marking-schemes" element={<MarkingSchemes />} />
          <Route path="analytics" element={<AnalyticsPage />} />

          {/* Dedicated University/Polytechnic Routes */}
          <Route path="faculties" element={<FacultiesPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="courses" element={<CoursesPage />} />

          {/* Dedicated Corporate Routes */}
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="training" element={<TrainingModulesPage />} />
          <Route path="assessments" element={<AssessmentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        <Route path="/portal/demo" element={<DemoDashboard />} />
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
