import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { Key, Mail, Clock, User, RefreshCw } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminPasswordResets() {
  const [resets, setResets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminService.getPasswordResets()
      .then(setResets)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-center py-12 text-danger"><p>{error}</p><button onClick={load} className="mt-4 text-primary underline cursor-pointer">Réessayer</button></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Demandes de réinitialisation</h1>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw size={16} />Actualiser</Button>
      </div>

      {resets.length === 0 ? (
        <EmptyState icon={Key} title="Aucune demande" description="Aucun étudiant n'a demandé de réinitialisation de mot de passe pour le moment." />
      ) : (
        <div className="space-y-3">
          {resets.map((r) => (
            <Card key={r.email}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={16} className="text-text-muted shrink-0" />
                    <span className="font-medium">{r.name || r.email}</span>
                    <Badge variant={r.role === "student" ? "open" : "default"}>{r.role === "student" ? "Étudiant" : r.role === "company" ? "Entreprise" : r.role}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1"><Mail size={14} />{r.email}</span>
                    <span className="flex items-center gap-1"><Clock size={14} />{new Date(r.created_at).toLocaleString("fr-FR")}</span>
                  </div>
                </div>
                <Link to={`/admin/users/${r.user_id}`} className="shrink-0">
                  <Button variant="outline" size="sm">Voir l'utilisateur</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
