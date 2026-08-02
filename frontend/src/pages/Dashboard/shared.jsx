import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, Activity, FileText, Calendar, MessageSquare, Heart } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
};

export const today = new Date().toLocaleDateString("fr-FR", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

export function StatCard({ icon: Icon, label, value, color, link }) {
  const content = (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-muted">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold">{value ?? "—"}</p>
    </Card>
  );
  if (link) return <Link to={link}>{content}</Link>;
  return content;
}

export function QuickAction({ icon: Icon, label, to }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between bg-surface border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary-bg flex items-center justify-center">
          <Icon size={18} className="text-primary" />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <ArrowRight size={18} className="text-text-muted" />
    </Link>
  );
}

export function NotificationIcon({ type }) {
  const cls = "w-9 h-9 rounded-lg flex items-center justify-center shrink-0";
  if (type === "application") return <div className={`${cls} bg-blue-100`}><FileText size={16} className="text-blue-600" /></div>;
  if (type === "interview") return <div className={`${cls} bg-purple-100`}><Calendar size={16} className="text-purple-600" /></div>;
  if (type === "message") return <div className={`${cls} bg-green-100`}><MessageSquare size={16} className="text-green-600" /></div>;
  if (type === "favorite") return <div className={`${cls} bg-red-100`}><Heart size={16} className="text-red-600" /></div>;
  return <div className={`${cls} bg-gray-100`}><Activity size={16} className="text-gray-600" /></div>;
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle size={48} className="text-danger mb-4" />
      <p className="text-danger text-lg mb-4">{message}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Réessayer</Button>}
    </div>
  );
}
