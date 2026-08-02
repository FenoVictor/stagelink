import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import Card from "../../components/ui/Card";

export default function AdminCharts({ stats }) {
  return (
    <>
      {stats?.monthly?.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Évolution (12 derniers mois)</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-72">
              <p className="text-sm text-text-muted mb-2">Utilisateurs & Offres</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" name="Utilisateurs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="internships" name="Offres" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-72">
              <p className="text-sm text-text-muted mb-2">Candidatures</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="applications" name="Candidatures" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}

      {stats && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Utilisateurs</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                    { name: "Étudiants", value: stats.students || 0 },
                    { name: "Entreprises", value: stats.companies || 0 },
                  ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold mb-4">Statut comptes</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                    { name: "Actifs", value: stats.active_users || 0 },
                    { name: "Inactifs", value: stats.inactive_users || 0 },
                    { name: "Bannis", value: stats.banned_users || 0 },
                  ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    <Cell fill="#22c55e" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold mb-4">Entreprises</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                    { name: "Vérifiées", value: stats.verified_companies || 0 },
                    { name: "Non vérifiées", value: (stats.companies - stats.verified_companies) || 0 },
                  ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#d1d5db" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
