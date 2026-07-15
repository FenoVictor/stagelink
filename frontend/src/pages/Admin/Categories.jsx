import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    adminService.getCategories().then(setCategories).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setName(""); setEditing(null); setShowModal(true); };
  const openEdit = (cat) => { setName(cat.name); setEditing(cat); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await adminService.updateCategory(editing.id, { name });
        toast.success("Catégorie mise à jour");
      } else {
        await adminService.createCategory({ name });
        toast.success("Catégorie créée");
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
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      await adminService.deleteCategory(id);
      toast.success("Catégorie supprimée");
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
          <h1 className="text-2xl font-bold">Catégories</h1>
          <p className="text-text-muted text-sm">Gérez les catégories d'offres</p>
        </div>
        <Button onClick={openCreate} variant="primary"><Plus size={18} />Ajouter</Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={Tag} title="Aucune catégorie" action actionLabel="Ajouter une catégorie" onAction={openCreate} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{cat.name}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"><Pencil size={14} className="text-text-muted" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"><Trash2 size={14} className="text-danger" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Modifier" : "Nouvelle catégorie"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="cat-name" label="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit" className="w-full" loading={saving}>{editing ? "Mettre à jour" : "Créer"}</Button>
        </form>
      </Modal>
    </div>
  );
}
