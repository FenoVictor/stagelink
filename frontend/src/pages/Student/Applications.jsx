import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Building2, Calendar } from "lucide-react";
import { internshipService } from "../../services/internshipService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";

export default function Applications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    internshipService.getMyApplications()
      .then(setApplications)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-center py-12 text-danger"><p>{error}</p><button onClick={() => { setLoading(true); setError(null); internshipService.getMyApplications().then(setApplications).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false)); }} className="mt-4 text-primary underline cursor-pointer">Réessayer</button></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mes candidatures</h1>
        <p className="text-text-muted text-sm">Suivez l'état de vos candidatures</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState icon={FileText} title="Aucune candidature" description="Vous n'avez pas encore postulé à une offre." action actionLabel="Voir les offres" onAction={() => navigate("/student/internships")} />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{app.internship?.title || "Stage"}</h3>
                  <p className="text-sm text-text-muted flex items-center gap-1.5 mt-1">
                    <Building2 size={14} />
                    {app.internship?.company?.name || "Entreprise"}
                  </p>
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                    <Calendar size={12} />
                    Postulé le {new Date(app.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <Badge variant={app.status}>{app.status === "pending" ? "En attente" : app.status === "accepted" ? "Acceptée" : "Refusée"}</Badge>
              </div>
              {app.cover_letter && (
                <p className="text-sm text-text-muted mt-3 line-clamp-2">{app.cover_letter}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
