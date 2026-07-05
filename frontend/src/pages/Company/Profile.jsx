import { useState, useEffect } from "react";
import { companyService } from "../../services/companyService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import toast from "react-hot-toast";

export default function CompanyProfile() {
  const [profile, setProfile] = useState({ name: "", description: "", website: "", location: "", industry: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    companyService.getProfile()
      .then((data) => { if (data) setProfile(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await companyService.updateProfile(profile);
      toast.success("Profil mis à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profil entreprise</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="company-name" label="Nom de l'entreprise" name="name" value={profile.name || ""} onChange={handleChange} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" className="w-full h-24 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" value={profile.description || ""} onChange={handleChange} />
          </div>
          <Input id="website" label="Site web" name="website" value={profile.website || ""} onChange={handleChange} />
          <Input id="company-location" label="Localisation" name="location" value={profile.location || ""} onChange={handleChange} />
          <Input id="industry" label="Secteur d'activité" name="industry" value={profile.industry || ""} onChange={handleChange} />
          <Button type="submit" loading={saving}>Enregistrer</Button>
        </form>
      </Card>
    </div>
  );
}
