import { useState, useEffect } from "react";
import { Trash2, Building2 } from "lucide-react";
import { adminService } from "../../services/adminService";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

export default function AdminInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminService.getInternships().then(setInternships).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette offre ?")) return;
    try {
      await adminService.deleteInternship(id);
      toast.success("Offre supprimée");
      load();
    } catch {
      toast.error("Erreur");
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Offres de stage</h1>
        <p className="text-text-muted text-sm">Modération des offres</p>
      </div>

      {internships.length === 0 ? (
        <EmptyState icon={Building2} title="Aucune offre" />
      ) : (
        <div className="space-y-3">
          {internships.map((internship) => (
            <Card key={internship.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{internship.title}</h3>
                  <p className="text-sm text-text-muted">{internship.company?.name} · {internship.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={internship.status}>{internship.status}</Badge>
                  <button onClick={() => handleDelete(internship.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"><Trash2 size={16} className="text-danger" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
