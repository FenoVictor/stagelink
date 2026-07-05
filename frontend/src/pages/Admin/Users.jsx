import { useState, useEffect } from "react";
import { Trash2, Shield } from "lucide-react";
import { adminService } from "../../services/adminService";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [role, setRole] = useState("");

  const load = () => {
    setLoading(true);
    adminService.getUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async () => {
    try {
      await adminService.updateUser(editing.id, { role });
      toast.success("Rôle mis à jour");
      setEditing(null);
      load();
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      await adminService.deleteUser(id);
      toast.success("Utilisateur supprimé");
      load();
    } catch {
      toast.error("Erreur");
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <p className="text-text-muted text-sm">Gérez les utilisateurs de la plateforme</p>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Shield} title="Aucun utilisateur" />
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-text-muted">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={user.role}>{user.role === "student" ? "Étudiant" : user.role === "company" ? "Entreprise" : "Admin"}</Badge>
                  <button onClick={() => { setEditing(user); setRole(user.role); }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"><Shield size={16} className="text-text-muted" /></button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"><Trash2 size={16} className="text-danger" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier le rôle">
        <div className="space-y-4">
          <p>Utilisateur : <strong>{editing?.name}</strong></p>
          <Select label="Nouveau rôle" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Étudiant</option>
            <option value="company">Entreprise</option>
            <option value="admin">Administrateur</option>
          </Select>
          <Button onClick={handleRoleChange} className="w-full">Mettre à jour</Button>
        </div>
      </Modal>
    </div>
  );
}
