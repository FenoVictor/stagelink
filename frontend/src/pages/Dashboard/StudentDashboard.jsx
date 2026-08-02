import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  LayoutDashboard, Briefcase, FileText, CheckCircle, Eye, MessageSquare,
  Calendar, Heart, Activity, ArrowRight, Camera, Phone, MapPin, Globe, Download, Award, Play, Lightbulb,
  Star, GraduationCap,
} from "lucide-react";
import { studentService } from "../../services/studentService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import { LoadingSpinner, ErrorState, today } from "./shared";

export default function StudentDashboard({ user }) {
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
    photo: { label: "Ajouter une photo", icon: Camera, pts: 10 },
    cv: { label: "Ajouter un CV", icon: Download, pts: 20 },
    bio: { label: "Rédiger votre bio", icon: FileText, pts: 10 },
    formation: { label: "Renseigner votre formation", icon: GraduationCap, pts: 15 },
    skills: { label: "Ajouter vos compétences", icon: Award, pts: 20 },
    languages: { label: "Ajouter vos langues", icon: Globe, pts: 10 },
    location: { label: "Renseigner votre localisation", icon: MapPin, pts: 10 },
    links: { label: "Ajouter un lien professionnel", icon: Globe, pts: 5 },
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
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold">Bonjour{firstname ? ` ${firstname}` : ""} 👋</h1>
        <p className="text-white/80 mt-1">{today}</p>
      </div>

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
          {['photo', 'cv', 'bio', 'formation', 'skills', 'languages', 'location', 'links'].map((step) => {
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
                <span className={`ml-auto text-xs font-bold ${done ? "text-cta/60" : "text-text-muted"}`}>
                  {info.pts} pts
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
          <div className="p-4 rounded-xl bg-cyan-50 transition-colors">
            <Eye size={20} className="text-cyan-600 mb-2" />
            <p className="text-2xl font-bold text-cyan-700">{stats.profile_views || 0}</p>
            <p className="text-xs text-cyan-600/70">Vues profil</p>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50 transition-colors">
            <Download size={20} className="text-indigo-600 mb-2" />
            <p className="text-2xl font-bold text-indigo-700">{stats.cv_views || 0}</p>
            <p className="text-xs text-indigo-600/70">Vues CV</p>
          </div>
        </div>
      </Card>

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

      <Card className="bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <span className="text-lg shrink-0">💡</span>
          <div>
            <p className="text-sm font-medium text-amber-800 mb-0.5">Astuce du jour</p>
            <p className="text-sm text-amber-700">{tip}</p>
          </div>
        </div>
      </Card>

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
