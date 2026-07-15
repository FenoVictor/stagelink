import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Edit,
  Key,
  X,
  Check,
  UserCog,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

const roleTabs = [
  { key: "", label: "Tous" },
  { key: "student", label: "Étudiants" },
  { key: "company", label: "Entreprises" },
  { key: "admin", label: "Administrateurs" },
];

const roleLabels = { student: "Étudiant", company: "Entreprise", admin: "Administrateur" };
const roleVariants = { student: "student", company: "company", admin: "admin" };

import Pagination from "../../components/ui/Pagination";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editModal, setEditModal] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", phone: "", role: "" });

  const [passwordModal, setPasswordModal] = useState(null);
  const [passwordData, setPasswordData] = useState({ password: "", password_confirmation: "" });

  const [deleteModal, setDeleteModal] = useState(null);
  const [banConfirm, setBanConfirm] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers({ search, role: roleFilter, sort, order, page, per_page: 15 });
      if (data.data) {
        setUsers(data.data);
        setTotalPages(data.last_page || 1);
      } else {
        setUsers(Array.isArray(data) ? data : data.users ?? []);
        setTotalPages(1);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, sort, order, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openEdit = (user) => {
    setEditData({ name: user.name || "", email: user.email || "", phone: user.phone || "", role: user.role || "student" });
    setEditModal(user);
  };

  const handleEditSave = async () => {
    if (!editModal) return;
    setSubmitting(true);
    try {
      await adminService.updateUser(editModal.id, editData);
      toast.success("Utilisateur mis à jour");
      setEditModal(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBan = async (user) => {
    setSubmitting(true);
    try {
      await adminService.banUser(user.id);
      toast.success(`${user.name} a été banni`);
      setBanConfirm(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnban = async (user) => {
    setSubmitting(true);
    try {
      await adminService.unbanUser(user.id);
      toast.success(`${user.name} a été débanni`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!passwordModal) return;
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setSubmitting(true);
    try {
      await adminService.resetUserPassword(passwordModal.id, passwordData);
      toast.success("Mot de passe réinitialisé. L'utilisateur devra se reconnecter.");
      setPasswordModal(null);
      setPasswordData({ password: "", password_confirmation: "" });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setSubmitting(true);
    try {
      await adminService.deleteUser(deleteModal.id);
      toast.success("Utilisateur supprimé");
      setDeleteModal(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (user) => {
    if (user.role === "admin") {
      toast.error("Impossible de supprimer un administrateur");
      return;
    }
    setDeleteModal(user);
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <XCircle size={48} className="mx-auto text-danger mb-4" />
        <p className="text-danger font-medium mb-4">{error}</p>
        <Button onClick={load} variant="outline">Réessayer</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <p className="text-text-muted text-sm">Gérez tous les utilisateurs de la plateforme</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <Button type="submit" size="sm">Rechercher</Button>
        <select
          value={order === "desc" && sort === "created_at" ? "newest" : order === "asc" && sort === "created_at" ? "oldest" : order === "asc" && sort === "name" ? "name_asc" : "name_desc"}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "newest") { setSort("created_at"); setOrder("desc"); }
            else if (val === "oldest") { setSort("created_at"); setOrder("asc"); }
            else if (val === "name_asc") { setSort("name"); setOrder("asc"); }
            else if (val === "name_desc") { setSort("name"); setOrder("desc"); }
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="newest">Plus récents</option>
          <option value="oldest">Plus anciens</option>
          <option value="name_asc">Nom A-Z</option>
          <option value="name_desc">Nom Z-A</option>
        </select>
      </form>

      <div className="flex gap-1 mb-6 flex-wrap">
        {roleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setRoleFilter(tab.key); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              roleFilter === tab.key
                ? "bg-primary text-white"
                : "bg-surface text-text-muted hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Aucun utilisateur"
          description={search || roleFilter ? "Essayez de modifier vos filtres" : "Aucun utilisateur inscrit pour le moment"}
        />
      ) : (
        <>
          <div className="space-y-3">
            {users.map((user) => (
            <Card key={user.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold truncate">{user.name}</h3>
                    {user.is_banned || user.banned_at ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-danger bg-red-50 px-2 py-0.5 rounded-full">
                        <Ban size={12} /> Banni
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Mail size={14} /> {user.email}
                    </span>
                    {user.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={14} /> {user.phone}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={14} /> Inscrit le {formatDate(user.created_at)}
                    </span>
                    <Badge variant={roleVariants[user.role]}>{roleLabels[user.role] || user.role}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {user.is_banned || user.banned_at ? (
                    <button
                      onClick={() => handleUnban(user)}
                      disabled={submitting}
                      className="p-2 rounded-lg hover:bg-green-50 transition-colors cursor-pointer disabled:opacity-50"
                      title="Débannir"
                    >
                      <CheckCircle size={18} className="text-green-600" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setBanConfirm(user)}
                      disabled={submitting}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                      title="Bannir"
                    >
                      <Ban size={18} className="text-danger" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(user)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Modifier"
                  >
                    <Edit size={18} className="text-text-muted" />
                  </button>
                  <button
                    onClick={() => { setPasswordModal(user); setPasswordData({ password: "", password_confirmation: "" }); }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Réinitialiser le mot de passe"
                  >
                    <Key size={18} className="text-text-muted" />
                  </button>
                  <button
                    onClick={() => confirmDelete(user)}
                    disabled={submitting}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                    title="Supprimer"
                  >
                    <Trash2 size={18} className="text-danger" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </> )}

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Modifier l'utilisateur">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Nom</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Email</label>
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Téléphone</label>
            <input
              type="text"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Rôle</label>
            <select
              value={editData.role}
              onChange={(e) => setEditData({ ...editData, role: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="student">Étudiant</option>
              <option value="company">Entreprise</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditModal(null)} className="flex-1">Annuler</Button>
            <Button onClick={handleEditSave} loading={submitting} className="flex-1">Enregistrer</Button>
          </div>
        </div>
      </Modal>

      {/* Password Reset Modal */}
      <Modal open={!!passwordModal} onClose={() => setPasswordModal(null)} title="Réinitialiser le mot de passe">
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Nouveau mot de passe pour <strong>{passwordModal?.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={passwordData.password}
              onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Minimum 8 caractères"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              value={passwordData.password_confirmation}
              onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Retaper le mot de passe"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setPasswordModal(null)} className="flex-1">Annuler</Button>
            <Button onClick={handlePasswordReset} loading={submitting} className="flex-1">Réinitialiser</Button>
          </div>
        </div>
      </Modal>

      {/* Ban Confirmation Modal */}
      <Modal open={!!banConfirm} onClose={() => setBanConfirm(null)} title="Confirmer le bannissement" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Êtes-vous sûr de vouloir bannir <strong>{banConfirm?.name}</strong> ?<br />
            L'utilisateur ne pourra plus se connecter.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setBanConfirm(null)} className="flex-1">Annuler</Button>
            <Button variant="danger" onClick={() => handleBan(banConfirm)} loading={submitting} className="flex-1">Bannir</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Confirmer la suppression" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Êtes-vous sûr de vouloir supprimer <strong>{deleteModal?.name}</strong> ?<br />
            Cette action est irréversible.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteModal(null)} className="flex-1">Annuler</Button>
            <Button variant="danger" onClick={handleDelete} loading={submitting} className="flex-1">Supprimer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
