import { useState, useEffect, useRef, useCallback } from "react";
import { studentService } from "../../services/studentService";
import { getSkills } from "../../services/skillService";
import { getErrorMessage } from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import LocationSelector from "../../components/ui/LocationSelector";
import PasswordChange from "../../components/ui/PasswordChange";
import { Camera, X, Plus, Upload, FileText, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const levelOptions = [
  { value: "Débutant", label: "Débutant" },
  { value: "Intermédiaire", label: "Intermédiaire" },
  { value: "Avancé", label: "Avancé" },
  { value: "Expert", label: "Expert" },
];

const currentLevelOptions = [
  { value: "L1", label: "L1" },
  { value: "L2", label: "L2" },
  { value: "L3", label: "L3" },
  { value: "M1", label: "M1" },
  { value: "M2", label: "M2" },
];

const languageLevels = [
  { value: "A1 - Débutant", label: "A1 - Débutant" },
  { value: "A2 - Élémentaire", label: "A2 - Élémentaire" },
  { value: "B1 - Intermédiaire", label: "B1 - Intermédiaire" },
  { value: "B2 - Courant", label: "B2 - Courant" },
  { value: "C1 - Avancé", label: "C1 - Avancé" },
  { value: "C2 - Bilingue", label: "C2 - Bilingue" },
  { value: "Natif", label: "Natif" },
];

const genderOptions = [
  { value: "male", label: "Homme" },
  { value: "female", label: "Femme" },
  { value: "other", label: "Autre" },
];

const MAX_PHOTO_DIM = 500;
const PHOTO_QUALITY = 0.8;

function computeReadiness({ photo_url, bio, school, diploma, current_level, cv_path, phone, github, linkedin, portfolio, commune_id, address, skills, languages, birth_date, gender }) {
  const skillCount = skills?.length || 0;
  const langCount = languages?.length || 0;

  const weights = {
    photo: 10, bio: 10, formation: 15, skills: 15, cv: 10,
    phone: 5, github: 5, linkedin: 5, portfolio: 5,
    location: 10, languages: 5, identity: 5,
  };

  let score = 0;
  const points = [];
  const improvements = [];

  if (photo_url) { score += weights.photo; points.push("Photo de profil"); }
  else improvements.push("Ajouter une photo professionnelle");

  if (bio?.trim()) { score += weights.bio; points.push("Bio renseignée"); }
  else improvements.push("Ajouter une bio");

  let formationOk = false;
  if (school?.trim()) { score += 5; formationOk = true; }
  if (diploma?.trim()) { score += 5; formationOk = true; }
  if (current_level?.trim()) { score += 5; formationOk = true; }
  if (formationOk) points.push("Formation renseignée");
  else improvements.push("Renseigner votre formation");

  const skillScore = Math.min(skillCount, 3) / 3 * weights.skills;
  score += skillScore;
  if (skillCount >= 3) points.push(`${skillCount} compétences`);
  else if (skillCount > 0) points.push(`${skillCount} compétence${skillCount > 1 ? "s" : ""}`);
  else improvements.push("Ajouter des compétences");
  if (skillCount > 0 && skillCount < 3) improvements.push("Ajouter au moins 3 compétences");

  if (cv_path) { score += weights.cv; points.push("CV ajouté"); }
  else improvements.push("Ajouter un CV");

  if (phone?.trim()) score += weights.phone;
  if (github?.trim()) { score += weights.github; points.push("GitHub"); }
  if (linkedin?.trim()) { score += weights.linkedin; points.push("LinkedIn"); }
  if (portfolio?.trim()) { score += weights.portfolio; points.push("Portfolio"); }
  const hasAnyLink = github?.trim() || linkedin?.trim() || portfolio?.trim();
  if (!hasAnyLink) improvements.push("Ajouter un lien (GitHub, LinkedIn ou Portfolio)");

  if (commune_id) { score += 5; points.push("Localisation"); }
  else improvements.push("Renseigner votre localisation");
  if (address?.trim()) { score += 5; }

  if (langCount >= 1) { score += weights.languages; points.push("Langues"); }
  else improvements.push("Ajouter une langue");

  if (birth_date) score += 2.5;
  if (gender) score += 2.5;
  if (birth_date && gender) points.push("Informations personnelles");
  else if (!birth_date || !gender) improvements.push("Compléter vos informations personnelles");

  const finalScore = Math.round(Math.min(score, 100));

  const tip = (() => {
    if (!photo_url) return { icon: "📸", title: "Photo professionnelle", text: "Les profils avec photo reçoivent 7× plus de consultations. Ajoutez une photo professionnelle pour augmenter vos chances." };
    if (!cv_path) return { icon: "📄", title: "Curriculum Vitae", text: "Les recruteurs consultent systématiquement le CV. Téléchargez le vôtre pour postuler efficacement." };
    if (skillCount < 3) return { icon: "🎯", title: "Compétences", text: "Ajoutez au moins 3 compétences pour apparaître dans les recherches des entreprises." };
    if (!github?.trim()) return { icon: "💻", title: "GitHub", text: "Les entreprises recherchent souvent des étudiants avec GitHub. Ajoutez votre profil pour améliorer votre visibilité." };
    if (!bio?.trim()) return { icon: "✍️", title: "Bio", text: "Une bonne présentation personnelle fait la différence. Parlez de vos objectifs et de ce qui vous motive." };
    if (!linkedin?.trim()) return { icon: "🔗", title: "LinkedIn", text: "LinkedIn est le réseau professionnel incontournable. Ajoutez votre profil pour étendre votre réseau." };
    if (!portfolio?.trim()) return { icon: "🌐", title: "Portfolio", text: "Un portfolio démontre concrètement vos réalisations. Partagez le vôtre pour vous démarquer." };
    if (!school?.trim()) return { icon: "🎓", title: "Formation", text: "Renseignez votre établissement pour que les entreprises puissent vérifier votre parcours." };
    if (!commune_id) return { icon: "📍", title: "Localisation", text: "Ajoutez votre localisation pour trouver des stages près de chez vous." };
    return null;
  })();

  return { score: finalScore, points, improvements, tip };
}

function compressAndCropImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      const canvas = document.createElement("canvas");
      const dim = Math.min(MAX_PHOTO_DIM, size);
      canvas.width = dim;
      canvas.height = dim;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, size, size, 0, 0, dim, dim);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Échec de la compression"));
          const processed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
            type: "image/jpeg",
          });
          resolve(processed);
        },
        "image/jpeg",
        PHOTO_QUALITY
      );
    };
    img.onerror = () => reject(new Error("Impossible de lire l'image"));
    img.src = URL.createObjectURL(file);
  });
}

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    firstname: "", lastname: "", email: "",
    phone: "", bio: "", school: "", major: "", graduation_year: "",
    diploma: "", current_level: "", study_start: "", study_end: "",
    github: "", portfolio: "", linkedin: "", photo: null, cv: null,
    birth_date: "", gender: "", city_id: "", commune_id: "", neighborhood_id: "", address: "",
  });
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [newLang, setNewLang] = useState({ name: "", level: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [cvFileName, setCvFileName] = useState("");
  const [cvUploadedAt, setCvUploadedAt] = useState(null);
  const [photoModal, setPhotoModal] = useState(null);
  const [removePhotoFlag, setRemovePhotoFlag] = useState(false);
  const [readiness, setReadiness] = useState({ score: 0, points: [], improvements: [], tip: null });
  const photoInputRef = useRef(null);
  const skillRef = useRef(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  useEffect(() => {
    Promise.all([
      studentService.getProfile(),
      getSkills().then((res) => setAllSkills(Array.isArray(res) ? res : res.data || [])),
    ])
      .then(([data]) => {
        if (data) {
          setProfile((p) => ({
            ...p,
            ...data,
            photo: null,
            cv: null,
          }));
          if (data.photo_url) setPreview(data.photo_url);
          if (data.cv_path) setCvFileName(data.cv_path.split("/").pop());
          if (data.cv_uploaded_at) setCvUploadedAt(data.cv_uploaded_at);
          if (data.skills) setSkills(data.skills);
          if (data.languages) setLanguages(Array.isArray(data.languages) ? data.languages : []);
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setReadiness(computeReadiness({
      photo_url: preview,
      bio: profile.bio,
      school: profile.school,
      diploma: profile.diploma,
      current_level: profile.current_level,
      cv_path: cvFileName ? "exists" : null,
      phone: profile.phone,
      github: profile.github,
      linkedin: profile.linkedin,
      portfolio: profile.portfolio,
      commune_id: profile.commune_id,
      address: profile.address,
      skills,
      languages,
      birth_date: profile.birth_date,
      gender: profile.gender,
    }));
  }, [preview, profile.bio, profile.school, profile.diploma, profile.current_level, profile.phone, profile.github, profile.linkedin, profile.portfolio, profile.commune_id, profile.address, profile.birth_date, profile.gender, cvFileName, skills, languages]);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoModal(URL.createObjectURL(file));
    setRemovePhotoFlag(false);
    if (e.target) e.target.value = "";
  };

  const confirmPhoto = async () => {
    if (!photoModal) return;
    try {
      const blob = await fetch(photoModal).then((r) => r.blob());
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      const compressed = await compressAndCropImage(file);
      setProfile({ ...profile, photo: compressed });
      setPreview(URL.createObjectURL(compressed));
      setPhotoModal(null);
    } catch {
      toast.error("Erreur lors du traitement de l'image");
    }
  };

  const cancelPhoto = () => {
    setPhotoModal(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const removePhoto = () => {
    setPreview(null);
    setProfile({ ...profile, photo: null });
    setRemovePhotoFlag(true);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (e.target.name === "cv") {
      setProfile({ ...profile, cv: file });
      setCvFileName(file.name);
    }
  };

  const addSkill = (skill) => {
    if (skills.find((s) => s.id === skill.id)) return;
    setSkills([...skills, { id: skill.id, name: skill.name, level: "Intermédiaire" }]);
    setSkillQuery("");
    setShowSkillDropdown(false);
  };

  const removeSkill = (id) => setSkills(skills.filter((s) => s.id !== id));

  const cycleSkillLevel = (id) => {
    const idx = levelOptions.findIndex((o) => o.value === skills.find((s) => s.id === id)?.level);
    const next = levelOptions[(idx + 1) % levelOptions.length].value;
    setSkills(skills.map((s) => (s.id === id ? { ...s, level: next } : s)));
  };

  const filteredSkills = allSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(skillQuery.toLowerCase()) &&
      !skills.find((sk) => sk.id === s.id)
  );

  const addLanguage = () => {
    if (!newLang.name.trim() || !newLang.level) return;
    setLanguages([...languages, { ...newLang }]);
    setNewLang({ name: "", level: "" });
  };

  const removeLanguage = (idx) => setLanguages(languages.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, val]) => {
        if (val !== null && val !== undefined && !["created_at", "updated_at", "id", "user_id", "photo_url", "cv_url", "city", "commune", "neighborhood", "skills", "languages"].includes(key)) {
          formData.append(key, val);
        }
      });
      if (removePhotoFlag) formData.append("remove_photo", "1");
      formData.append("languages", JSON.stringify(languages));
      skills.forEach((s, i) => {
        formData.append(`skills[${i}][id]`, s.id);
        formData.append(`skills[${i}][level]`, s.level || "");
      });
      await studentService.updateProfile(formData);
      toast.success("Profil mis à jour !");
      const updated = await studentService.getProfile();
      if (updated) {
        setProfile((p) => ({ ...p, ...updated, photo: null, cv: null }));
        if (updated.photo_url) setPreview(updated.photo_url);
        else setPreview(null);
        if (updated.cv_path) setCvFileName(updated.cv_path.split("/").pop());
        else setCvFileName("");
        if (updated.cv_uploaded_at) setCvUploadedAt(updated.cv_uploaded_at);
        else setCvUploadedAt(null);
        if (updated.skills) setSkills(updated.skills);
        if (updated.languages) setLanguages(Array.isArray(updated.languages) ? updated.languages : []);
        setRemovePhotoFlag(false);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-center py-12 text-danger"><p>{error}</p><button onClick={() => { setLoading(true); setError(null); studentService.getProfile().then((data) => { if (data) setProfile((p) => ({ ...p, ...data })); }).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false)); }} className="mt-4 text-primary underline cursor-pointer">Réessayer</button></div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>

      {/* Photo modal */}
      {photoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={cancelPhoto}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Aperçu de la photo</h3>
            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-gray-100">
              <img src={photoModal} alt="Aperçu" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-text-muted text-center mt-2">Recadrage carré automatique</p>
            <div className="flex gap-3 mt-6 justify-center">
              <button type="button" onClick={cancelPhoto} className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">Annuler</button>
              <button type="button" onClick={confirmPhoto} className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer">Valider</button>
            </div>
          </div>
        </div>
      )}

      {/* Photo */}
      <Card className="mb-6">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 group">
            {preview ? (
              <img src={preview} alt="Photo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted"><Camera size={32} /></div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
              <Camera size={20} className="text-white" />
              <input ref={photoInputRef} type="file" name="photo" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-lg font-semibold">{profile.firstname || profile.lastname ? `${profile.firstname || ""} ${profile.lastname || ""}`.trim() : "Votre nom"}</p>
            <p className="text-sm text-text-muted">{profile.email}</p>
            <div className="flex gap-3 mt-2">
              <label className="text-xs text-primary hover:underline cursor-pointer font-medium">
                Changer
                <input ref={photoInputRef} type="file" name="photo" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
              </label>
              {preview && (
                <button type="button" onClick={removePhoto} className="text-xs text-danger hover:underline cursor-pointer font-medium">Supprimer</button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Score de préparation */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <h2 className="font-semibold text-lg">🎯 Votre préparation stage</h2>
          <span className="text-2xl font-bold text-primary">{readiness.score}<span className="text-base font-normal text-text-muted">/100</span></span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${readiness.score}%`,
              background: readiness.score >= 80 ? "var(--color-success, #22c55e)" : readiness.score >= 50 ? "var(--color-primary, #3b82f6)" : "var(--color-warning, #f59e0b)",
            }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Points forts</p>
            {readiness.points.length > 0 ? (
              <ul className="space-y-1">
                {readiness.points.map((p, i) => (
                  <li key={i} className="text-sm text-success flex items-center gap-1.5">✔ {p}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted">Commencez à remplir votre profil</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">À améliorer</p>
            {readiness.improvements.length > 0 ? (
              <ul className="space-y-1">
                {readiness.improvements.map((imp, i) => (
                  <li key={i} className="text-sm text-danger flex items-center gap-1.5">❌ {imp}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-success">Profil complet ! 🎉</p>
            )}
          </div>
        </div>
      </Card>

      {/* Conseil StageLink */}
      {readiness.tip && (
        <Card className="mb-6 border-l-4 border-l-primary">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{readiness.tip.icon}</span>
            <div>
              <p className="font-semibold text-sm mb-1">💡 Conseil StageLink — {readiness.tip.title}</p>
              <p className="text-sm text-text-muted">{readiness.tip.text}</p>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations personnelles */}
        <Card>
          <h2 className="font-semibold text-lg mb-4">Informations personnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="firstname" label="Prénom" name="firstname" value={profile.firstname || ""} onChange={handleChange} />
            <Input id="lastname" label="Nom" name="lastname" value={profile.lastname || ""} onChange={handleChange} />
            <Input id="phone" label="Téléphone" name="phone" value={profile.phone || ""} onChange={handleChange} />
            <Input id="birth_date" label="Date de naissance" name="birth_date" type="date" value={profile.birth_date || ""} onChange={handleChange} />
            <Select id="gender" label="Genre" name="gender" value={profile.gender || ""} onChange={handleChange}>
              <option value="">— Non précisé —</option>
              {genderOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
        </Card>

        {/* Localisation */}
        <Card>
          <h2 className="font-semibold text-lg mb-4">Localisation</h2>
          <LocationSelector
            communeId={profile.commune_id}
            neighborhoodId={profile.neighborhood_id}
            onChange={({ commune_id, neighborhood_id }) => setProfile((p) => ({ ...p, commune_id, neighborhood_id }))}
          />
          <div className="mt-4 space-y-1.5">
            <label className="block text-sm font-medium">Adresse</label>
            <textarea
              name="address"
              className="w-full h-20 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
              value={profile.address || ""}
              onChange={handleChange}
              placeholder="Votre adresse..."
            />
          </div>
        </Card>

        {/* Formation */}
        <Card>
          <h2 className="font-semibold text-lg mb-4">Formation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="school" label="Établissement" name="school" value={profile.school || ""} onChange={handleChange} placeholder="Ex: Université de Toliara" />
            <Input id="diploma" label="Diplôme" name="diploma" value={profile.diploma || ""} onChange={handleChange} placeholder="Ex: Licence Informatique" />
            <Select id="current_level" label="Niveau actuel" name="current_level" value={profile.current_level || ""} onChange={handleChange}>
              <option value="">— Sélectionner —</option>
              {currentLevelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
            <Input id="study_start" label="Début" name="study_start" type="number" value={profile.study_start || ""} onChange={handleChange} placeholder="Ex: 2024" />
            <Input id="study_end" label="Fin prévue" name="study_end" type="number" value={profile.study_end || ""} onChange={handleChange} placeholder="Ex: 2027" />
          </div>
        </Card>

        {/* Compétences */}
        <Card>
          <h2 className="font-semibold text-lg mb-4">Compétences</h2>
          <div className="relative" ref={skillRef}>
            <input
              type="text"
              placeholder="Rechercher une compétence..."
              value={skillQuery}
              onChange={(e) => { setSkillQuery(e.target.value); setShowSkillDropdown(true); }}
              onFocus={() => setShowSkillDropdown(true)}
              className="w-full px-4 py-2.5 text-sm bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors"
            />
            {showSkillDropdown && skillQuery && filteredSkills.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredSkills.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-primary-bg transition-colors cursor-pointer"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s.id}
                  onClick={() => cycleSkillLevel(s.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm cursor-pointer hover:bg-primary/20 transition-colors group"
                  title={`Niveau : ${s.level} — Cliquez pour changer`}
                >
                  {s.name}
                  <span className="text-[10px] opacity-60 ml-0.5">{s.level.charAt(0)}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeSkill(s.id); }}
                    className="ml-0.5 hover:text-danger transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Langues */}
        <Card>
          <h2 className="font-semibold text-lg mb-4">Langues</h2>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input id="lang_name" label="Langue" value={newLang.name} onChange={(e) => setNewLang({ ...newLang, name: e.target.value })} placeholder="Ex: Anglais" />
            </div>
            <div className="w-44">
              <Select label="Niveau" value={newLang.level} onChange={(e) => setNewLang({ ...newLang, level: e.target.value })}>
                <option value="">— Niveau —</option>
                {languageLevels.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
            <button type="button" onClick={addLanguage} disabled={!newLang.name.trim() || !newLang.level} className="mb-0.5 w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              <Plus size={18} />
            </button>
          </div>
          {languages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {languages.map((lang, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                  {lang.name}
                  <span className="text-xs opacity-70">({lang.level})</span>
                  <button type="button" onClick={() => removeLanguage(i)} className="ml-0.5 hover:text-danger cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Liens */}
        <Card>
          <h2 className="font-semibold text-lg mb-4">Liens</h2>
          <div className="space-y-4">
            <Input id="github" label="GitHub" name="github" value={profile.github || ""} onChange={handleChange} placeholder="https://github.com/votre-profil" />
            <Input id="linkedin" label="LinkedIn" name="linkedin" value={profile.linkedin || ""} onChange={handleChange} placeholder="https://linkedin.com/in/votre-profil" />
            <Input id="portfolio" label="Portfolio" name="portfolio" value={profile.portfolio || ""} onChange={handleChange} placeholder="https://votre-portfolio.com" />
          </div>
        </Card>

        {/* Présentation */}
        <Card>
          <h2 className="font-semibold text-lg mb-4">Présentation</h2>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Bio / Présentation personnelle</label>
            <textarea
              name="bio"
              className="w-full h-32 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
              value={profile.bio || ""}
              onChange={handleChange}
              placeholder="Parlez de vous, de vos objectifs, de ce qui vous motive..."
            />
          </div>
        </Card>

        {/* CV */}
        <Card>
          <h2 className="font-semibold text-lg mb-4">Curriculum Vitae</h2>
          {cvFileName ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">{cvFileName}</p>
                  {cvUploadedAt && (
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                      <Calendar size={11} />
                      Ajouté le {formatDate(cvUploadedAt)}
                    </p>
                  )}
                </div>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium text-primary">
                <Upload size={15} />
                Remplacer
                <input type="file" name="cv" accept=".pdf,.doc,.docx" onChange={handleFile} className="hidden" />
              </label>
            </div>
          ) : (
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm font-medium">
                <Upload size={16} />
                Télécharger un CV
                <input type="file" name="cv" accept=".pdf,.doc,.docx" onChange={handleFile} className="hidden" />
              </label>
            </div>
          )}
          <p className="text-xs text-text-muted mt-2">PDF, DOC ou DOCX — max 2 Mo</p>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={saving}>Enregistrer les modifications</Button>
        </div>
      </form>

      <div className="mt-8">
        <PasswordChange />
      </div>
    </div>
  );
}
