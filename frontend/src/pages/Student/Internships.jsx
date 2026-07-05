import { useState, useEffect } from "react";
import { Search, MapPin, Clock, GraduationCap, Euro, Building2 } from "lucide-react";
import { internshipService } from "../../services/internshipService";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    internshipService.getAll().then(setInternships).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = internships.filter((i) =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.company?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = async () => {
    if (!coverLetter.trim()) return toast.error("Veuillez écrire une lettre de motivation");
    setApplying(true);
    try {
      await internshipService.apply(selected.id, { cover_letter: coverLetter });
      toast.success("Candidature envoyée !");
      setShowApply(false);
      setCoverLetter("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la candidature");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Offres de stage</h1>
          <p className="text-text-muted text-sm">Trouvez le stage qui vous correspond</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Aucune offre trouvée" description="Essayez de modifier vos critères de recherche." />
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {filtered.map((internship) => (
            <Card key={internship.id} hover onClick={() => setSelected(internship)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{internship.title}</h3>
                  <p className="text-sm text-text-muted flex items-center gap-1.5 mt-0.5">
                    <Building2 size={14} />
                    {internship.company?.name || "Entreprise"}
                  </p>
                </div>
                <Badge variant={internship.status}>{internship.status === "open" ? "Ouvert" : internship.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-text-muted mb-3">
                {internship.location && <span className="flex items-center gap-1"><MapPin size={14} />{internship.location}</span>}
                {internship.type && <span className="flex items-center gap-1"><Clock size={14} />{internship.type}</span>}
                {internship.duration && <span className="flex items-center gap-1"><GraduationCap size={14} />{internship.duration}</span>}
                {internship.salary && <span className="flex items-center gap-1"><Euro size={14} />{internship.salary}€/mois</span>}
              </div>
              <p className="text-sm text-text-muted line-clamp-2">{internship.description}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!selected && !showApply} onClose={() => setSelected(null)} title={selected?.title} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge>{selected.status}</Badge>
              <span className="flex items-center gap-1 text-text-muted"><MapPin size={14} />{selected.location}</span>
              <span className="flex items-center gap-1 text-text-muted"><Clock size={14} />{selected.type}</span>
            </div>
            <p className="text-text-muted">{selected.description}</p>
            {selected.requirements && (
              <div>
                <h4 className="font-semibold mb-1">Prérequis</h4>
                <p className="text-sm text-text-muted">{selected.requirements}</p>
              </div>
            )}
            <Button onClick={() => { setShowApply(true); }} variant="primary" className="w-full">
              Postuler maintenant
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={showApply} onClose={() => setShowApply(false)} title="Postuler">
        <div className="space-y-4">
          <p className="text-sm text-text-muted">Offre : <strong>{selected?.title}</strong></p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Lettre de motivation</label>
            <textarea
              className="w-full h-32 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Expliquez pourquoi vous êtes le candidat idéal..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>
          <Button onClick={handleApply} className="w-full" loading={applying}>Envoyer ma candidature</Button>
        </div>
      </Modal>
    </div>
  );
}
