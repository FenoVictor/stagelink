import { useState, useEffect } from "react";
import { companyService } from "../../services/companyService";
import { getCities } from "../../services/cityService";
import { getErrorMessage } from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import PasswordChange from "../../components/ui/PasswordChange";
import toast from "react-hot-toast";

export default function CompanyProfile() {
  const [profile, setProfile] = useState({
    name: "", description: "", website: "", industry: "",
    phone: "", city_id: "", address: "", employees_count: "",
  });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    Promise.all([
      companyService.getProfile(),
      getCities().then((res) => setCities(res.data || res)),
    ])
      .then(([data]) => { if (data) setProfile(data); })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, val]) => {
        if (val !== null && val !== undefined && key !== "created_at" && key !== "updated_at" && key !== "id" && key !== "user_id") {
          formData.append(key, val);
        }
      });
      if (logoFile) formData.append("logo", logoFile);
      await companyService.updateProfile(formData);
      toast.success("Profil mis à jour !");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-center py-12 text-danger"><p>{error}</p><button onClick={() => { setLoading(true); setError(null); companyService.getProfile().then((data) => { if (data) setProfile(data); }).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false)); }} className="mt-4 text-primary underline cursor-pointer">Réessayer</button></div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profil entreprise</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : profile.logo ? (
                <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">Logo</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Logo de l'entreprise</label>
              <input type="file" name="logo" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleLogo} className="text-sm" />
            </div>
          </div>

          <Input id="company-name" label="Nom de l'entreprise" name="name" value={profile.name || ""} onChange={handleChange} />
          <Input id="phone" label="Téléphone" name="phone" value={profile.phone || ""} onChange={handleChange} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" className="w-full h-24 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" value={profile.description || ""} onChange={handleChange} />
          </div>
          <Input id="website" label="Site web" name="website" value={profile.website || ""} onChange={handleChange} placeholder="https://www.example.com" />
          <Input id="industry" label="Secteur d'activité" name="industry" value={profile.industry || ""} onChange={handleChange} />

          <Select id="city_id" label="Ville" name="city_id" value={profile.city_id || ""} onChange={handleChange}>
            <option value="">— Sélectionner —</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Adresse</label>
            <textarea name="address" className="w-full h-24 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" value={profile.address || ""} onChange={handleChange} placeholder="Adresse de l'entreprise..." />
          </div>

          <Input id="employees_count" label="Nombre d'employés" name="employees_count" type="number" value={profile.employees_count || ""} onChange={handleChange} placeholder="ex: 50" />

          <Button type="submit" loading={saving}>Enregistrer</Button>
        </form>
      </Card>

      <div className="mt-6">
        <PasswordChange />
      </div>
    </div>
  );
}
