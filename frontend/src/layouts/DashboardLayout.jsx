import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Briefcase, FileText, Building2, Users,
  Settings, LogOut, Menu, X, ChevronDown, GraduationCap, UserCircle,
  Heart, MessageSquare, Calendar, Bell, Key, MapPin, Play, Mail, Shield, Database, Lock, Activity, ShieldCheck, ScrollText, Lightbulb
} from "lucide-react";
import { locationService } from "../services/locationService";
import NotificationBell from "../components/common/NotificationBell";
import ThemeToggle from "../components/common/ThemeToggle";
import LanguageSwitcher from "../components/common/LanguageSwitcher";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const prevCountRef = useRef(0);

  const navLabels = t("nav", { returnObjects: true });

  const roleConfig = {
    student: {
      name: t("auth.student"),
      icon: GraduationCap,
      nav: [
        { to: "/student", label: navLabels.dashboard, icon: LayoutDashboard },
        { to: "/student/internships", label: navLabels.internships, icon: Briefcase },
        { to: "/student/my-internships", label: navLabels.myInternships, icon: Play },
        { to: "/student/favorites", label: navLabels.myFavorites, icon: Heart },
        { to: "/student/applications", label: navLabels.myApplications, icon: FileText },
        { to: "/student/messages", label: navLabels.messaging, icon: MessageSquare },
        { to: "/student/interviews", label: navLabels.interviews, icon: Calendar },
        { to: "/student/profile", label: navLabels.myProfile, icon: UserCircle },
        { to: "/student/data-protection", label: navLabels.dataProtection, icon: Database },
        { to: "/student/2fa", label: navLabels.twoFactor, icon: ShieldCheck },
        { to: "/student/tokens", label: navLabels.apiTokens, icon: Key },
      ],
    },
    company: {
      name: t("auth.company"),
      icon: Building2,
      nav: [
        { to: "/company", label: navLabels.dashboard, icon: LayoutDashboard },
        { to: "/company/internships", label: navLabels.myOffers, icon: Briefcase },
        { to: "/company/applications", label: navLabels.applications, icon: FileText },
        { to: "/company/messages", label: navLabels.messaging, icon: MessageSquare },
        { to: "/company/interviews", label: navLabels.interviews, icon: Calendar },
        { to: "/company/profile", label: navLabels.companyProfile, icon: Building2 },
        { to: "/company/data-protection", label: navLabels.dataProtection, icon: Database },
        { to: "/company/2fa", label: navLabels.twoFactor, icon: ShieldCheck },
        { to: "/company/tokens", label: navLabels.apiTokens, icon: Key },
      ],
    },
    admin: {
      name: t("auth.admin"),
      icon: Users,
      nav: [
        { to: "/admin", label: navLabels.dashboard, icon: LayoutDashboard },
        { to: "/admin/users", label: navLabels.users, icon: Users },
        { to: "/admin/students", label: navLabels.students, icon: GraduationCap },
        { to: "/admin/companies", label: navLabels.companies, icon: Building2 },
        { to: "/admin/internships", label: navLabels.offers, icon: Briefcase },
        { to: "/admin/categories", label: navLabels.categories, icon: Settings },
        { to: "/admin/password-resets", label: navLabels.forgottenPasswords, icon: Key },
        { to: "/admin/neighborhoods", label: navLabels.neighborhoods, icon: MapPin, badge: "pendingNeighborhoods" },
        { to: "/admin/audit-log", label: navLabels.auditLog, icon: Shield },
        { to: "/admin/feedback", label: navLabels.feedback, icon: Lightbulb },
        { to: "/admin/data-protection", label: navLabels.dataProtection, icon: Database },
        { to: "/admin/security", label: navLabels.security, icon: Lock },
        { to: "/admin/metrics", label: navLabels.metrics, icon: Activity },
        { to: "/admin/login-logs", label: navLabels.loginLogs, icon: ScrollText },
        { to: "/admin/2fa", label: navLabels.twoFactor, icon: ShieldCheck },
        { to: "/admin/tokens", label: navLabels.apiTokens, icon: Key },
      ],
    },
  };

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
            : "text-text-muted dark:text-dark-text-muted hover:bg-primary-bg dark:hover:bg-dark-hover hover:text-primary"
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface dark:bg-dark-surface border-r border-border dark:border-dark-border transform transition-transform duration-200 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border dark:border-dark-border">
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
        <nav className="p-4 space-y-1 overflow-y-auto">
          {config.nav.map(navLink)}
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 cursor-pointer">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
            <NotificationBell />
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary-bg dark:bg-dark-hover flex items-center justify-center">
                  <RoleIcon size={16} className="text-primary" />
                </div>
                <span className="text-sm font-medium hidden sm:block dark:text-dark-text">{user.name}</span>
                <ChevronDown size={16} className="text-text-muted dark:text-dark-text-muted" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl shadow-lg z-20 p-2">
                    <div className="px-3 py-2 border-b border-border dark:border-dark-border mb-1">
                      <p className="text-sm font-medium dark:text-dark-text">{user.name}</p>
                      <p className="text-xs text-text-muted dark:text-dark-text-muted">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      {t("common.logout")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        {user && !user.email_verified_at && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
              <Mail size={16} className="shrink-0" />
              <span>Votre email n'est pas vérifié. <Link to="/verify-email" className="font-semibold underline">Vérifier maintenant</Link></span>
            </div>
            <button
              onClick={async () => {
                try { await authService.resendVerification(); toast.success("Lien renvoyé !"); }
                catch { toast.error("Erreur lors de l'envoi"); }
              }}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium shrink-0 cursor-pointer"
            >
              Renvoyer
            </button>
          </div>
        )}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
