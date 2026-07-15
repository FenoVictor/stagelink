import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Clock, GraduationCap, Euro, Building2, Upload, FileText, X, XCircle, SlidersHorizontal, Heart, Briefcase, Filter, Users } from "lucide-react";
import { internshipService } from "../../services/internshipService";
import { favoriteService } from "../../services/favoriteService";
import { conversationService } from "../../services/conversationService";
import api, { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const typeOptions = [
  { value: "", label: "Tous les types" },
  { value: "remote", label: "Télétravail" },
  { value: "onsite", label: "Présentiel" },
  { value: "hybrid", label: "Hybride" },
];

const studyLevelOptions = [
  { value: "", label: "Tous niveaux" },
  { value: "Bac", label: "Bac" },
  { value: "Bac+2", label: "Bac+2" },
  { value: "Bac+3", label: "Bac+3" },
  { value: "Bac+5", label: "Bac+5" },
  { value: "Master", label: "Master" },
  { value: "Doctorat", label: "Doctorat" },
];

const dateOptions = [
  { value: "", label: "Toutes les dates" },
  { value: "7", label: "7 derniers jours" },
  { value: "30", label: "30 derniers jours" },
  { value: "90", label: "3 derniers mois" },
];

const durationOptions = [
  { value: "", label: "Toutes durées" },
  { value: "1 mois", label: "1 mois" },
  { value: "2 mois", label: "2 mois" },
  { value: "3 mois", label: "3 mois" },
  { value: "4 mois", label: "4 mois" },
  { value: "6 mois", label: "6 mois" },
  { value: "12 mois", label: "12 mois" },
];

export default function Internships() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ location: "", category: "", type: "", study_level: "", duration: "", is_paid: false, date_from: "" });
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ locations: [], durations: [], study_levels: [] });
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get("/admin/categories").then(({ data }) => setCategories(Array.isArray(data) ? data : [])).catch(() => {}),
      internshipService.getFilters().then(setFilterOptions).catch(() => {}),
    ]);
  }, []);

  const buildParams = useCallback(() => {
    const params = { page, per_page: perPage, sort, order };
    if (search) params.keyword = search;
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== "" && val !== false) params[key] = val;
    });
    return params;
  }, [page, perPage, sort, order, search, filters]);

  const fetchInternships = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams();
      params.page = p;
      const res = await internshipService.getAll(params);
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
  }, [buildParams, page]);

  useEffect(() => { fetchInternships(page); }, [page, sort, order]);

  const applyFilters = () => { setPage(1); fetchInternships(1); };

  const resetFilters = () => {
    setFilters({ location: "", category: "", type: "", study_level: "", duration: "", is_paid: false, date_from: "" });
    setSearch("");
    setSort("created_at");
    setOrder("desc");
    setPage(1);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") applyFilters(); };

  const handleSortChange = (e) => {
    const value = e.target.value;
    switch (value) {
      case "newest": setSort("created_at"); setOrder("desc"); break;
      case "oldest": setSort("created_at"); setOrder("asc"); break;
      case "salary_high": setSort("salary"); setOrder("desc"); break;
      case "salary_low": setSort("salary"); setOrder("asc"); break;
    }
    setPage(1);
  };

  const getSortValue = () => {
    if (sort === "created_at" && order === "desc") return "newest";
    if (sort === "created_at" && order === "asc") return "oldest";
    if (sort === "salary" && order === "desc") return "salary_high";
    if (sort === "salary" && order === "asc") return "salary_low";
    return "newest";
  };

  const handleFavorite = async (id, e) => {
    e.stopPropagation();
    setInternships((prev) => prev.map((i) => (i.id === id ? { ...i, is_favorited: !i.is_favorited } : i)));
    try {
      await favoriteService.toggle(id);
    } catch (err) {
      setInternships((prev) => prev.map((i) => (i.id === id ? { ...i, is_favorited: !i.is_favorited } : i)));
      toast.error(getErrorMessage(err));
    }
  };

  const handleContact = async (internship, e) => {
    e.stopPropagation();
    try {
      await conversationService.start({ internship_id: internship.id, message: "Bonjour, je suis intéressé par cette offre." });
      navigate("/student/messages");
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleApply = async () => {
    if (!coverLetter.trim()) return toast.error("Veuillez écrire une lettre de motivation");
    setApplying(true);
    try {
      const formData = new FormData();
      formData.append("cover_letter", coverLetter);
      if (cvFile) formData.append("cv", cvFile);
      await internshipService.apply(selected.id, formData);
      toast.success("Candidature envoyée !");
      setShowApply(false);
      setCoverLetter("");
      setCvFile(null);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setApplying(false); }
  };

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const activeFilterCount = Object.values(filters).filter((v) => v !== "" && v !== false).length;

  if (loading && internships.length === 0)
    return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Offres de stage</h1>
          <p className="text-text-muted text-sm">Trouvez le stage qui vous correspond</p>
        </div>
      </div>

      {/* Search + Sort bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Rechercher par titre, entreprise, compétence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative p-2.5 rounded-lg border transition-colors cursor-pointer ${showFilters ? "bg-primary text-white border-primary" : "border-border hover:bg-gray-50"}`}
        >
          <Filter size={18} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
        <select
          value={getSortValue()}
          onChange={handleSortChange}
          className="px-3 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="newest">Plus récents</option>
          <option value="oldest">Plus anciens</option>
          <option value="salary_high">Salaire + élevé</option>
          <option value="salary_low">Salaire + bas</option>
        </select>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-6 p-5 bg-surface border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-1.5"><Filter size={16} /> Filtres</h3>
            <button onClick={resetFilters} className="text-xs text-primary hover:underline cursor-pointer">Réinitialiser tout</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <Select label="Ville" value={filters.location} onChange={(e) => setFilter("location", e.target.value)}>
              <option value="">Toutes les villes</option>
              {filterOptions.locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </Select>
            <Select label="Domaine" value={filters.category} onChange={(e) => setFilter("category", e.target.value)}>
              <option value="">Tous les domaines</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Niveau d'étude" value={filters.study_level} onChange={(e) => setFilter("study_level", e.target.value)}>
              {studyLevelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
            <Select label="Type de télétravail" value={filters.type} onChange={(e) => setFilter("type", e.target.value)}>
              {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
            <Select label="Durée" value={filters.duration} onChange={(e) => setFilter("duration", e.target.value)}>
              {durationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
            <Select label="Date de publication" value={filters.date_from} onChange={(e) => {
              const days = e.target.value;
              if (!days) { setFilter("date_from", ""); return; }
              const d = new Date(); d.setDate(d.getDate() - parseInt(days));
              setFilter("date_from", d.toISOString().split("T")[0]);
            }}>
              {dateOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.is_paid}
                onChange={(e) => setFilter("is_paid", e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Stages rémunérés uniquement</span>
            </label>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" onClick={applyFilters}>Appliquer</Button>
              <Button size="sm" variant="ghost" onClick={resetFilters}><XCircle size={16} /> Réinitialiser</Button>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}

      {!loading && internships.length === 0 ? (
        <EmptyState icon={Search} title="Aucune offre trouvée" description="Essayez de modifier vos critères de recherche." />
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-4">
            {internships.map((internship) => (
              <Card key={internship.id} hover onClick={() => setSelected(internship)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{internship.title}</h3>
                    <p className="text-sm text-text-muted flex items-center gap-1.5 mt-0.5">
                      <Building2 size={14} /> {internship.company?.name || "Entreprise"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <Badge variant={internship.status}>{internship.status === "published" ? "Ouvert" : internship.status}</Badge>
                    <button onClick={(e) => handleFavorite(internship.id, e)} className="p-1.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer">
                      <Heart size={18} className={internship.is_favorited ? "fill-red-500 text-red-500" : "text-text-muted"} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-text-muted mb-3">
                  {internship.location && <span className="flex items-center gap-1"><MapPin size={14} />{internship.location}</span>}
                  {internship.type && <span className="flex items-center gap-1"><Briefcase size={14} />{internship.type === "remote" ? "Télétravail" : internship.type === "hybrid" ? "Hybride" : "Présentiel"}</span>}
                  {internship.duration && <span className="flex items-center gap-1"><Clock size={14} />{internship.duration}</span>}
                  {internship.study_level && <span className="flex items-center gap-1"><GraduationCap size={14} />{internship.study_level}</span>}
                  {internship.salary ? <span className="flex items-center gap-1"><Euro size={14} />{internship.salary}€/mois</span> : <span className="flex items-center gap-1 text-gray-400"><Euro size={14} />Non rémunéré</span>}
                </div>
                <p className="text-sm text-text-muted line-clamp-2 mb-2">{internship.description}</p>
                {internship.applications_count > 0 && (
                  <p className="text-xs text-text-muted flex items-center gap-1 mb-3"><Users size={13} /> {internship.applications_count} étudiant{internship.applications_count > 1 ? "s" : ""} {internship.applications_count > 1 ? "ont" : "a"} déjà postulé{internship.applications_count > 1 ? "s" : ""}</p>
                )}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="primary" onClick={() => { setSelected(internship); }}>Postuler</Button>
                  <Button size="sm" variant="outline" onClick={(e) => handleContact(internship, e)}>Contacter</Button>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal open={!!selected && !showApply} onClose={() => setSelected(null)} title={selected?.title} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant={selected.status}>{selected.status === "published" ? "Ouvert" : selected.status}</Badge>
              {selected.location && <span className="flex items-center gap-1 text-text-muted"><MapPin size={14} />{selected.location}</span>}
              <span className="flex items-center gap-1 text-text-muted"><Briefcase size={14} />{selected.type === "remote" ? "Télétravail" : selected.type === "hybrid" ? "Hybride" : "Présentiel"}</span>
              {selected.duration && <span className="flex items-center gap-1 text-text-muted"><Clock size={14} />{selected.duration}</span>}
              {selected.study_level && <span className="flex items-center gap-1 text-text-muted"><GraduationCap size={14} />{selected.study_level}</span>}
              {selected.salary ? <span className="flex items-center gap-1 text-text-muted"><Euro size={14} />{selected.salary}€/mois</span> : <span className="flex items-center gap-1 text-gray-400"><Euro size={14} />Non rémunéré</span>}
            </div>
            <p className="text-text-muted">{selected.description}</p>
            {selected.requirements && (
              <div>
                <h4 className="font-semibold mb-1">Prérequis</h4>
                <p className="text-sm text-text-muted">{selected.requirements}</p>
              </div>
            )}
            {selected.company?.name && (
              <div>
                <h4 className="font-semibold mb-1">Entreprise</h4>
                <p className="text-sm text-text-muted">{selected.company.name}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={() => { setShowApply(true); }} variant="primary" className="flex-1">Postuler</Button>
              <Button onClick={() => { setSelected(null); handleContact(selected, { stopPropagation: () => {} }); }} variant="outline" className="flex-1">Contacter</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showApply} onClose={() => setShowApply(false)} title="Postuler">
        <div className="space-y-4">
          <p className="text-sm text-text-muted">Offre : <strong>{selected?.title}</strong></p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Lettre de motivation</label>
            <textarea className="w-full h-36 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Présentez votre parcours, vos compétences et expliquez pourquoi vous êtes le candidat idéal pour ce stage." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">CV (optionnel)</label>
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
              {cvFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText size={18} className="text-primary" />
                  <span className="text-sm text-text-muted">{cvFile.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setCvFile(null); }} className="p-1 rounded-full hover:bg-red-50 cursor-pointer"><X size={14} className="text-danger" /></button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload size={20} className="text-text-muted" />
                  <span className="text-sm text-text-muted">Cliquez pour importer votre CV (PDF, DOC, DOCX — 2 Mo max)</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) setCvFile(f); }} />
          </div>
          <Button onClick={handleApply} className="w-full" loading={applying}>Envoyer ma candidature</Button>
        </div>
      </Modal>
    </div>
  );
}
