import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RouteSuspense } from './components/common/RouteSuspense';

// ─────────────────────────────────────────────────────────────
// SYNCHRONOUS IMPORTS — Shell-level components only
// These form the minimal initial payload (routing + layout skeleton)
// ─────────────────────────────────────────────────────────────
import PublicLayout from './components/PublicLayout';
import PortalLayout from './components/layouts/PortalLayout';
import { AuthGuard } from './components/auth/AuthGuard';

// ─────────────────────────────────────────────────────────────
// LAZY IMPORTS — Route-level code splitting
// Every page is a separately loaded chunk
// ─────────────────────────────────────────────────────────────

// Public Pages
const Home = React.lazy(() => import('./pages/Home'));
const Features = React.lazy(() => import('./pages/public/Features'));
const Pricing = React.lazy(() => import('./pages/public/Pricing'));
const Blog = React.lazy(() => import('./pages/public/Blog'));
const Contact = React.lazy(() => import('./pages/public/Contact'));

// Auth & Portal Selection
const Login = React.lazy(() => import('./pages/auth/Login'));
const SignupPage = React.lazy(() => import('./pages/auth/SignupPage'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));
const SchoolRegistration = React.lazy(() => import('./pages/SchoolRegistration'));
const InstitutionSelector = React.lazy(() => import('./pages/InstitutionSelector'));

// Operational Pages (Secondary School)
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const SchoolSettings = React.lazy(() => import('./pages/SchoolSettings'));
const ClassSetup = React.lazy(() => import('./pages/ClassSetup'));
const SubjectManagement = React.lazy(() => import('./pages/SubjectManagement'));
const StudentUpload = React.lazy(() => import('./pages/StudentUpload'));
const ExamCreation = React.lazy(() => import('./pages/ExamCreation'));
const ScriptUpload = React.lazy(() => import('./pages/ScriptUpload'));
const GradingQueue = React.lazy(() => import('./pages/GradingQueue'));
const Results = React.lazy(() => import('./pages/Results'));
const MarkingSchemes = React.lazy(() => import('./pages/MarkingSchemes'));
const DemoDashboard = React.lazy(() => import('./pages/DemoDashboard'));

// Placeholder Pages (University/Corporate)
const PlaceholderPages = React.lazy(() => import('./pages/PlaceholderPages'));

// CBT Terminals — Isolated runtime islands
// These MUST NOT be part of the initial bundle
const PrincipalTerminal = React.lazy(() => import('./pages/terminals/PrincipalTerminal'));
const VicePrincipalTerminal = React.lazy(() => import('./pages/terminals/VicePrincipalTerminal'));
const TeacherTerminal = React.lazy(() => import('./pages/terminals/TeacherTerminal'));
const StudentTerminal = React.lazy(() => import('./pages/terminals/StudentTerminal'));

// Onboarding & Workspace
const SetupWizard = React.lazy(() => import('./pages/dashboard/SetupWizard'));
const SchoolSetup = React.lazy(() => import('./pages/dashboard/SchoolSetup'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const SecondaryWorkspace = React.lazy(() => import('./pages/workspace/SecondaryWorkspace'));
const CreateInstitution = React.lazy(() => import('./pages/onboarding/CreateInstitution'));

// ─────────────────────────────────────────────────────────────
// Lazy wrapper components for named exports from PlaceholderPages
// React.lazy requires default exports, so we wrap each named export
// ─────────────────────────────────────────────────────────────
const FacultiesPage = React.lazy(() =>
  import('./pages/PlaceholderPages').then(m => ({ default: m.FacultiesPage }))
);
const DepartmentsPage = React.lazy(() =>
  import('./pages/PlaceholderPages').then(m => ({ default: m.DepartmentsPage }))
);
const CoursesPage = React.lazy(() =>
  import('./pages/PlaceholderPages').then(m => ({ default: m.CoursesPage }))
);
const EmployeesPage = React.lazy(() =>
  import('./pages/PlaceholderPages').then(m => ({ default: m.EmployeesPage }))
);
const TrainingModulesPage = React.lazy(() =>
  import('./pages/PlaceholderPages').then(m => ({ default: m.TrainingModulesPage }))
);
const AssessmentsPage = React.lazy(() =>
  import('./pages/PlaceholderPages').then(m => ({ default: m.AssessmentsPage }))
);
const ReportsPage = React.lazy(() =>
  import('./pages/PlaceholderPages').then(m => ({ default: m.ReportsPage }))
);
const AnalyticsPage = React.lazy(() =>
  import('./pages/PlaceholderPages').then(m => ({ default: m.AnalyticsPage }))
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <RouteSuspense>
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/recover-account" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

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

            {/* Operational Terminals — Isolated Runtime Islands */}
            <Route path="terminal/principal" element={<PrincipalTerminal />} />
            <Route path="terminal/vice-principal" element={<VicePrincipalTerminal />} />
            <Route path="terminal/teacher" element={<TeacherTerminal />} />
            <Route path="terminal/student" element={<StudentTerminal />} />
          </Route>

          <Route path="/portal/demo" element={<DemoDashboard />} />
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </RouteSuspense>
    </BrowserRouter>
  );
};

export default App;

