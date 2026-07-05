import { Link } from "react-router-dom";
import { Briefcase, GraduationCap, Building2, Search, FileText, Shield } from "lucide-react";
import Button from "../../components/ui/Button";

const features = [
  { icon: Search, title: "Trouvez le stage idéal", desc: "Parcourez des offres de stage dans toute la France, filtrées par domaine, durée et localisation." },
  { icon: FileText, title: "Candidatures simplifiées", desc: "Postulez en un clic avec votre profil et suivez l'état de vos candidatures en temps réel." },
  { icon: Building2, title: "Pour les entreprises", desc: "Publiez vos offres et recevez des candidatures qualifiées de la part d'étudiants motivés." },
  { icon: Shield, title: "Plateforme sécurisée", desc: "Profils vérifiés, échanges sécurisés et suivi transparent de chaque candidature." },
];

const stats = [
  { value: "500+", label: "Offres de stage" },
  { value: "2000+", label: "Étudiants actifs" },
  { value: "300+", label: "Entreprises partenaires" },
  { value: "85%", label: "Taux de satisfaction" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary font-heading">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0369A1"/>
              <path d="M16 8L24 14V24H8V14L16 8Z" fill="white" opacity="0.9"/>
              <path d="M16 12L20 15V20H12V15L16 12Z" fill="#0EA5E9"/>
            </svg>
            StageLink
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">S'inscrire</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-bg rounded-full text-sm font-medium text-primary mb-6">
            <GraduationCap size={16} />
            La plateforme de stages connectée
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold font-heading text-text leading-tight mb-6">
            Le stage qui vous correspond,{" "}
            <span className="text-primary">à portée de clic</span>
          </h1>
          <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
            StageLink connecte les étudiants avec les entreprises qui recrutent. 
            Trouvez le stage idéal ou recrutez les talents de demain.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="cta" size="lg">
                <GraduationCap size={20} />
                Je suis étudiant
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">
                <Building2 size={20} />
                Je suis une entreprise
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-primary-bg py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Pourquoi StageLink ?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-primary-bg flex items-center justify-center mx-auto mb-4">
                <f.icon size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Rejoignez des milliers d'étudiants et d'entreprises qui utilisent déjà StageLink.
          </p>
          <Link to="/register">
            <Button variant="cta" size="lg">Créer un compte gratuit</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-text-muted">
          <p className="font-semibold text-primary mb-1">StageLink</p>
          <p>&copy; {new Date().getFullYear()} StageLink. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
