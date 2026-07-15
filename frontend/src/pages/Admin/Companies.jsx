import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { Building2, Search, CheckCircle, XCircle, AlertTriangle, Trash2, Eye, Briefcase, Mail, MapPin, Globe, Clock } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import toast from "react-hot-toast";

const statusLabels = { pending: "En attente", validated: "Validée", suspended: "Suspendue" };
const statusVariants = { pending: "pending", validated: "accepted", suspended: "rejected" };

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [details, setDetails] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getCompanies({ search, sort, order, page, per_page: 12 });
      if (res.data) {
        setCompanies(res.data);
        setTotalPages(res.last_page || 1);
      } else {
        setCompanies(res);
        setTotalPages(1);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, [page, sort, order]);

  const handleStatus = async (id, action) => {
    try {
      if (action === "validate") await adminService.validateCompany(id);
      else if (action === "suspend") await adminService.suspendCompany(id);
      else if (action === "reactivate") await adminService.reactivateCompany(id);
      toast.success("Statut mis à jour");
      fetchCompanies();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette entreprise ?")) return;
    try {
      await adminService.deleteCompany(id);
      toast.success("Entreprise supprimée");
      setDetails(null);
      fetchCompanies();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openDetails = async (company) => {
    try {
      const data = await adminService.getCompany(company.id);
      setDetails(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading && companies.length === 0)
    return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error && companies.length === 0)
    return <div className="text-center py-12 text-danger"><p>{error}</p><button onClick={fetchCompanies} className="mt-4 text-primary underline cursor-pointer">Réessayer</button></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Entreprises</h1>
        <p className="text-text-muted text-sm">Gérez les entreprises inscrites sur la plateforme</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchCompanies(); }} className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <Button type="submit" size="sm">Rechercher</Button>
        <select
          value={order === "desc" && sort === "created_at" ? "newest" : order === "asc" && sort === "created_at" ? "oldest" : "name_asc"}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "newest") { setSort("created_at"); setOrder("desc"); }
            else if (val === "oldest") { setSort("created_at"); setOrder("asc"); }
            else if (val === "name_asc") { setSort("name"); setOrder("asc"); }
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="newest">Plus récentes</option>
          <option value="oldest">Plus anciennes</option>
          <option value="name_asc">Nom A-Z</option>
        </select>
      </form>

      {companies.length === 0 ? (
        <EmptyState icon={Building2} title="Aucune entreprise" description={search ? "Essayez un autre terme de recherche" : "Aucune entreprise inscrite pour le moment"} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {companies.map((company) => (
            <Card key={company.id}>
              <div className="flex items-start gap-4">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-primary-bg flex items-center justify-center flex-shrink-0">
                    <Building2 size={24} className="text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold truncate">{company.name}</h3>
                      <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                        <MapPin size={12} />
                        {company.location || "Localisation inconnue"}
                        {company.industry && <><span className="mx-1">·</span>{company.industry}</>}
                      </p>
                    </div>
                    <Badge variant={statusVariants[company.status]}>{statusLabels[company.status] || company.status}</Badge>
                  </div>
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                    <Mail size={12} />
                    {company.email}
                  </p>
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                    <Briefcase size={12} />
                    {company.internships_count ?? 0} offre{(company.internships_count ?? 0) > 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {company.status === "pending" && (
                      <Button size="sm" variant="primary" onClick={() => handleStatus(company.id, "validate")}>
                        <CheckCircle size={14} /> Valider
                      </Button>
                    )}
                    {company.status === "validated" && (
                      <Button size="sm" variant="danger" onClick={() => handleStatus(company.id, "suspend")}>
                        <XCircle size={14} /> Suspendre
                      </Button>
                    )}
                    {company.status === "suspended" && (
                      <Button size="sm" variant="primary" onClick={() => handleStatus(company.id, "reactivate")}>
                        <AlertTriangle size={14} /> Réactiver
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openDetails(company)}>
                      <Eye size={14} /> Détails
                    </Button>
                    <Button size="sm" variant="ghost" className="!text-danger hover:!bg-red-50" onClick={() => handleDelete(company.id)}>
                      <Trash2 size={14} /> Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </> )}

      <Modal open={!!details} onClose={() => setDetails(null)} title={details?.name || "Détails"} size="lg">
        {details && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              {details.logo ? (
                <img src={details.logo} alt={details.name} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary-bg flex items-center justify-center">
                  <Building2 size={28} className="text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{details.name}</h3>
                <Badge variant={statusVariants[details.status]} className="mt-1">{statusLabels[details.status] || details.status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {details.email && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Mail size={16} /> {details.email}
                </div>
              )}
              {details.location && (
                <div className="flex items-center gap-2 text-text-muted">
                  <MapPin size={16} /> {details.location}
                </div>
              )}
              {details.website && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Globe size={16} />
                  <a href={details.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{details.website}</a>
                </div>
              )}
              {details.industry && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Briefcase size={16} /> {details.industry}
                </div>
              )}
              {details.created_at && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock size={16} /> Inscrite le {new Date(details.created_at).toLocaleDateString("fr-FR")}
                </div>
              )}
            </div>

            {details.description && (
              <div>
                <h4 className="font-semibold mb-1">Description</h4>
                <p className="text-sm text-text-muted whitespace-pre-wrap">{details.description}</p>
              </div>
            )}

            {details.internships && details.internships.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2"><Briefcase size={16} /> Offres de stage ({details.internships.length})</h4>
                <div className="space-y-2">
                  {details.internships.map((internship) => (
                    <div key={internship.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <Link to={`/internships/${internship.id}`} className="font-medium text-sm text-primary hover:underline">{internship.title}</Link>
                        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                          <Badge variant={internship.status}>{internship.status}</Badge>
                          <span>{internship.applications_count ?? 0} candidature{(internship.applications_count ?? 0) > 1 ? "s" : ""}</span>
                          <span>{internship.views ?? 0} vue{(internship.views ?? 0) > 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setDetails(null)}>Fermer</Button>
              {details.status === "pending" && (
                <Button onClick={() => { handleStatus(details.id, "validate"); setDetails(null); }}>Valider</Button>
              )}
              {details.status === "validated" && (
                <Button variant="danger" onClick={() => { handleStatus(details.id, "suspend"); setDetails(null); }}>Suspendre</Button>
              )}
              {details.status === "suspended" && (
                <Button onClick={() => { handleStatus(details.id, "reactivate"); setDetails(null); }}>Réactiver</Button>
              )}
              <Button variant="ghost" className="!text-danger" onClick={() => { handleDelete(details.id); }}>Supprimer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
