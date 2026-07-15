import { useState, useEffect } from "react";
import { Heart, MapPin, Clock, Euro, Building2, Trash2 } from "lucide-react";
import { favoriteService } from "../../services/favoriteService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    favoriteService.getAll()
      .then(setFavorites)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleUnfavorite = async (internshipId) => {
    try {
      await favoriteService.toggle(internshipId);
      setFavorites((prev) => prev.filter((f) => (f.internship?.id ?? f.internship_id) !== internshipId));
      toast.success("Retiré des favoris");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-center py-12 text-danger"><p>{error}</p><button onClick={() => { setLoading(true); setError(null); favoriteService.getAll().then(setFavorites).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false)); }} className="mt-4 text-primary underline cursor-pointer">Réessayer</button></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mes favoris</h1>
        <p className="text-text-muted text-sm">Retrouvez vos offres de stage enregistrées</p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState icon={Heart} title="Aucun favori" description="Explorez les offres et ajoutez vos stages préférés à vos favoris." action actionLabel="Voir les offres" onAction={() => navigate("/student/internships")} />
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {favorites.map((fav) => {
            const internship = fav.internship || fav;
            return (
              <Card key={fav.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{internship.title}</h3>
                    <p className="text-sm text-text-muted flex items-center gap-1.5 mt-0.5">
                      <Building2 size={14} />
                      {internship.company?.name || fav.company?.name || "Entreprise"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-text-muted mb-3">
                  {internship.location && <span className="flex items-center gap-1"><MapPin size={14} />{internship.location}</span>}
                  {internship.type && <span className="flex items-center gap-1"><Clock size={14} />{internship.type}</span>}
                  {internship.salary && <span className="flex items-center gap-1"><Euro size={14} />{internship.salary} €/mois</span>}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={internship.status}>{internship.status === "published" ? "Ouvert" : internship.status}</Badge>
                  <button
                    onClick={() => handleUnfavorite(fav.internship?.id ?? fav.internship_id)}
                    className="p-2 rounded-lg text-danger hover:bg-red-50 transition-colors"
                    title="Retirer des favoris"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
