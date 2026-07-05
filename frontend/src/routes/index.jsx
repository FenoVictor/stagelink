import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

const Home = lazy(() => import("../pages/Home/Home"));
const Login = lazy(() => import("../pages/Login/Login"));
const Register = lazy(() => import("../pages/Register/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const StudentInternships = lazy(() => import("../pages/Student/Internships"));
const StudentApplications = lazy(() => import("../pages/Student/Applications"));
const StudentProfile = lazy(() => import("../pages/Student/Profile"));
const CompanyInternships = lazy(() => import("../pages/Company/Internships"));
const CompanyApplications = lazy(() => import("../pages/Company/Applications"));
const CompanyProfile = lazy(() => import("../pages/Company/Profile"));
const AdminUsers = lazy(() => import("../pages/Admin/Users"));
const AdminInternships = lazy(() => import("../pages/Admin/Internships"));
const AdminCategories = lazy(() => import("../pages/Admin/Categories"));

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/student",
    element: <ProtectedRoute roles={["student"]}><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "internships", element: <StudentInternships /> },
      { path: "applications", element: <StudentApplications /> },
      { path: "profile", element: <StudentProfile /> },
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
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute roles={["admin"]}><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "users", element: <AdminUsers /> },
      { path: "internships", element: <AdminInternships /> },
      { path: "categories", element: <AdminCategories /> },
    ],
  },
]);
