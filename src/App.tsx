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

import NotFound from './pages/NotFound';

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
          {/* We'll route /about to Home for now or 404 since it's missing but we can add later */}
        </Route>

        {/* Auth Layer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SchoolRegistration />} />
        <Route path="/forgot-password" element={<Login />} /> {/* Placeholder */}

        {/* Portal Layer */}
        <Route path="/portal" element={<InstitutionSelector />} />

        {/* Operational Layer (Dynamic based on institution type) */}
        <Route path="/portal/:type" element={<PortalLayout />}>
          {/* Shared or Secondary Routes */}
          <Route path="dashboard" element={<Dashboard />} />
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

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
