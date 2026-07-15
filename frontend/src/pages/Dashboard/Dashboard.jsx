import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, FileText, Users, Building2, GraduationCap,
  Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Eye, MessageSquare,
  Calendar, Heart, Activity, ArrowRight, UserCheck, UserPlus, BarChart3,
  Star, Camera, Phone, MapPin, BookOpen, Globe, Download, Award, Play, Lightbulb,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { internshipService } from "../../services/internshipService";
import { notificationService } from "../../services/notificationService";
import { conversationService } from "../../services/conversationService";
import { interviewService } from "../../services/interviewService";
import { favoriteService } from "../../services/favoriteService";
import { studentService } from "../../services/studentService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
};

const today = new Date().toLocaleDateString("fr-FR", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

function computeProfileCompletion(profile) {
  if (!profile) return 0;
  let score = 0;
  if (profile.firstname || profile.lastname) score += 5;
  if (profile.firstname && profile.lastname) score += 5;
  if (profile.phone) score += 5;
  if (profile.photo_url || profile.photo) score += 10;
  if (profile.city_id || profile.city) score += 5;
  if (profile.address) score += 5;
  if (profile.school) score += 5;
  if (profile.major) score += 5;
  if (profile.graduation_year) score += 5;
  if (profile.skills && profile.skills.length > 0) score += 15;
  if (profile.languages && profile.languages.length > 0) score += 10;
  if (profile.github) score += 5;
  if (profile.linkedin) score += 5;
  if (profile.portfolio) score += 5;
  if (profile.bio) score += 5;
  if (profile.cv_path || profile.cv_url) score += 5;
  return Math.min(100, score);
}

function StatCard({ icon: Icon, label, value, color, link }) {
  const content = (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-muted">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold">{value ?? "—"}</p>
    </Card>
  );
  if (link) return <Link to={link}>{content}</Link>;
  return content;
}

function QuickAction({ icon: Icon, label, to }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between bg-surface border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary-bg flex items-center justify-center">
          <Icon size={18} className="text-primary" />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <ArrowRight size={18} className="text-text-muted" />
    </Link>
  );
}

function NotificationIcon({ type }) {
  const cls = "w-9 h-9 rounded-lg flex items-center justify-center shrink-0";
  if (type === "application") return <div className={`${cls} bg-blue-100`}><FileText size={16} className="text-blue-600" /></div>;
  if (type === "interview") return <div className={`${cls} bg-purple-100`}><Calendar size={16} className="text-purple-600" /></div>;
  if (type === "message") return <div className={`${cls} bg-green-100`}><MessageSquare size={16} className="text-green-600" /></div>;
  if (type === "favorite") return <div className={`${cls} bg-red-100`}><Heart size={16} className="text-red-600" /></div>;
  return <div className={`${cls} bg-gray-100`}><Activity size={16} className="text-gray-600" /></div>;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle size={48} className="text-danger mb-4" />
      <p className="text-danger text-lg mb-4">{message}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Réessayer</Button>}
    </div>
  );
}

