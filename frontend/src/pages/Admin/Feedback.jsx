import { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  X,
  Star,
  Inbox,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { feedbackService } from "../../services/feedbackService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const STATUS_BADGE = {
  new: "pending",
  read: "closed",
  in_progress: "interview",
  done: "accepted",
  declined: "rejected",
};

const TYPE_ICONS = { feature: "💡", improvement: "✨", bug: "🐛", general: "💬" };

export default function AdminFeedback() {
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [detailStatus, setDetailStatus] = useState("");
  const [detailNote, setDetailNote] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await feedbackService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load feedback stats", err);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      const data = await feedbackService.getAll(params);
      setFeedbacks(data.data || []);
      setTotalPages(data.last_page || 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchList();
  }, [page, search, statusFilter, typeFilter]);

  const openDetail = (f) => {
    setSelected(f);
    setDetailStatus(f.status);
    setDetailNote(f.admin_note || "");
  };

  const saveDetail = async () => {
    setSaving(true);
    try {
      await feedbackService.update(selected.id, {
        status: detailStatus,
        admin_note: detailNote,
      });
      toast.success("Retour mis à jour !");
      setSelected(null);
      fetchList();
      fetchStats();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
  };

  const hasFilters = search || statusFilter || typeFilter;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const statCards = stats
    ? [
        { key: "total", icon: MessageSquare, color: "bg-primary/10 text-primary", value: stats.total },
        { key: "new", icon: Inbox, color: "bg-amber-500/10 text-amber-600", value: stats.by_status?.new ?? 0 },
        { key: "read", icon: Eye, color: "bg-gray-500/10 text-gray-600", value: stats.by_status?.read ?? 0 },
        { key: "in_progress", icon: Clock, color: "bg-purple-500/10 text-purple-600", value: stats.by_status?.in_progress ?? 0 },
        { key: "done", icon: CheckCircle, color: "bg-green-500/10 text-green-600", value: stats.by_status?.done ?? 0 },
        { key: "declined", icon: XCircle, color: "bg-red-500/10 text-red-600", value: stats.by_status?.declined ?? 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            {t("adminFeedback.title")}
          </h1>
          <p className="text-text-muted mt-1">{t("adminFeedback.subtitle")}</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {statCards.map((s) => (
            <Card key={s.key} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{s.value}</p>
                  <p className="text-text-muted text-xs">{t(`feedback.statuses.${s.key}`)}</p>
                </div>
              </div>
            </Card>
          ))}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text flex items-center gap-1">
                  {stats.average_rating ?? "—"}
                  {stats.rating_count > 0 && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                </p>
                <p className="text-text-muted text-xs">{t("adminFeedback.average")}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={t("adminFeedback.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t("adminFeedback.allStatuses")}</option>
            {["new", "read", "in_progress", "done", "declined"].map((s) => (
              <option key={s} value={s}>{t(`feedback.statuses.${s}`)}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t("adminFeedback.allTypes")}</option>
            {["feature", "improvement", "bug", "general"].map((tp) => (
              <option key={tp} value={tp}>{t(`feedback.types.${tp}`)}</option>
            ))}
          </select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              {t("common.cancel")}
            </Button>
          )}
        </div>
      </Card>

      {error && (
        <Card className="p-6">
          <p className="text-red-500 text-center">{error}</p>
        </Card>
      )}

      {!loading && feedbacks.length === 0 && !error && (
        <EmptyState
          icon={MessageSquare}
          title={t("adminFeedback.noResults")}
          description=""
        />
      )}

      {feedbacks.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-4 py-3 font-medium text-text-muted">{t("adminFeedback.type")}</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">{t("adminFeedback.message")}</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">{t("adminFeedback.rating")}</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden md:table-cell">{t("adminFeedback.from")}</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">{t("adminFeedback.status")}</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden lg:table-cell">{t("adminFeedback.date")}</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => openDetail(f)}
                    className="border-b border-border hover:bg-surface/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span>{TYPE_ICONS[f.type]}</span>
                        <span className="text-text font-medium">{t(`feedback.types.${f.type}`)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted max-w-xs">
                      <p className="truncate">{f.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      {f.rating ? (
                        <span className="flex items-center gap-0.5 text-yellow-500">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} size={14} fill={n <= f.rating ? "#f59e0b" : "none"} stroke="#f59e0b" />
                          ))}
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                      <span className="block font-medium text-text">{f.user?.name || f.name || "Visiteur"}</span>
                      <span className="text-xs">{f.user?.email || f.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[f.status] || "default"}>{t(`feedback.statuses.${f.status}`)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap hidden lg:table-cell">
                      {formatDate(f.created_at)}
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

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={t("adminFeedback.details")}
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                {TYPE_ICONS[selected.type]} {t(`feedback.types.${selected.type}`)}
              </span>
              <Badge variant={STATUS_BADGE[selected.status] || "default"}>
                {t(`feedback.statuses.${selected.status}`)}
              </Badge>
              {selected.rating > 0 && (
                <span className="flex items-center gap-0.5 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={16} fill={n <= selected.rating ? "#f59e0b" : "none"} stroke="#f59e0b" />
                  ))}
                </span>
              )}
            </div>

            <div>
              <p className="text-xs text-text-muted mb-1">{t("adminFeedback.from")}</p>
              <p className="text-sm font-medium text-text">
                {selected.user?.name || selected.name || "Visiteur"}
                {(selected.user?.email || selected.email) && (
                  <span className="text-text-muted font-normal"> — {selected.user?.email || selected.email}</span>
                )}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{formatDate(selected.created_at)}</p>
            </div>

            <div>
              <p className="text-xs text-text-muted mb-1">{t("adminFeedback.message")}</p>
              <p className="text-sm text-text leading-relaxed whitespace-pre-line bg-background dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg p-4">
                {selected.message}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("adminFeedback.status")}</label>
                <select
                  value={detailStatus}
                  onChange={(e) => setDetailStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {["new", "read", "in_progress", "done", "declined"].map((s) => (
                    <option key={s} value={s}>{t(`feedback.statuses.${s}`)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">{t("adminFeedback.adminNote")}</label>
              <textarea
                value={detailNote}
                onChange={(e) => setDetailNote(e.target.value)}
                rows={3}
                placeholder={t("adminFeedback.adminNotePlaceholder")}
                className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelected(null)}>{t("common.cancel")}</Button>
              <Button onClick={saveDetail} loading={saving}>{t("common.save")}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
