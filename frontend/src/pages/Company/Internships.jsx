import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, MapPin, Clock, Euro, Users, Star } from "lucide-react";
import { internshipService } from "../../services/internshipService";
import { getErrorMessage } from "../../services/api";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

const emptyForm = { title: "", description: "", requirements: "", location: "", city_id: "", category_id: "", type: "onsite", duration: "", salary: "", deadline: "", status: "draft" };

export default function CompanyInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const load = () => {
    setLoading(true);
    setError(null);
    internshipService.getMyInternships().then(setInternships).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    api.get("/cities").then(({ data }) => setCities(Array.isArray(data) ? data : data.data || [])).catch(() => {});
    api.get("/categories").then(({ data }) => setCategories(Array.isArray(data) ? data : data.data || [])).catch(() => {});
  }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (internship) => { setForm({ ...internship, categories: internship.categories?.map(c => c.id) || [] }); setEditing(internship); setShowModal(true); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await internshipService.update(editing.id, form);
        toast.success("Offre mise à jour !");
      } else {
        await internshipService.create(form);
        toast.success("Offre créée !");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette offre ?")) return;
    try {
      await internshipService.delete(id);
      toast.success("Offre supprimée");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-center py-12 text-danger"><p>{error}</p><button onClick={load} className="mt-4 text-primary underline cursor-pointer">Réessayer</button></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mes offres de stage</h1>
          <p className="text-text-muted text-sm">Gérez vos offres publiées</p>
        </div>
        <Button onClick={openCreate} variant="primary"><Plus size={18} />Nouvelle offre</Button>
      </div>

      {internships.length === 0 ? (
        <EmptyState icon={Plus} title="Aucune offre" description="Créez votre première offre de stage." action actionLabel="Créer une offre" onAction={openCreate} />
      ) : (
        <div className="space-y-3">
          {internships.map((internship) => {
            const stats = internship.application_stats || {};
            const rest = stats.total - (stats.high || 0) - (stats.medium || 0) - (stats.low || 0);
            return (
              <Card key={internship.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{internship.title}</h3>
                      <Badge variant={internship.status}>{internship.status === "published" ? "Publiée" : internship.status === "draft" ? "Brouillon" : internship.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-text-muted">
                      {internship.location && <span className="flex items-center gap-1"><MapPin size={14} />{internship.location}</span>}
                      <span className="flex items-center gap-1"><Clock size={14} />{internship.type === "remote" ? "Télétravail" : internship.type === "hybrid" ? "Hybride" : "Présentiel"}</span>
                      {internship.salary && <span className="flex items-center gap-1"><Euro size={14} />{internship.salary}€</span>}
                    </div>
                    {stats.total > 0 && (
                      <div className="mt-3 space-y-0.5">
                        <p className="text-sm font-semibold flex items-center gap-1.5"><Users size={15} />{stats.total} candidature{stats.total > 1 ? "s" : ""}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
                          {stats.high > 0 && <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-yellow-500" /><Star size={14} className="text-yellow-500 fill-yellow-500" /><Star size={14} className="text-yellow-500 fill-yellow-500" /><Star size={14} className="text-yellow-500 fill-yellow-500" /><Star size={14} className="text-yellow-500 fill-yellow-500" /> {stats.high} profil{stats.high > 1 ? "s" : ""} très pertinent{stats.high > 1 ? "s" : ""}</span>}
                          {stats.medium > 0 && <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-yellow-500" /><Star size={14} className="text-yellow-500 fill-yellow-500" /><Star size={14} className="text-yellow-500 fill-yellow-500" /> {stats.medium} profil{stats.medium > 1 ? "s" : ""} intéressant{stats.medium > 1 ? "s" : ""}</span>}
                          {rest > 0 && <span className="text-text-muted">Le reste: {rest}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button onClick={() => openEdit(internship)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"><Pencil size={16} className="text-text-muted" /></button>
                    <button onClick={() => handleDelete(internship.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"><Trash2 size={16} className="text-danger" /></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Modifier l'offre" : "Nouvelle offre"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="title" label="Titre" name="title" value={form.title} onChange={handleChange} required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" className="w-full h-24 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" value={form.description} onChange={handleChange} required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Prérequis</label>
            <textarea name="requirements" className="w-full h-20 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" value={form.requirements} onChange={handleChange} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="location" label="Localisation" name="location" value={form.location} onChange={handleChange} />
            <Select id="city_id" label="Ville" name="city_id" value={form.city_id} onChange={handleChange}>
              <option value="">Sélectionnez une ville</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </Select>
            <Select id="category_id" label="Catégorie" name="category_id" value={form.category_id} onChange={handleChange}>
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>
            <Select id="type" label="Type" name="type" value={form.type} onChange={handleChange}>
              <option value="onsite">Présentiel</option>
              <option value="remote">Télétravail</option>
              <option value="hybrid">Hybride</option>
            </Select>
            <Input id="duration" label="Durée" name="duration" placeholder="3 mois" value={form.duration} onChange={handleChange} />
            <Input id="salary" label="Gratification (€/mois)" name="salary" type="number" value={form.salary} onChange={handleChange} />
            <Input id="deadline" label="Date limite" name="deadline" type="date" value={form.deadline} onChange={handleChange} />
            <Select id="status" label="Statut" name="status" value={form.status} onChange={handleChange}>
              <option value="draft">Brouillon</option>
              <option value="published">Publier</option>
            </Select>
          </div>
          <Button type="submit" className="w-full" loading={saving}>{editing ? "Mettre à jour" : "Créer l'offre"}</Button>
        </form>
      </Modal>
    </div>
  );
}