function StudentDashboard({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    setError(null);
    studentService.getDashboard()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchAll} />;
  if (!data) return null;

  const { firstname, completion, missing_steps, stats, recommendations, badges, tip, active_internship, employment } = data;

  const stepLabels = {
    photo: { label: "Ajouter une photo", icon: Camera },
    cv: { label: "Ajouter un CV", icon: Download },
    skills: { label: "Ajouter vos compétences", icon: Award },
    bio: { label: "Rédiger votre présentation", icon: FileText },
    school: { label: "Ajouter votre formation", icon: GraduationCap },
  };

  const badgeIcons = {
    trophy: "🏅",
    shield: "🥈",
    file: "🥉",
    star: "⭐",
    rocket: "🚀",
    heart: "❤️",
  };

  const matchColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-amber-600";
    return "text-orange-600";
  };

  const matchBarColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-orange-500";
  };

  const remaining = missing_steps?.length || 0;

  return (
    <div className="space-y-8">
      {/* Bonjour */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold">Bonjour{firstname ? ` ${firstname}` : ""} 👋</h1>
        <p className="text-white/80 mt-1">{today}</p>
      </div>

      {/* Profil */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Profil</h2>
          <span className="text-sm font-bold text-primary">{completion}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${
              completion < 40 ? "bg-danger" : completion < 70 ? "bg-amber-500" : "bg-cta"
            }`}
            style={{ width: `${completion}%` }}
          />
        </div>
        {remaining > 0 && (
          <p className="text-sm text-text-muted mb-4">
            Encore <strong>{remaining} étape{remaining > 1 ? "s" : ""}</strong> pour être visible par plus d'entreprises.
          </p>
        )}
        <div className="space-y-2 mb-4">
          {['photo', 'cv', 'skills', 'bio', 'school'].map((step) => {
            const info = stepLabels[step];
            if (!info) return null;
            const done = !missing_steps?.includes(step);
            return (
              <div key={step} className="flex items-center gap-2 text-sm">
                {done ? (
                  <CheckCircle size={16} className="text-cta shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded border-2 border-gray-300 shrink-0" />
                )}
                <span className={done ? "text-cta line-through decoration-cta/50" : "text-text"}>
                  {info.label}
                </span>
              </div>
            );
          })}
        </div>
        {completion < 100 && (
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            Compléter maintenant
            <ArrowRight size={14} />
          </Link>
        )}
      </Card>

      {/* Statistiques */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">Vos statistiques</h2>
        <p className="text-xs text-text-muted mb-4">Suivez votre progression sur StageLink</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/student/applications" className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
            <FileText size={20} className="text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-700">{stats.applications}</p>
            <p className="text-xs text-blue-600/70">Candidatures</p>
          </Link>
          <Link to="/student/favorites" className="p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors">
            <Heart size={20} className="text-red-500 mb-2" />
            <p className="text-2xl font-bold text-red-600">{stats.favorites}</p>
            <p className="text-xs text-red-600/70">Favoris</p>
          </Link>
          <Link to="/student/interviews" className="p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
            <Calendar size={20} className="text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-700">{stats.interviews}</p>
            <p className="text-xs text-purple-600/70">Entretiens</p>
          </Link>
          <Link to="/student/internships" className="p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors">
            <Star size={20} className="text-amber-600 mb-2" />
            <p className="text-2xl font-bold text-amber-700">{stats.recommendations_total}</p>
            <p className="text-xs text-amber-600/70">Recommandations</p>
          </Link>
          <Link to="/student/my-internships" className="p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
            <Play size={20} className="text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-700">{stats.active_internships || 0}</p>
            <p className="text-xs text-green-600/70">Stage{stats.active_internships > 1 ? "s" : ""} en cours</p>
          </Link>
        </div>
      </Card>

      {/* Stage en cours */}
      {active_internship && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Play size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">Stage en cours</h2>
              <p className="font-medium">{active_internship.title}</p>
              <p className="text-sm text-text-muted">{active_internship.company}</p>
              <p className="text-xs text-text-muted mt-1">Démarré le {new Date(active_internship.start_date).toLocaleDateString("fr-FR")}</p>
              <Link to="/student/my-internships" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-2">
                Voir mes stages <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Prochaine étape */}
      {completion < 100 && (
        <Card className="bg-gradient-to-br from-primary-bg to-blue-50 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="text-2xl">🎯</div>
            <div>
              <h2 className="text-lg font-semibold mb-1">Prochaine étape</h2>
              <p className="text-sm text-text-muted mb-3">
                Complétez votre profil pour augmenter vos chances de recevoir des réponses.
              </p>
              <Link
                to="/student/profile"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {stepLabels[missing_steps?.[0]]?.label || "Compléter mon profil"}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Badges */}
      {badges && badges.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Badges</h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((b) => (
              <div
                key={b.key}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${
                  b.earned
                    ? "bg-primary-bg/50 border-primary/20 text-primary"
                    : "bg-gray-50 border-gray-200 text-text-muted opacity-50"
                }`}
              >
                <span className="text-lg">{badgeIcons[b.icon] || "🏅"}</span>
                {b.label}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Astuce */}
      <Card className="bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <span className="text-lg shrink-0">💡</span>
          <div>
            <p className="text-sm font-medium text-amber-800 mb-0.5">Astuce du jour</p>
            <p className="text-sm text-amber-700">{tip}</p>
          </div>
        </div>
      </Card>

      {/* Offres recommandées */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">🔥 Offres recommandées</h2>
          <Link to="/student/internships" className="text-sm text-primary hover:underline flex items-center gap-1">
            Voir toutes <ArrowRight size={14} />
          </Link>
        </div>
        {recommendations.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">Aucune recommandation pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {recommendations.map((r) => (
              <Link
                key={r.id}
                to={`/student/internships/${r.id}`}
                className="block p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{r.title}</h3>
                  <span className={`text-sm font-bold ${matchColor(r.match_score)}`}>
                    {r.match_score}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                  {r.company && <span>{r.company}</span>}
                  {r.location && <span>· {r.location}</span>}
                  {r.type && <span>· {r.type}</span>}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${matchBarColor(r.match_score)}`}
                    style={{ width: `${r.match_score}%` }}
                  />
                </div>
                {r.suggested_skills?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.suggested_skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-full border border-amber-200">
                        <Lightbulb size={10} /> +{skill}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function CompanyDashboard({ user }) {
  const [stats, setStats] = useState({});
  const [applications, setApplications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      internshipService.getMyInternships().catch(() => []),
      interviewService.getAll().catch(() => []),
      conversationService.getAll().catch(() => []),
    ])
      .then(([internships, interviews, convs]) => {
        const interns = Array.isArray(internships) ? internships : [];
        const totalApps = interns.reduce((sum, i) => sum + (i.applications_count || 0), 0);
        const totalViews = interns.reduce((sum, i) => sum + (i.views_count || 0), 0);
        const allApps = interns.flatMap((i) =>
          Array.isArray(i.applications) ? i.applications.map((a) => ({ ...a, internship_title: i.title })) : []
        );
        setStats({
          internships: interns.length,
          applications: totalApps,
          views: totalViews,
          interviews: Array.isArray(interviews) ? interviews.length : 0,
        });
        setApplications(allApps.slice(0, 5));
        setConversations(Array.isArray(convs) ? convs.slice(0, 5) : []);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchAll} />;

  return (
    <div className="space-y-8">
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Bonjour, {user.name}</h1>
        <p className="text-text-muted">{today}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Offres publiées" value={stats.internships} color="text-blue-600 bg-blue-100" link="/company/internships" />
        <StatCard icon={FileText} label="Total candidatures" value={stats.applications} color="text-green-600 bg-green-100" link="/company/applications" />
        <StatCard icon={Eye} label="Vues totales" value={stats.views} color="text-amber-600 bg-amber-100" />
        <StatCard icon={Calendar} label="Entretiens programmés" value={stats.interviews} color="text-purple-600 bg-purple-100" link="/company/interviews" />
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Accès rapide</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/company/internships" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <Briefcase size={16} /> Gérer mes offres
          </Link>
          <Link to="/company/applications" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <FileText size={16} /> Voir les candidatures
          </Link>
          <Link to="/company/messages" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <MessageSquare size={16} /> Messages
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Candidatures récentes</h2>
            <Link to="/company/applications" className="text-sm text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          {applications.length === 0 ? (
            <EmptyState icon={FileText} title="Aucune candidature" description="Vous n'avez pas encore reçu de candidatures." />
          ) : (
            <div className="space-y-3">
              {applications.map((a) => (
                <Link
                  key={a.id}
                  to={`/company/applications/${a.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary-bg/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-bg flex items-center justify-center shrink-0">
                    <Users size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.student?.name || a.student_name || "Candidat"}</p>
                    <p className="text-xs text-text-muted truncate">{a.internship_title || ""}</p>
                  </div>
                  <Badge variant={a.status || "pending"}>{a.status || "pending"}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages récents</h2>
            <Link to="/company/messages" className="text-sm text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          {conversations.length === 0 ? (
            <EmptyState icon={MessageSquare} title="Aucun message" description="Vous n'avez pas encore de conversations." />
          ) : (
            <div className="space-y-3">
              {conversations.map((c) => (
                <Link
                  key={c.id}
                  to={`/company/messages/${c.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary-bg/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-bg flex items-center justify-center shrink-0">
                    <Users size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.internship?.title || c.with?.name || "Conversation"}</p>
                    <p className="text-xs text-text-muted truncate">{c.last_message?.message || "Aucun message"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-text-muted">{c.last_message ? timeAgo(c.last_message.created_at) : ""}</span>
                    {(c.unread_count || 0) > 0 && (
                      <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard({ user }) {
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

export default function Dashboard() {
  const { user } = useAuth();

  if (user.role === "student") return <StudentDashboard user={user} />;
  if (user.role === "company") return <CompanyDashboard user={user} />;
  if (user.role === "admin") return <AdminDashboard user={user} />;

  return <ErrorState message="Rôle utilisateur non reconnu." />;
}
