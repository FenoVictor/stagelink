import { useState, useEffect, useRef } from "react";
import { studentService } from "../../services/studentService";
import { getSkills } from "../../services/skillService";
import { getErrorMessage } from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import LocationSelector from "../../components/ui/LocationSelector";
import PasswordChange from "../../components/ui/PasswordChange";
import { Camera, X, Plus, ExternalLink, Upload } from "lucide-react";
import toast from "react-hot-toast";

const levelOptions = [
  { value: "Débutant", label: "Débutant" },
  { value: "Intermédiaire", label: "Intermédiaire" },
  { value: "Avancé", label: "Avancé" },
  { value: "Expert", label: "Expert" },
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

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    firstname: "", lastname: "", email: "",
    phone: "", bio: "", school: "", major: "", graduation_year: "",
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
  const skillRef = useRef(null);

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
          if (data.skills) setSkills(data.skills);
          if (data.languages) setLanguages(Array.isArray(data.languages) ? data.languages : []);
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (e.target.name === "photo") {
      setProfile({ ...profile, photo: file });
      setPreview(URL.createObjectURL(file));
    } else if (e.target.name === "cv") {
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

  const updateSkillLevel = (id, level) =>
    setSkills(skills.map((s) => (s.id === id ? { ...s, level } : s)));

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
        if (updated.cv_path) setCvFileName(updated.cv_path.split("/").pop());
        if (updated.skills) setSkills(updated.skills);
        if (updated.languages) setLanguages(Array.isArray(updated.languages) ? updated.languages : []);
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
              <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-lg font-semibold">{profile.firstname || profile.lastname ? `${profile.firstname || ""} ${profile.lastname || ""}`.trim() : "Votre nom"}</p>
            <p className="text-sm text-text-muted">{profile.email}</p>
            <p className="text-xs text-text-muted mt-1">Cliquez sur la photo pour la modifier (JPEG, PNG, max 2 Mo)</p>
          </div>
        </div>
      </Card>

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
            <Input id="school" label="École / Université" name="school" value={profile.school || ""} onChange={handleChange} placeholder="Ex: Université de Toliara" />
            <Input id="major" label="Filière" name="major" value={profile.major || ""} onChange={handleChange} placeholder="Ex: Génie Logiciel" />
            <Input id="graduation_year" label="Année d'obtention" name="graduation_year" type="number" value={profile.graduation_year || ""} onChange={handleChange} placeholder="Ex: 2026" />
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
            <div className="mt-3 space-y-2">
              {skills.map((s) => (
                <div key={s.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-sm font-medium">{s.name}</span>
                  <select
                    value={s.level}
                    onChange={(e) => updateSkillLevel(s.id, e.target.value)}
                    className="text-xs px-2 py-1 rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {levelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <button type="button" onClick={() => removeSkill(s.id)} className="p-1 hover:bg-red-50 rounded cursor-pointer text-text-muted hover:text-danger transition-colors">
                    <X size={14} />
                  </button>
                </div>
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
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm font-medium">
              <Upload size={16} />
              {cvFileName ? "Changer le CV" : "Télécharger un CV"}
              <input type="file" name="cv" accept=".pdf,.doc,.docx" onChange={handleFile} className="hidden" />
            </label>
            {cvFileName && (
              <span className="text-sm text-text-muted flex items-center gap-1">
                <ExternalLink size={14} /> {cvFileName}
              </span>
            )}
          </div>
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
