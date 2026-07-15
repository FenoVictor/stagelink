import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentService } from "../../services/studentService";
import { getErrorMessage } from "../../services/api";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, GraduationCap, Globe, BookOpen, ExternalLink, Download, MessageSquare } from "lucide-react";
import Card from "../../components/ui/Card";
import { conversationService } from "../../services/conversationService";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const levelColors = {
  "Débutant": "bg-green-100 text-green-700",
  "Intermédiaire": "bg-blue-100 text-blue-700",
  "Avancé": "bg-purple-100 text-purple-700",
  "Expert": "bg-orange-100 text-orange-700",
};

const genderLabels = { male: "Homme", female: "Femme", other: "Autre" };

export default function StudentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    studentService.getPublicProfile(id)
      .then((data) => setProfile(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const startConversation = async () => {
    if (!profile) return;
    setMessaging(true);
    try {
      const res = await conversationService.start({
        recipient_id: profile.user_id || id,
        message: `Bonjour ${profile.firstname || ""}, je suis intéressé par votre profil. Souhaitons-nous échanger ?`,
      });
      const convId = res.conversation?.id || res.id;
      if (convId) navigate(`/company/messages/${convId}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMessaging(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-center py-12 text-danger"><p>{error}</p><button onClick={() => { setLoading(true); setError(null); studentService.getPublicProfile(id).then(setProfile).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false)); }} className="mt-4 text-primary underline cursor-pointer">Réessayer</button></div>;
  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} /> Retour
      </button>

      {/* Carte principale */}
      <Card className="mb-6">
        <div className="flex items-start gap-5">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt="Photo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">Photo</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">
              {profile.firstname || profile.lastname ? `${profile.firstname || ""} ${profile.lastname || ""}`.trim() : "Étudiant"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-muted">
              {profile.email && (
                <span className="flex items-center gap-1.5"><Mail size={14} />{profile.email}</span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1.5"><Phone size={14} />{profile.phone}</span>
              )}
              {profile.city && (
                <span className="flex items-center gap-1.5"><MapPin size={14} />{profile.city}</span>
              )}
            </div>
          </div>
          <button
            onClick={startConversation}
            disabled={messaging}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
          >
            <MessageSquare size={16} />
            {messaging ? "..." : "Contacter"}
          </button>
        </div>
      </Card>

      {/* Présentation */}
      {profile.bio && (
        <Card className="mb-6">
          <h2 className="font-semibold text-lg mb-3">Présentation</h2>
          <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
        </Card>
      )}

      {/* Informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <h2 className="font-semibold text-lg mb-4">Informations</h2>
          <div className="space-y-3">
            {profile.gender && (
              <InfoItem icon={BookOpen} label="Genre" value={genderLabels[profile.gender] || profile.gender} />
            )}
            {profile.birth_date && (
              <InfoItem icon={Calendar} label="Date de naissance" value={profile.birth_date} />
            )}
            {profile.address && (
              <InfoItem icon={MapPin} label="Adresse" value={profile.address} />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-lg mb-4">Formation</h2>
          <div className="space-y-3">
            {profile.school && <InfoItem icon={GraduationCap} label="Université" value={profile.school} />}
            {profile.major && <InfoItem icon={BookOpen} label="Filière" value={profile.major} />}
            {profile.graduation_year && <InfoItem icon={Calendar} label="Année" value={String(profile.graduation_year)} />}
          </div>
        </Card>
      </div>

      {/* Compétences */}
      {profile.skills && profile.skills.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-semibold text-lg mb-4">Compétences</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
                <span className="font-medium">{skill.name}</span>
                {skill.level && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${levelColors[skill.level] || "bg-gray-200 text-gray-600"}`}>
                    {skill.level}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Langues */}
      {profile.languages && profile.languages.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-semibold text-lg mb-4">Langues</h2>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang, i) => (
              <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                {lang.name} <span className="text-xs opacity-70">({lang.level})</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Liens et CV */}
      <Card className="mb-6">
        <h2 className="font-semibold text-lg mb-4">Liens</h2>
        <div className="space-y-3">
          {profile.github && (
            <a href={profile.github.startsWith("http") ? profile.github : `https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ExternalLink size={14} /> GitHub
            </a>
          )}
          {profile.linkedin && (
            <a href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ExternalLink size={14} /> LinkedIn
            </a>
          )}
          {profile.portfolio && (
            <a href={profile.portfolio.startsWith("http") ? profile.portfolio : `https://${profile.portfolio}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ExternalLink size={14} /> Portfolio
            </a>
          )}
          {profile.cv_url && (
            <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium mt-2">
              <Download size={16} /> Télécharger le CV
            </a>
          )}
        </div>
      </Card>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-5 h-5 flex items-center justify-center text-text-muted">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}
