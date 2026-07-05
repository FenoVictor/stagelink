import { useState, useEffect } from "react";
import { studentService } from "../../services/studentService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import toast from "react-hot-toast";

export default function StudentProfile() {
  const [profile, setProfile] = useState({ phone: "", bio: "", skills: "", school: "", major: "", graduation_year: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    studentService.getProfile()
      .then((data) => { if (data) setProfile(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentService.updateProfile(profile);
      toast.success("Profil mis à jour !");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="phone" label="Téléphone" name="phone" value={profile.phone || ""} onChange={handleChange} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Bio</label>
            <textarea name="bio" className="w-full h-24 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" value={profile.bio || ""} onChange={handleChange} placeholder="Présentez-vous..." />
          </div>
          <Input id="skills" label="Compétences (séparées par des virgules)" name="skills" value={profile.skills || ""} onChange={handleChange} placeholder="React, PHP, Python..." />
          <Input id="school" label="École / Université" name="school" value={profile.school || ""} onChange={handleChange} />
          <Input id="major" label="Filière" name="major" value={profile.major || ""} onChange={handleChange} />
          <Input id="graduation_year" label="Année d'obtention" name="graduation_year" type="number" value={profile.graduation_year || ""} onChange={handleChange} />
          <Button type="submit" loading={saving}>Enregistrer</Button>
        </form>
      </Card>
    </div>
  );
}
