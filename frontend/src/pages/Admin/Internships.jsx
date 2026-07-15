import { useState, useEffect } from "react";
import { Search, Trash2, Building2, XCircle } from "lucide-react";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import toast from "react-hot-toast";

const statusLabels = { draft: "Brouillon", published: "Publiée", closed: "Fermé", expired: "Expiré" };
const statusVariants = { draft: "pending", published: "published", closed: "rejected", expired: "expired" };

export default function AdminInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInternships = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getInternships({ search, status: statusFilter, sort, order, page, per_page: 15 });
      if (res.data) {
        setInternships(res.data);
        setTotalPages(res.last_page || 1);
      } else {
        setInternships(res);
        setTotalPages(1);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInternships(); }, [page, sort, order, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette offre ?")) return;
    try {
      await adminService.deleteInternship(id);
      toast.success("Offre supprimée");
      fetchInternships();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading && internships.length === 0)
    return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error && internships.length === 0)
    return <div className="text-center py-12 text-danger"><p>{error}</p><button onClick={fetchInternships} className="mt-4 text-primary underline cursor-pointer">Réessayer</button></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Offres de stage</h1>
        <p className="text-text-muted text-sm">Modération des offres</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchInternships(); }} className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par titre, entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <Button type="submit" size="sm">Rechercher</Button>
        {search && (
          <Button type="button" size="sm" variant="ghost" onClick={() => { setSearch(""); setPage(1); }}>
            <XCircle size={16} />
          </Button>
        )}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Tous les statuts</option>
          <option value="published">Publiée</option>
          <option value="draft">Brouillon</option>
          <option value="closed">Fermé</option>
          <option value="expired">Expiré</option>
        </select>
        <select
          value={order === "desc" && sort === "created_at" ? "newest" : order === "asc" && sort === "created_at" ? "oldest" : "title_asc"}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "newest") { setSort("created_at"); setOrder("desc"); }
            else if (val === "oldest") { setSort("created_at"); setOrder("asc"); }
            else if (val === "title_asc") { setSort("title"); setOrder("asc"); }
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="newest">Plus récentes</option>
          <option value="oldest">Plus anciennes</option>
          <option value="title_asc">Titre A-Z</option>
        </select>
      </form>

      {internships.length === 0 ? (
        <EmptyState icon={Building2} title="Aucune offre" />
      ) : (
        <>
          <div className="space-y-3">
            {internships.map((internship) => (
              <Card key={internship.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{internship.title}</h3>
                    <p className="text-sm text-text-muted">{internship.company?.name} · {internship.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariants[internship.status]}>{statusLabels[internship.status] || internship.status}</Badge>
                    <button onClick={() => handleDelete(internship.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"><Trash2 size={16} className="text-danger" /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
