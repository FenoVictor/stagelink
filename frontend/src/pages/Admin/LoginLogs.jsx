import { useState, useEffect } from "react";
import {
  ScrollText,
  Search,
  Download,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Monitor,
  AlertTriangle,
  Users,
  LogIn,
  LogOut,
  Shield,
  TrendingUp,
} from "lucide-react";
import { securityService } from "../../services/securityService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function LoginLogs() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [successFilter, setSuccessFilter] = useState("");
  const [suspiciousFilter, setSuspiciousFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: 20 };
      if (search) params.search = search;
      if (successFilter) params.success = successFilter;
      if (suspiciousFilter) params.suspicious = suspiciousFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const data = await securityService.getLoginLogs(params);
      setLogs(data.data || []);
      setTotalPages(data.last_page || 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await securityService.getLoginLogStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load login log stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, successFilter, suspiciousFilter, fromDate, toDate]);

  useEffect(() => {
    fetchLogs();
  }, [page, search, successFilter, suspiciousFilter, fromDate, toDate]);

  const handleExport = async () => {
    try {
      const params = {};
      if (successFilter) params.success = successFilter;
      if (suspiciousFilter) params.suspicious = suspiciousFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const response = await securityService.exportLoginLogs(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `login_logs_${new Date().toISOString().slice(0, 10)}.csv`);
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
    setSuccessFilter("");
    setSuspiciousFilter("");
    setFromDate("");
    setToDate("");
  };

  const hasFilters = search || successFilter || suspiciousFilter || fromDate || toDate;

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
            <ScrollText className="w-6 h-6 text-primary" />
            Journal de connexions
          </h1>
          <p className="text-text-muted mt-1">
            Historique des connexions et tentatives d'accès
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

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.total ?? 0}</p>
                <p className="text-text-muted text-xs">Total</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <LogIn className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.successful ?? 0}</p>
                <p className="text-text-muted text-xs">Réussies</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.failed ?? 0}</p>
                <p className="text-text-muted text-xs">Échouées</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.suspicious ?? 0}</p>
                <p className="text-text-muted text-xs">Suspectes</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.today ?? 0}</p>
                <p className="text-text-muted text-xs">Aujourd'hui</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.success_rate ?? 0}%</p>
                <p className="text-text-muted text-xs">Taux succès</p>
              </div>
            </div>
          </Card>
        </div>
      )}

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
              value={successFilter}
              onChange={(e) => setSuccessFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous les statuts</option>
              <option value="1">Réussi</option>
              <option value="0">Échoué</option>
            </select>
            <select
              value={suspiciousFilter}
              onChange={(e) => setSuspiciousFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Toutes</option>
              <option value="1">Suspectes</option>
              <option value="0">Normales</option>
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
          icon={ScrollText}
          title="Aucune connexion"
          description="Aucun journal de connexion trouvé."
        />
      )}

      {logs.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden md:table-cell">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden lg:table-cell">IP</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden lg:table-cell">Navigateur</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Succès</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Suspect</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(log.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-text font-medium text-sm">{log.email}</p>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-sm hidden md:table-cell">
                      {log.name || "—"}
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
                      <Badge variant={log.success ? "open" : "rejected"} className="text-xs">
                        {log.success ? (
                          <><CheckCircle className="w-3 h-3 mr-1" />Oui</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" />Non</>
                        )}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {log.suspicious ? (
                        <Badge variant="draft" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Oui
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">Non</Badge>
                      )}
                    </td>
                  </tr>
                ))}
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
