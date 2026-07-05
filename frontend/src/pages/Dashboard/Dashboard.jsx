import { useAuth } from "../../context/AuthContext";
import { Briefcase, FileText, Building2, Users } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const dashboards = {
    student: {
      title: "Tableau de bord étudiant",
      cards: [
        { icon: Briefcase, label: "Offres disponibles", value: "—", color: "text-primary bg-primary-bg" },
        { icon: FileText, label: "Mes candidatures", value: "—", color: "text-cta bg-green-50" },
        { icon: Building2, label: "Entreprises actives", value: "—", color: "text-purple-600 bg-purple-50" },
      ],
      welcome: `Bonjour ${user.name}, prêt à trouver votre stage ?`,
    },
    company: {
      title: "Tableau de bord entreprise",
      cards: [
        { icon: Briefcase, label: "Mes offres", value: "—", color: "text-primary bg-primary-bg" },
        { icon: FileText, label: "Candidatures reçues", value: "—", color: "text-cta bg-green-50" },
        { icon: Users, label: "Étudiants", value: "—", color: "text-purple-600 bg-purple-50" },
      ],
      welcome: `Bonjour ${user.name}, gérez vos offres de stage.`,
    },
    admin: {
      title: "Administration",
      cards: [
        { icon: Users, label: "Utilisateurs", value: "—", color: "text-primary bg-primary-bg" },
        { icon: Briefcase, label: "Offres", value: "—", color: "text-cta bg-green-50" },
        { icon: FileText, label: "Candidatures", value: "—", color: "text-purple-600 bg-purple-50" },
      ],
      welcome: `Bonjour ${user.name}, bienvenue sur l'administration.`,
    },
  };

  const data = dashboards[user.role] || dashboards.student;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
      <p className="text-text-muted mb-6">{data.welcome}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.cards.map((card) => (
          <div key={card.label} className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-muted">{card.label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
