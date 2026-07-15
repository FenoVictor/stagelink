import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { getErrorMessage } from "../../services/api";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    token: searchParams.get("token") || "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};
    if (!form.email) newErrors.email = "Email requis";
    if (!form.token) newErrors.token = "Token requis";
    if (!form.password) newErrors.password = "Nouveau mot de passe requis";
    if (form.password.length < 8) newErrors.password = "Minimum 8 caractères";
    if (form.password !== form.password_confirmation) newErrors.password_confirmation = "Les mots de passe ne correspondent pas";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await authService.resetPassword(form);
      toast.success("Mot de passe réinitialisé ! Connectez-vous avec votre nouveau mot de passe.");
      navigate("/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Réinitialiser le mot de passe" subtitle="Choisissez un nouveau mot de passe">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="vous@exemple.fr"
          value={form.email}
          onChange={handleChange("email")}
          error={errors.email}
        />
        <Input
          id="token"
          label="Token de réinitialisation"
          type="text"
          placeholder="Collez le token reçu par email"
          value={form.token}
          onChange={handleChange("token")}
          error={errors.token}
        />
        <Input
          id="password"
          label="Nouveau mot de passe"
          type="password"
          placeholder="Minimum 8 caractères"
          value={form.password}
          onChange={handleChange("password")}
          error={errors.password}
        />
        <Input
          id="password_confirmation"
          label="Confirmer le mot de passe"
          type="password"
          placeholder="Répétez le mot de passe"
          value={form.password_confirmation}
          onChange={handleChange("password_confirmation")}
          error={errors.password_confirmation}
        />
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
          Réinitialiser
        </Button>
      </form>
      <p className="text-center text-sm text-text-muted mt-6">
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </AuthLayout>
  );
}
