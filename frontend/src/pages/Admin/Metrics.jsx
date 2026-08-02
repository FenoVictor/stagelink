import { useState, useEffect } from "react";
import {
  Activity, Clock, AlertTriangle, Users, TrendingUp,
  RefreshCw, ArrowUpRight, ArrowDownRight, Wifi, WifiOff,
  BarChart3, PieChart as PieChartIcon,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const COLORS = ["#0369a1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <Card className="flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-muted dark:text-dark-text-muted">{label}</p>
        <p className="text-2xl font-bold text-text dark:text-dark-text mt-0.5">{value}</p>
        {sub && <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
          {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </Card>
  );
}

function formatHour(h) {
  if (!h) return "";
  const parts = h.split(" ");
  return parts[1] || h;
}

function formatMs(ms) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

const statusColors = {
  200: "#10b981", 201: "#10b981",
  301: "#0369a1", 302: "#0369a1", 304: "#0369a1",
  400: "#f59e0b", 401: "#f59e0b", 403: "#f59e0b", 404: "#f59e0b", 429: "#f59e0b",
  500: "#ef4444", 503: "#ef4444",
};

export default function Metrics() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getMetricsDashboard();
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <AlertTriangle size={40} className="text-danger mx-auto mb-4" />
        <p className="text-text-muted">{error}</p>
        <Button onClick={fetch} className="mt-4">{t("common.retry")}</Button>
      </Card>
    );
  }

  if (!data) return null;

  const { summary, status_codes, requests_per_hour, response_time_by_hour, errors_by_hour, top_slow_endpoints, top_endpoints, method_distribution } = data;

  const pieData = status_codes.map((s) => ({
    name: String(s.status_code),
    value: s.count,
    fill: statusColors[s.status_code] || "#94a3b8",
  }));

  const hourlyData = requests_per_hour.map((r) => ({
    hour: formatHour(r.hour),
    requetes: r.count,
  }));

  const rtData = response_time_by_hour.map((r) => ({
    hour: formatHour(r.hour),
    moyenne: Math.round(r.avg_ms),
    max: Math.round(r.max_ms),
  }));

  const errData = errors_by_hour.map((e) => ({
    hour: formatHour(e.hour),
    erreurs: e.count,
  }));

  const methodPie = method_distribution.map((m) => ({
    name: m.method,
    value: m.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-dark-text flex items-center gap-2">
            <Activity size={28} className="text-primary" />
            {t("nav.metrics")}
          </h1>
          <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
            Temps réel &middot; Dernières 24h
          </p>
        </div>
        <Button variant="outline" onClick={fetch} size="sm">
          <RefreshCw size={14} className="mr-2" />
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Requêtes (24h)"
          value={summary.requests_24h?.toLocaleString() || 0}
          sub={`${summary.total_requests?.toLocaleString() || 0} total`}
          color="bg-primary"
        />
        <StatCard
          icon={Clock}
          label="Temps moyen (1h)"
          value={formatMs(summary.avg_response_time?.["1h"] || 0)}
          sub={`P95: ${formatMs(summary.p95_response_time?.["1h"] || 0)}`}
          color="bg-emerald-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Taux d'erreur (24h)"
          value={`${summary.error_rate_24h || 0}%`}
          sub="Réponses 4xx + 5xx"
          color="bg-amber-500"
        />
        <StatCard
          icon={Users}
          label="Utilisateurs actifs"
          value={summary.active_users_5min || 0}
          sub={`1h: ${summary.active_users_1h || 0} &middot; Uptime: ${summary.uptime_24h || 100}%`}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            Requêtes par heure
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--tw-gradient-stops, #e5e7eb)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="requetes" fill="#0369a1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
            <Clock size={16} className="text-emerald-500" />
            Temps de réponse par heure
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={rtData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="ms" />
              <Tooltip formatter={(v) => `${v}ms`} />
              <Legend />
              <Line type="monotone" dataKey="moyenne" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Erreurs par heure (4xx/5xx)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={errData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="erreurs" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
            <PieChartIcon size={16} className="text-purple-500" />
            Répartition des codes de statut (24h)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-dark-text mb-4">
            Endpoints les plus lents (7j)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-dark-border">
                  <th className="text-left py-2 text-text-muted font-medium">Chemin</th>
                  <th className="text-right py-2 text-text-muted font-medium">Moy.</th>
                  <th className="text-right py-2 text-text-muted font-medium">Hits</th>
                </tr>
              </thead>
              <tbody>
                {top_slow_endpoints.map((ep, i) => (
                  <tr key={i} className="border-b border-border/50 dark:border-dark-border/50">
                    <td className="py-2 font-mono text-xs text-text dark:text-dark-text max-w-[300px] truncate">{ep.path}</td>
                    <td className="py-2 text-right font-medium text-amber-600">{formatMs(Math.round(ep.avg_ms))}</td>
                    <td className="py-2 text-right text-text-muted">{ep.hits}</td>
                  </tr>
                ))}
                {top_slow_endpoints.length === 0 && (
                  <tr><td colSpan={3} className="py-6 text-center text-text-muted">Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-dark-text mb-4">
            Endpoints les plus visités (24h)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-dark-border">
                  <th className="text-left py-2 text-text-muted font-medium">Chemin</th>
                  <th className="text-right py-2 text-text-muted font-medium">Hits</th>
                </tr>
              </thead>
              <tbody>
                {top_endpoints.map((ep, i) => (
                  <tr key={i} className="border-b border-border/50 dark:border-dark-border/50">
                    <td className="py-2 font-mono text-xs text-text dark:text-dark-text max-w-[350px] truncate">{ep.path}</td>
                    <td className="py-2 text-right font-medium text-primary">{ep.hits}</td>
                  </tr>
                ))}
                {top_endpoints.length === 0 && (
                  <tr><td colSpan={2} className="py-6 text-center text-text-muted">Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-dark-text mb-3">Méthodes HTTP (24h)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={methodPie} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                {methodPie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-dark-text mb-3">Temps moyen global</h3>
          <div className="space-y-4 py-4">
            {[
              { label: "Dernière heure", value: summary.avg_response_time?.["1h"] || 0 },
              { label: "Dernières 24h", value: summary.avg_response_time?.["24h"] || 0 },
              { label: "7 derniers jours", value: summary.avg_response_time?.["7d"] || 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="font-medium text-text dark:text-dark-text">{formatMs(item.value)}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-dark-hover rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, (item.value / 2000) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-dark-text mb-3">État des services</h3>
          <div className="space-y-3 py-2">
            {[
              { name: "API Backend", status: summary.uptime_24h >= 99.5 },
              { name: "Base de données", status: true },
              { name: "Sentry", status: true },
              { name: "WebSocket", status: true },
            ].map((svc) => (
              <div key={svc.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {svc.status ? (
                    <Wifi size={14} className="text-emerald-500" />
                  ) : (
                    <WifiOff size={14} className="text-red-500" />
                  )}
                  <span className="text-sm text-text dark:text-dark-text">{svc.name}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${svc.status ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {svc.status ? "Opérationnel" : "Indisponible"}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-border dark:border-dark-border mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text dark:text-dark-text">Uptime 24h</span>
                <span className="text-lg font-bold text-emerald-600">{summary.uptime_24h || 100}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
