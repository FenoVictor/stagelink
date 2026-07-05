import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, MapPin, Clock, Euro } from "lucide-react";
import { internshipService } from "../../services/internshipService";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

const emptyForm = { title: "", description: "", requirements: "", location: "", type: "onsite", duration: "", salary: "", deadline: "", status: "draft" };

export default function CompanyInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    internshipService.getMyInternships().then(setInternships).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (internship) => { setForm(internship); setEditing(internship); setShowModal(true); };

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
      toast.error(err.response?.data?.message || "Erreur");
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
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

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
          {internships.map((internship) => (
            <Card key={internship.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{internship.title}</h3>
                    <Badge variant={internship.status}>{internship.status === "open" ? "Publiée" : internship.status === "draft" ? "Brouillon" : internship.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-text-muted">
                    {internship.location && <span className="flex items-center gap-1"><MapPin size={14} />{internship.location}</span>}
                    <span className="flex items-center gap-1"><Clock size={14} />{internship.type}</span>
                    {internship.salary && <span className="flex items-center gap-1"><Euro size={14} />{internship.salary}€</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => openEdit(internship)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"><Pencil size={16} className="text-text-muted" /></button>
                  <button onClick={() => handleDelete(internship.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"><Trash2 size={16} className="text-danger" /></button>
                </div>
              </div>
            </Card>
          ))}
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
              <option value="open">Publier</option>
            </Select>
          </div>
          <Button type="submit" className="w-full" loading={saving}>{editing ? "Mettre à jour" : "Créer l'offre"}</Button>
        </form>
      </Modal>
    </div>
  );
}
