import { useState, useEffect } from "react";
import { studentService } from "../../services/studentService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";

export default function DisplayProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    studentService.getProfile()
      .then((data) => setProfile(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-center py-12 text-danger"><p>{error}</p></div>;
  if (!profile) return null;

  const genderLabel = { male: "Homme", female: "Femme", other: "Autre" };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
              {profile.photo ? (
                <img src={profile.photo} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">Photo</div>
              )}
            </div>
            <div>
              <p className="text-lg font-semibold">{profile.firstname} {profile.lastname}</p>
              <p className="text-sm text-text-muted">{profile.email}</p>
            </div>
          </div>

          <hr className="border-border" />

          {profile.phone && <InfoRow label="Téléphone" value={profile.phone} />}
          {profile.birth_date && <InfoRow label="Date de naissance" value={profile.birth_date} />}
          {profile.gender && <InfoRow label="Genre" value={genderLabel[profile.gender] || profile.gender} />}
          {profile.city?.name && <InfoRow label="Ville" value={profile.city.name} />}
          {profile.address && <InfoRow label="Adresse" value={profile.address} />}
          {profile.bio && <InfoRow label="Bio" value={profile.bio} />}

          <hr className="border-border" />

          {profile.school && <InfoRow label="École" value={profile.school} />}
          {profile.major && <InfoRow label="Filière" value={profile.major} />}
          {profile.graduation_year && <InfoRow label="Année d'obtention" value={profile.graduation_year} />}

          {profile.skills && profile.skills.length > 0 && (
            <>
              <hr className="border-border" />
              <h3 className="font-semibold">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                    {skill.name}{skill.level ? ` — ${skill.level}` : ""}
                  </span>
                ))}
              </div>
            </>
          )}

          <hr className="border-border" />
          <h3 className="font-semibold">Liens</h3>
          <div className="space-y-1">
            {profile.github && <LinkRow label="GitHub" url={profile.github} />}
            {profile.portfolio && <LinkRow label="Portfolio" url={profile.portfolio} />}
            {profile.linkedin && <LinkRow label="LinkedIn" url={profile.linkedin} />}
          </div>

          {profile.cv_path && (
            <>
              <hr className="border-border" />
              <a href={profile.cv_path} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium">
                Télécharger le CV
              </a>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function LinkRow({ label, url }) {
  const href = url.startsWith("http") ? url : `https://${url}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block">
      {label}
    </a>
  );
}
