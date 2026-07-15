import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { GraduationCap, Mail, Phone, Calendar, FileText, Briefcase, Heart, ArrowLeft, Download, ExternalLink, MapPin, Globe } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

const statusLabels = { pending: "En attente", accepted: "Acceptée", rejected: "Refusée" };

export default function AdminStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminService.getStudent(id).then(setData).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-center py-12 text-danger"><p>{error}</p><button onClick={load} className="mt-4 text-primary underline cursor-pointer">Réessayer</button></div>;
  if (!data) return null;

  const { user, profile, cv_url, applications, favorites_count } = data;

  return (
    <div>
      <div className="mb-6">
        <Link to="/admin/students" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-2 transition-colors"><ArrowLeft size={16} />Retour aux étudiants</Link>
        <h1 className="text-2xl font-bold flex items-center gap-3">{user.name} {user.banned_at && <Badge variant="rejected">Banni</Badge>}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex flex-col items-center text-center">
              {profile?.photo ? (
                <img src={profile.photo} alt="" className="w-24 h-24 rounded-full object-cover mb-4" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-bg flex items-center justify-center mb-4">
                  <GraduationCap size={36} className="text-primary" />
                </div>
              )}
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-sm text-text-muted">{user.email}</p>
              {user.phone && <p className="text-sm text-text-muted flex items-center gap-1 mt-1"><Phone size={14} />{user.phone}</p>}
              <p className="text-xs text-text-muted mt-2 flex items-center gap-1"><Calendar size={14} />Inscrit le {new Date(user.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
          </Card>

          {profile?.bio && (
            <Card>
              <h3 className="font-semibold mb-2">À propos</h3>
              <p className="text-sm text-text-muted whitespace-pre-line">{profile.bio}</p>
            </Card>
          )}

          {profile?.skills?.length > 0 && (
            <Card>
              <h3 className="font-semibold mb-3">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-primary-bg text-primary text-xs font-medium rounded-full">{skill}</span>
                ))}
              </div>
            </Card>
          )}

          {(cv_url || profile?.github || profile?.portfolio || profile?.linkedin || profile?.location) && (
            <Card>
              <h3 className="font-semibold mb-3">Liens & Infos</h3>
              <div className="space-y-2">
                {profile?.location && <p className="text-sm text-text-muted flex items-center gap-2"><MapPin size={16} className="shrink-0" />{profile.location}</p>}
                {cv_url && (
                  <a href={cv_url} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" size="sm" className="w-full"><Download size={16} />Télécharger CV</Button>
                  </a>
                )}
                {profile?.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><Github size={16} />GitHub <ExternalLink size={12} /></a>
                )}
                {profile?.portfolio && (
                  <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><Globe size={16} />Portfolio <ExternalLink size={12} /></a>
                )}
                {profile?.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><ExternalLink size={16} />LinkedIn <ExternalLink size={12} /></a>
                )}
              </div>
            </Card>
          )}

          <Card>
            <div className="flex items-center gap-3">
              <Heart size={20} className="text-danger" />
              <div>
                <p className="text-2xl font-bold">{favorites_count ?? 0}</p>
                <p className="text-xs text-text-muted">Favoris</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Briefcase size={18} />Candidatures</h3>
            {!applications || applications.length === 0 ? (
              <EmptyState icon={FileText} title="Aucune candidature" />
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-sm">{app.internship?.title || "Stage"}</p>
                      <p className="text-xs text-text-muted">{app.internship?.company?.name || "Entreprise"}</p>
                      <p className="text-xs text-text-muted mt-0.5"><Calendar size={12} className="inline mr-1" />{new Date(app.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <Badge variant={app.status}>{statusLabels[app.status] || app.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
