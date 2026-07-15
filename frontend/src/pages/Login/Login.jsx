import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.email || !form.password) {
      setErrors({ email: !form.email ? "Email requis" : "", password: !form.password ? "Mot de passe requis" : "" });
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success("Connecté avec succès !");
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Connexion" subtitle="Connectez-vous pour accéder à votre espace">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="vous@exemple.fr"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />
        <Input
          id="password"
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />
        <div className="text-right -mt-2">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
          Se connecter
        </Button>
      </form>
      <p className="text-center text-sm text-text-muted mt-6">
        Pas encore de compte ?{" "}
        <Link to="/register" className="text-primary font-semibold hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  );
}
