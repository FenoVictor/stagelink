import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { ROLES } from "../../constants";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstname: "", lastname: "", email: "", password: "", password_confirmation: "", role: ROLES.STUDENT,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};
    if (!form.firstname) newErrors.firstname = "Prénom requis";
    if (!form.lastname) newErrors.lastname = "Nom requis";
    if (!form.email) newErrors.email = "Email requis";
    if (!form.password) newErrors.password = "Mot de passe requis";
    else if (form.password.length < 8) newErrors.password = "8 caractères minimum";
    if (form.password !== form.password_confirmation) newErrors.password_confirmation = "Les mots de passe ne correspondent pas";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success("Compte créé avec succès !");
      navigate(`/${user.role}`);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const fieldErrors = {};
        Object.entries(data.errors).forEach(([key, msgs]) => { fieldErrors[key] = msgs[0]; });
        setErrors(fieldErrors);
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Créer un compte" subtitle="Rejoignez StageLink pour trouver ou proposer des stages">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="firstname" label="Prénom" name="firstname" placeholder="Jean" value={form.firstname} onChange={handleChange} error={errors.firstname} />
        <Input id="lastname" label="Nom" name="lastname" placeholder="Dupont" value={form.lastname} onChange={handleChange} error={errors.lastname} />
        <Input id="reg-email" label="Email" name="email" type="email" placeholder="vous@exemple.fr" value={form.email} onChange={handleChange} error={errors.email} />
        <Select id="role" label="Je suis" name="role" value={form.role} onChange={handleChange} error={errors.role}>
          <option value={ROLES.STUDENT}>Étudiant</option>
          <option value={ROLES.COMPANY}>Entreprise</option>
        </Select>
        <Input id="reg-password" label="Mot de passe" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} error={errors.password} />
        <Input id="password_confirmation" label="Confirmer le mot de passe" name="password_confirmation" type="password" placeholder="••••••••" value={form.password_confirmation} onChange={handleChange} error={errors.password_confirmation} />
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
          Créer mon compte
        </Button>
      </form>
      <p className="text-center text-sm text-text-muted mt-6">
        Déjà un compte ?{" "}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
}
