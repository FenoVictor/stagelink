import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase, FileText, Users, Calendar, Eye, MessageSquare, ArrowRight, Activity,
} from "lucide-react";
import { internshipService } from "../../services/internshipService";
import { conversationService } from "../../services/conversationService";
import { interviewService } from "../../services/interviewService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { StatCard, LoadingSpinner, ErrorState, today, timeAgo } from "./shared";

export default function CompanyDashboard({ user }) {
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
