import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Users, GraduationCap, Building2, Briefcase, CheckCircle, BarChart3,
  Clock, Activity, TrendingUp, FileText, ArrowRight, UserCheck, UserPlus,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { StatCard, LoadingSpinner, ErrorState, today, timeAgo } from "./shared";

const AdminCharts = React.lazy(() => import("./AdminCharts"));

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      adminService.getStats().catch(() => null),
      adminService.getUsers({ per_page: 5, sort: "created_at", order: "desc" }).catch(() => []),
    ])
      .then(([statsData, usersData]) => {
        setStats(statsData);
        setRecentUsers(Array.isArray(usersData?.users || usersData?.data || usersData) ? (usersData?.users || usersData?.data || usersData) : []);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchAll} />;

  const statCards = [
    { icon: Users, label: "Utilisateurs", value: stats?.users, color: "text-primary bg-primary-bg" },
    { icon: GraduationCap, label: "Étudiants", value: stats?.students, color: "text-cta bg-green-50" },
    { icon: Building2, label: "Entreprises", value: stats?.companies, color: "text-purple-600 bg-purple-50" },
    { icon: Briefcase, label: "Offres totales", value: stats?.internships, color: "text-primary bg-primary-bg" },
    { icon: CheckCircle, label: "Offres publiées", value: stats?.internships_open, color: "text-cta bg-green-50" },
    { icon: BarChart3, label: "Candidatures", value: stats?.applications, color: "text-purple-600 bg-purple-50" },
    { icon: Clock, label: "En attente", value: stats?.applications_pending, color: "text-amber-600 bg-amber-50" },
    { icon: Activity, label: "Catégories", value: stats?.categories, color: "text-primary bg-primary-bg" },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Bonjour, {user.name}</h1>
        <p className="text-text-muted">{today} — Administration</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Vue d'ensemble</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Utilisateurs total" value={stats?.users} color="text-primary bg-primary-bg" link="/admin/users" />
          <StatCard icon={Briefcase} label="Stages total" value={stats?.internships} color="text-blue-600 bg-blue-100" link="/admin/internships" />
          <StatCard icon={FileText} label="Candidatures total" value={stats?.applications} color="text-green-600 bg-green-100" link="/admin/internships" />
          <StatCard icon={TrendingUp} label="Taux de réponse" value={stats?.applications && stats?.applications_pending != null ? `${Math.round(((stats.applications - stats.applications_pending) / stats.applications) * 100)}%` : "—"} color="text-purple-600 bg-purple-50" />
        </div>
      </div>

      <React.Suspense fallback={<div className="h-72 animate-pulse bg-gray-100 rounded-xl" />}>
        <AdminCharts stats={stats} />
      </React.Suspense>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Dernières inscriptions</h2>
            <Link to="/admin/users" className="text-sm text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <EmptyState icon={UserPlus} title="Aucun utilisateur" description="Aucun utilisateur récent." />
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-bg/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary-bg flex items-center justify-center shrink-0">
                    <UserCheck size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-text-muted truncate">{u.email}</p>
                  </div>
                  <Badge variant={u.role}>{u.role}</Badge>
                  <span className="text-xs text-text-muted shrink-0">{timeAgo(u.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Administration</h2>
          <div className="space-y-3">
            <Link to="/admin/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-bg/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-primary-bg flex items-center justify-center"><Users size={16} className="text-primary" /></div>
              <span className="font-medium">Gérer les utilisateurs</span>
              <ArrowRight size={16} className="ml-auto text-text-muted" />
            </Link>
            <Link to="/admin/internships" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-bg/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-primary-bg flex items-center justify-center"><Briefcase size={16} className="text-primary" /></div>
              <span className="font-medium">Gérer les offres de stage</span>
              <ArrowRight size={16} className="ml-auto text-text-muted" />
            </Link>
            <Link to="/admin/categories" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-bg/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-primary-bg flex items-center justify-center"><BarChart3 size={16} className="text-primary" /></div>
              <span className="font-medium">Gérer les catégories</span>
              <ArrowRight size={16} className="ml-auto text-text-muted" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
