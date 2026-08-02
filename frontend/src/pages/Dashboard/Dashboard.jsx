import { lazy, Suspense } from "react";
import { useAuth } from "../../context/AuthContext";

const StudentDashboard = lazy(() => import("./StudentDashboard"));
const CompanyDashboard = lazy(() => import("./CompanyDashboard"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {user.role === "student" && <StudentDashboard user={user} />}
      {user.role === "company" && <CompanyDashboard user={user} />}
      {user.role === "admin" && <AdminDashboard user={user} />}
    </Suspense>
  );
}
