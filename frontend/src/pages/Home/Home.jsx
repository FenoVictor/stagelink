import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { internshipService } from "../../services/internshipService";
import api from "../../services/api";
import { Search, Briefcase, MapPin, Euro, Clock } from "lucide-react";
import ThemeToggle from "../../components/common/ThemeToggle";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

const features = [
  { titleKey: "home.statsTitle", descKey: "home.statsTitle" },
];

const featureData = [
  { title: "Recherche intelligente", desc: "Trouvez le stage idéal parmi des centaines d'offres." },
  { title: "CV en ligne", desc: "Créez et partagez votre profil directement depuis la plateforme." },
  { title: "Candidatures simplifiées", desc: "Postulez en un clic et suivez vos candidatures." },
  { title: "Entreprises vérifiées", desc: "Toutes les offres proviennent d'entreprises certifiées." },
  { title: "3 profils", desc: "Étudiant, Entreprise, Administrateur — une plateforme pour tous." },
  { title: "Notifications", desc: "Restez informé de vos candidatures et messages en temps réel." },
  { title: "Dashboard", desc: "Un tableau de bord complet pour suivre votre activité." },
  { title: "API REST", desc: "Architecture moderne et évolutive." },
];

export default function Home() {
  const { t } = useTranslation();
  const [internships, setInternships] = useState([]);
  const [stats, setStats] = useState({ internships: 0, students: 0, companies: 0, placement: 80 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      internshipService.getAll({ per_page: 6, sort: "created_at", order: "desc" }),
      api.get("/stats").then(({ data }) => data).catch(() => ({})),
    ])
      .then(([res, statsData]) => {
        const data = res.data?.data || res.data || [];
        setInternships(Array.isArray(data) ? data : []);
        if (statsData?.internships !== undefined) setStats(statsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const typeLabel = (type) => {
    if (type === "remote") return t("internship.typeRemote");
    if (type === "onsite") return t("internship.typeOnsite");
    if (type === "hybrid") return t("internship.typeHybrid");
    return type;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <Helmet>
        <title>StageLink - Stages & Alternances à Madagascar</title>
        <meta name="description" content="Trouvez votre prochain stage ou alternance à Madagascar. StageLink connecte étudiants et entreprises." />
        <meta property="og:title" content="StageLink - Stages & Alternances à Madagascar" />
        <meta property="og:description" content="La plateforme de mise en relation étudiants-entreprises pour les stages à Madagascar." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stagelink-ten.vercel.app/" />
        <link rel="canonical" href="https://stagelink-ten.vercel.app/" />
      </Helmet>
      <header className="border-b border-border dark:border-dark-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Briefcase size={24} /> StageLink
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <nav className="flex items-center gap-4 ml-2">
              <Link to="/login" className="text-sm text-text-muted dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text transition-colors">{t("auth.login")}</Link>
              <Link to="/register" className="text-sm px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">{t("auth.register")}</Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary/5 to-primary-bg dark:from-dark-surface dark:to-dark-bg py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 dark:text-dark-text">{t("home.hero")} <span className="text-primary">{t("home.hero").toLowerCase()}</span></h1>
          <p className="text-lg text-text-muted dark:text-dark-text-muted mb-8 max-w-2xl mx-auto">{t("home.heroSub")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors">{t("home.studentCta")}</Link>
            <Link to="/register" className="px-8 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary-bg dark:hover:bg-dark-hover transition-colors">{t("home.companyCta")}</Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-2 dark:text-dark-text">{t("home.latestOffers")}</h2>
          <p className="text-text-muted dark:text-dark-text-muted mb-8">{t("home.latestOffersSub")}</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : internships.length === 0 ? (
            <p className="text-center text-text-muted dark:text-dark-text-muted py-12">{t("home.noOffers")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {internships.map((internship) => (
                <div key={internship.id} className="border border-border dark:border-dark-border rounded-xl p-5 hover:shadow-md dark:hover:shadow-dark-border transition-shadow bg-surface dark:bg-dark-surface">
                  <h3 className="font-semibold text-base mb-1 line-clamp-1 dark:text-dark-text">{internship.title}</h3>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted mb-3">
                    {internship.company?.name ? (
                      <Link to={`/entreprise/${internship.company.id}`} className="hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                        {internship.company.name}
                      </Link>
                    ) : "Entreprise"}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted dark:text-dark-text-muted mb-3">
                    {internship.location && <span className="flex items-center gap-1"><MapPin size={12} />{internship.location}</span>}
                    {internship.type && <span className="flex items-center gap-1"><Briefcase size={12} />{typeLabel(internship.type)}</span>}
                    {internship.salary > 0 ? <span className="flex items-center gap-1"><Euro size={12} />{internship.salary}€</span> : <span className="flex items-center gap-1 text-gray-400"><Euro size={12} />{t("internship.unpaid")}</span>}
                    {internship.duration && <span className="flex items-center gap-1"><Clock size={12} />{internship.duration} {t("internship.durationUnit")}</span>}
                  </div>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted line-clamp-2 mb-4">{internship.description}</p>
                  <Link to="/register" className="text-xs font-medium text-primary hover:underline">{t("home.seeOffer")} →</Link>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/register" className="text-sm text-primary hover:underline font-medium">{t("home.viewAll")} →</Link>
          </div>
        </div>
      </section>

      <section className="bg-primary-bg dark:bg-dark-surface py-12">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: `${stats.internships}+`, label: t("stat.offers") },
            { value: `${stats.students}+`, label: t("stat.students") },
            { value: `${stats.companies}+`, label: t("stat.companies") },
            { value: `${stats.placement}%+`, label: t("stat.placement") },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-text-muted dark:text-dark-text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10 dark:text-dark-text">{t("home.statsTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureData.map((f) => (
              <div key={f.title} className="p-5 border border-border dark:border-dark-border rounded-xl bg-surface dark:bg-dark-surface">
                <h3 className="font-semibold text-sm mb-2 dark:text-dark-text">{f.title}</h3>
                <p className="text-xs text-text-muted dark:text-dark-text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary text-white py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">{t("home.readyTitle")}</h2>
          <p className="opacity-90 mb-6">{t("home.readySub")}</p>
          <Link to="/register" className="inline-block px-8 py-3 bg-white text-primary rounded-xl font-semibold hover:bg-gray-100 transition-colors">{t("home.createAccount")}</Link>
        </div>
      </section>

      <footer className="border-t border-border dark:border-dark-border py-6 text-center text-xs text-text-muted dark:text-dark-text-muted">
        © {new Date().getFullYear()} StageLink. {t("home.rights")}{" "}
        <button
          onClick={() => window.dispatchEvent(new Event("stagelink:open-feedback"))}
          className="text-primary hover:underline font-medium cursor-pointer"
        >
          💡 {t("feedback.button")}
        </button>
      </footer>
    </div>
  );
}
