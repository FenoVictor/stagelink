import { useState, useEffect } from "react";
import {
  Shield,
  Download,
  Trash2,
  Info,
  Clock,
  Database,
  FileText,
  MessageSquare,
  Bell,
  Globe,
  AlertTriangle,
  CheckCircle,
  Lock,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const retentionIcons = {
  account: Lock,
  applications: FileText,
  messages: MessageSquare,
  notifications: Bell,
  activity_logs: Database,
  files: Globe,
};

const rightsItems = [
  {
    icon: Download,
    title: "Accès",
    description: "Vous pouvez télécharger l'intégralité de vos données.",
  },
  {
    icon: FileText,
    title: "Rectification",
    description: "Vous pouvez modifier vos données via votre profil.",
  },
  {
    icon: Trash2,
    title: "Suppression",
    description: "Vous pouvez supprimer votre compte et vos données.",
  },
  {
    icon: Database,
    title: "Portabilité",
    description: "Vos données sont exportées en JSON standard.",
  },
];

export default function DataProtection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dataInfo, setDataInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteForm, setDeleteForm] = useState({ password: "", confirmation: "" });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    adminService
      .getGdprDataInfo()
      .then(setDataInfo)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await adminService.exportGdprData();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `stagelink_donnees_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Données téléchargées !");
    } catch (err) {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteForm.confirmation !== "SUPPRIMER") {
      toast.error("Tapez SUPPRIMER pour confirmer");
      return;
    }
    setDeleting(true);
    try {
      await adminService.deleteAccount(deleteForm);
      toast.success("Votre compte a été supprimé.");
      await logout();
      navigate("/");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Protection des données
        </h1>
        <p className="text-text-muted mt-1">
          Gérez vos données personnelles conformément au RGPD
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Télécharger mes données
          </h2>
          <p className="text-text-muted text-sm mb-4">
            Exportez l'intégralité de vos données personnelles au format JSON.
            Cela inclut votre profil, candidatures, messages, et historique d'activité.
          </p>
          <Button onClick={handleDownload} loading={downloading} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Télécharger mes données
          </Button>
        </Card>

        <Card className="p-6 border-red-200 dark:border-red-800">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Supprimer mon compte
          </h2>
          <p className="text-text-muted text-sm mb-4">
            La suppression de votre compte est irréversible. Toutes vos données
            personnelles seront effacées ou anonymisées.
          </p>
          <Button variant="danger" onClick={() => setDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer mon compte
          </Button>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          Conservation des données
        </h2>
        {loading ? (
          <p className="text-text-muted text-sm">Chargement...</p>
        ) : dataInfo?.retention ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(dataInfo.retention).map(([key, value]) => {
              const Icon = retentionIcons[key] || Clock;
              const labels = {
                account: "Compte",
                applications: "Candidatures",
                messages: "Messages",
                notifications: "Notifications",
                activity_logs: "Journaux d'audit",
                files: "Fichiers",
              };
              return (
                <div
                  key={key}
                  className="flex items-start gap-3 p-3 rounded-lg bg-surface/50"
                >
                  <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-text font-medium text-sm">{labels[key] || key}</p>
                    <p className="text-text-muted text-xs mt-1">{value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Vos droits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rightsItems.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 p-3 rounded-lg bg-surface/50"
            >
              <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-text font-medium text-sm">{item.title}</p>
                <p className="text-text-muted text-xs mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Supprimer mon compte">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Attention : action irréversible</p>
              <p className="mt-1">
                Votre compte et toutes vos données personnelles seront supprimés
                définitivement. Vous ne pourrez pas récupérer votre compte.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={deleteForm.password}
              onChange={(e) =>
                setDeleteForm({ ...deleteForm, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Tapez <span className="font-mono font-bold">SUPPRIMER</span> pour
              confirmer
            </label>
            <input
              type="text"
              value={deleteForm.confirmation}
              onChange={(e) =>
                setDeleteForm({ ...deleteForm, confirmation: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="SUPPRIMER"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteModal(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleteForm.confirmation !== "SUPPRIMER"}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
