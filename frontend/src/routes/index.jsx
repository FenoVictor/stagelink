import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

const Home = lazy(() => import("../pages/Home/Home"));
const Login = lazy(() => import("../pages/Login/Login"));
const Register = lazy(() => import("../pages/Register/Register"));
const ForgotPassword = lazy(() => import("../pages/Login/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Login/ResetPassword"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const StudentInternships = lazy(() => import("../pages/Student/Internships"));
const StudentApplications = lazy(() => import("../pages/Student/Applications"));
const StudentProfile = lazy(() => import("../pages/Student/Profile"));
const CompanyInternships = lazy(() => import("../pages/Company/Internships"));
const CompanyApplications = lazy(() => import("../pages/Company/Applications"));
const CompanyProfile = lazy(() => import("../pages/Company/Profile"));
const CompanyStudentView = lazy(() => import("../pages/Company/StudentView"));
const AdminUsers = lazy(() => import("../pages/Admin/Users"));
const AdminStudents = lazy(() => import("../pages/Admin/Students"));
const AdminStudentDetail = lazy(() => import("../pages/Admin/StudentDetail"));
const AdminCompanies = lazy(() => import("../pages/Admin/Companies"));
const AdminInternships = lazy(() => import("../pages/Admin/Internships"));
const AdminCategories = lazy(() => import("../pages/Admin/Categories"));
const AdminPasswordResets = lazy(() => import("../pages/Admin/PasswordResets"));
const AdminNeighborhoods = lazy(() => import("../pages/Admin/Neighborhoods"));
const AdminAuditLog = lazy(() => import("../pages/Admin/AuditLog"));
const StudentMyInternships = lazy(() => import("../pages/Student/MyInternships"));
const Favorites = lazy(() => import("../pages/Student/Favorites"));
const Messages = lazy(() => import("../pages/Messages"));
const Interviews = lazy(() => import("../pages/Interviews"));
const CompanyPublic = lazy(() => import("../pages/Company/CompanyPublic"));
const VerifyEmail = lazy(() => import("../pages/Auth/VerifyEmail"));
const DataProtection = lazy(() => import("../pages/Settings/DataProtection"));
const AdminSecuritySettings = lazy(() => import("../pages/Admin/SecuritySettings"));
const AdminMetrics = lazy(() => import("../pages/Admin/Metrics"));
const TwoFactorSettings = lazy(() => import("../pages/Settings/TwoFactorSettings"));
const TokenManagement = lazy(() => import("../pages/Settings/TokenManagement"));
const LoginLogs = lazy(() => import("../pages/Admin/LoginLogs"));
const AdminFeedback = lazy(() => import("../pages/Admin/Feedback"));

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/entreprise/:id", element: <CompanyPublic /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/verify-email", element: <VerifyEmail /> },
  {
    path: "/student",
    element: <ProtectedRoute roles={["student"]}><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "internships", element: <StudentInternships /> },
      { path: "my-internships", element: <StudentMyInternships /> },
      { path: "applications", element: <StudentApplications /> },
      { path: "profile", element: <StudentProfile /> },
      { path: "favorites", element: <Favorites /> },
      { path: "messages", element: <Messages /> },
      { path: "messages/:id", element: <Messages /> },
      { path: "interviews", element: <Interviews /> },
      { path: "data-protection", element: <DataProtection /> },
      { path: "2fa", element: <TwoFactorSettings /> },
      { path: "tokens", element: <TokenManagement /> },
    ],
  },
  {
    path: "/company",
    element: <ProtectedRoute roles={["company"]}><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "internships", element: <CompanyInternships /> },
      { path: "applications", element: <CompanyApplications /> },
      { path: "profile", element: <CompanyProfile /> },
      { path: "messages", element: <Messages /> },
      { path: "messages/:id", element: <Messages /> },
      { path: "interviews", element: <Interviews /> },
      { path: "students/:id", element: <CompanyStudentView /> },
      { path: "data-protection", element: <DataProtection /> },
      { path: "2fa", element: <TwoFactorSettings /> },
      { path: "tokens", element: <TokenManagement /> },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute roles={["admin"]}><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "users", element: <AdminUsers /> },
      { path: "students", element: <AdminStudents /> },
      { path: "students/:id", element: <AdminStudentDetail /> },
      { path: "companies", element: <AdminCompanies /> },
      { path: "internships", element: <AdminInternships /> },
      { path: "categories", element: <AdminCategories /> },
      { path: "password-resets", element: <AdminPasswordResets /> },
      { path: "neighborhoods", element: <AdminNeighborhoods /> },
      { path: "audit-log", element: <AdminAuditLog /> },
      { path: "feedback", element: <AdminFeedback /> },
      { path: "data-protection", element: <DataProtection /> },
      { path: "security", element: <AdminSecuritySettings /> },
      { path: "metrics", element: <AdminMetrics /> },
      { path: "login-logs", element: <LoginLogs /> },
      { path: "2fa", element: <TwoFactorSettings /> },
      { path: "tokens", element: <TokenManagement /> },
    ],
  },
]);
