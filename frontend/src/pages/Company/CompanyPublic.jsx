import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { MapPin, Globe, Phone, Building2, Calendar, Users, Briefcase, ArrowLeft, Clock, Euro, GraduationCap } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";

const typeLabels = { remote: "Télétravail", onsite: "Présentiel", hybrid: "Hybride" };

export default function CompanyPublic() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/companies/${id}`)
      .then(({ data }) => setCompany(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="text-center p-8">
        <p className="text-danger mb-4">{error}</p>
        <Link to="/" className="text-primary hover:underline">Retour à l'accueil</Link>
      </Card>
    </div>
  );
  if (!company) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{company.name} - StageLink</title>
        <meta name="description" content={`Découvrez ${company.name} et ses offres de stage sur StageLink.`} />
        <meta property="og:title" content={`${company.name} - StageLink`} />
        <meta property="og:description" content={`Offres de stage publiées par ${company.name} sur StageLink.`} />
        <meta property="og:type" content="profile" />
      </Helmet>
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Retour à l'accueil
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <Card className="p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
              {company.logo_url || company.logo ? (
                <img src={company.logo_url || company.logo} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted text-2xl font-bold">
                  {company.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-text-muted">
                {company.industry && <span className="flex items-center gap-1"><Building2 size={14} />{company.industry}</span>}
                {company.location && <span className="flex items-center gap-1"><MapPin size={14} />{company.location}</span>}
                {company.city && <span className="flex items-center gap-1"><MapPin size={14} />{company.city}</span>}
                {company.employees_count && <span className="flex items-center gap-1"><Users size={14} />{company.employees_count} employés</span>}
              </div>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm">
                <Globe size={16} className="text-primary shrink-0" /> {company.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 text-sm">
                <Phone size={16} className="text-primary shrink-0" /> {company.phone}
              </div>
            )}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 text-sm">
              <Calendar size={16} className="text-primary shrink-0" /> Membre depuis {new Date(company.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
            </div>
          </div>

          {company.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">À propos</h2>
              <p className="text-text leading-relaxed whitespace-pre-line">{company.description}</p>
            </div>
          )}
        </Card>

        {company.internships?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Offres de stage ({company.internships.length})</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {company.internships.map((internship) => (
                <Card key={internship.id} className="hover:border-primary/30 transition-colors">
                  <h3 className="font-semibold mb-2">{internship.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted mb-3">
                    {internship.location && <span className="flex items-center gap-0.5"><MapPin size={12} />{internship.location}</span>}
                    {internship.type && <span className="flex items-center gap-0.5"><Briefcase size={12} />{typeLabels[internship.type] || internship.type}</span>}
                    {internship.duration && <span className="flex items-center gap-0.5"><Clock size={12} />{internship.duration}</span>}
                    {internship.study_level && <span className="flex items-center gap-0.5"><GraduationCap size={12} />{internship.study_level}</span>}
                    {internship.salary && <span className="flex items-center gap-0.5"><Euro size={12} />{internship.salary}</span>}
                  </div>
                  <p className="text-sm text-text-muted line-clamp-2">{internship.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(!company.internships || company.internships.length === 0) && (
          <Card className="text-center py-12">
            <Briefcase size={40} className="mx-auto mb-3 text-text-muted/50" />
            <p className="text-text-muted">Aucune offre de stage publiée pour le moment.</p>
          </Card>
        )}

        <div className="text-center pb-8">
          <Link to="/register" className="text-sm text-primary hover:underline">
            Vous êtes {company.name} ? Créez votre compte entreprise sur StageLink
          </Link>
        </div>
      </div>
    </div>
  );
}
