import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Briefcase, FileText, Building2, Users,
  Settings, LogOut, Menu, X, ChevronDown, GraduationCap, UserCircle,
  Heart, MessageSquare, Calendar, Bell, Key, MapPin, Play
} from "lucide-react";
import { locationService } from "../services/locationService";
import NotificationBell from "../components/common/NotificationBell";

const roleConfig = {
  student: {
    name: "Étudiant",
    icon: GraduationCap,
    nav: [
      { to: "/student", label: "Tableau de bord", icon: LayoutDashboard },
      { to: "/student/internships", label: "Offres de stage", icon: Briefcase },
      { to: "/student/my-internships", label: "Mes stages", icon: Play },
      { to: "/student/favorites", label: "Mes favoris", icon: Heart },
      { to: "/student/applications", label: "Mes candidatures", icon: FileText },
      { to: "/student/messages", label: "Messagerie", icon: MessageSquare },
      { to: "/student/interviews", label: "Entretiens", icon: Calendar },
      { to: "/student/profile", label: "Mon profil", icon: UserCircle },
    ],
  },
  company: {
    name: "Entreprise",
    icon: Building2,
    nav: [
      { to: "/company", label: "Tableau de bord", icon: LayoutDashboard },
      { to: "/company/internships", label: "Mes offres", icon: Briefcase },
      { to: "/company/applications", label: "Candidatures", icon: FileText },
      { to: "/company/messages", label: "Messagerie", icon: MessageSquare },
      { to: "/company/interviews", label: "Entretiens", icon: Calendar },
      { to: "/company/profile", label: "Profil entreprise", icon: Building2 },
    ],
  },
  admin: {
    name: "Administrateur",
    icon: Users,
    nav: [
      { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
      { to: "/admin/users", label: "Utilisateurs", icon: Users },
      { to: "/admin/students", label: "Étudiants", icon: GraduationCap },
      { to: "/admin/companies", label: "Entreprises", icon: Building2 },
      { to: "/admin/internships", label: "Offres", icon: Briefcase },
      { to: "/admin/categories", label: "Catégories", icon: Settings },
      { to: "/admin/password-resets", label: "Mots de passe oubliés", icon: Key },
      { to: "/admin/neighborhoods", label: "Quartiers", icon: MapPin, badge: "pendingNeighborhoods" },
    ],
  },
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (user?.role !== "admin") return;
    const poll = () => {
      locationService.getPendingCount()
        .then((res) => setPendingCount(res.count))
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 8000);
    return () => clearInterval(id);
  }, [user?.role]);

  if (!user) return null;
  const config = roleConfig[user.role];
  const RoleIcon = config.icon;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLink = (item) => {
    const active = location.pathname === item.to;
    const count = item.badge === "pendingNeighborhoods" ? pendingCount : 0;
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          active
            ? "bg-primary text-white"
            : "text-text-muted hover:bg-primary-bg hover:text-primary"
        }`}
      >
        <item.icon size={20} />
        <span className="flex-1">{item.label}</span>
        {count > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-danger text-white text-[11px] font-bold leading-none">
            {count}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary font-heading text-lg">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0369A1"/>
              <path d="M16 8L24 14V24H8V14L16 8Z" fill="white" opacity="0.9"/>
              <path d="M16 12L20 15V20H12V15L16 12Z" fill="#0EA5E9"/>
            </svg>
            StageLink
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {config.nav.map(navLink)}
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 cursor-pointer">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary-bg flex items-center justify-center">
                  <RoleIcon size={16} className="text-primary" />
                </div>
                <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                <ChevronDown size={16} className="text-text-muted" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-surface border border-border rounded-xl shadow-lg z-20 p-2">
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
