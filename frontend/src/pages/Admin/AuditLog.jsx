import { useState, useEffect } from "react";
import {
  Shield,
  Search,
  Download,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Monitor,
  User,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const actionLabels = {
  login: "Connexion",
  logout: "Déconnexion",
  register: "Inscription",
  login_failed: "Connexion échouée",
  password_change: "Changement mot de passe",
  password_reset_request: "Demande réinitialisation",
  password_reset: "Mot de passe réinitialisé",
  admin_user_delete: "Suppression utilisateur",
  admin_user_ban: "Bannissement",
  admin_user_unban: "Débannissement",
  admin_password_reset: "Réinitialisation (admin)",
  internship_create: "Création offre",
  internship_update: "Modification offre",
  internship_delete: "Suppression offre",
  application_status_change: "Changement statut candidature",
};

const resultVariants = {
  success: "success",
  failed: "danger",
};

const resultIcons = {
  success: CheckCircle,
  failed: XCircle,
};

export default function AuditLog() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actions, setActions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: 20 };
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      if (resultFilter) params.result = resultFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const data = await adminService.getAuditLogs(params);
      setLogs(data.data || []);
      setTotalPages(data.last_page || 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchActions = async () => {
    try {
      const data = await adminService.getAuditLogActions();
      setActions(data);
    } catch (err) {
      console.error("Failed to load actions", err);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, actionFilter, resultFilter, fromDate, toDate]);

  useEffect(() => {
    fetchLogs();
  }, [page, search, actionFilter, resultFilter, fromDate, toDate]);

  const handleExport = async () => {
    try {
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (resultFilter) params.result = resultFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const response = await adminService.exportAuditLogs(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Export téléchargé !");
    } catch (err) {
      toast.error("Erreur lors de l'export");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setActionFilter("");
    setResultFilter("");
    setFromDate("");
    setToDate("");
  };

  const hasFilters = search || actionFilter || resultFilter || fromDate || toDate;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Journal d'audit
          </h1>
          <p className="text-text-muted mt-1">
            Historique complet des actions sur la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filtres {hasFilters && `(${logs.length})`}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Toutes les actions</option>
              {actions.map((a) => (
                <option key={a} value={a}>
                  {actionLabels[a] || a}
                </option>
              ))}
            </select>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous les résultats</option>
              <option value="success">Succès</option>
              <option value="failed">Échec</option>
            </select>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Date début"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Date fin"
            />
          </div>
          {hasFilters && (
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Effacer les filtres
              </Button>
            </div>
          )}
        </Card>
      )}

      {error && (
        <Card className="p-6">
          <p className="text-red-500 text-center">{error}</p>
        </Card>
      )}

      {!loading && logs.length === 0 && !error && (
        <EmptyState
          icon={Shield}
          title="Aucune activité"
          description="Aucun journal d'audit trouvé."
        />
      )}

      {logs.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden md:table-cell">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden lg:table-cell">IP</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden lg:table-cell">Navigateur</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Résultat</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const ResultIcon = resultIcons[log.result] || Clock;
                  return (
                    <tr key={log.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(log.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                            {log.user ? (log.user.firstname?.[0] || log.user.name?.[0] || "?").toUpperCase() : "S"}
                          </div>
                          <div>
                            <p className="text-text font-medium text-sm">
                              {log.user?.name || "Système"}
                            </p>
                            {log.user?.email && (
                              <p className="text-text-muted text-xs">{log.user.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="info" className="text-xs">
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-sm max-w-[250px] truncate hidden md:table-cell">
                        {log.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-sm hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          {log.ip_address || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-sm hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5" />
                          {log.browser || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={resultVariants[log.result] || "default"} className="text-xs">
                          <ResultIcon className="w-3 h-3 mr-1" />
                          {log.result === "success" ? "Succès" : "Échec"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
