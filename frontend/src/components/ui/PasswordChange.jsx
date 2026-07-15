import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { getErrorMessage } from "../../services/api";
import Button from "./Button";
import Input from "./Input";
import Card from "./Card";
import toast from "react-hot-toast";

export default function PasswordChange() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.current_password || !form.password || !form.password_confirmation) {
      toast.error("Tous les champs sont requis");
      return;
    }
    if (form.password.length < 8) { toast.error("Minimum 8 caractères"); return; }
    if (form.password !== form.password_confirmation) { toast.error("Les mots de passe ne correspondent pas"); return; }
    setLoading(true);
    try {
      await authService.changePassword(form.current_password, form.password, form.password_confirmation);
      toast.success("Mot de passe changé ! Veuillez vous reconnecter.");
      navigate("/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="font-semibold mb-4">Changer le mot de passe</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="current_password"
          label="Mot de passe actuel"
          type="password"
          placeholder="••••••••"
          value={form.current_password}
          onChange={handleChange("current_password")}
        />
        <Input
          id="new_password"
          label="Nouveau mot de passe"
          type="password"
          placeholder="Minimum 8 caractères"
          value={form.password}
          onChange={handleChange("password")}
        />
        <Input
          id="password_confirmation"
          label="Confirmer le mot de passe"
          type="password"
          placeholder="Répétez le mot de passe"
          value={form.password_confirmation}
          onChange={handleChange("password_confirmation")}
        />
        <Button type="submit" variant="primary" loading={loading}>
          Changer le mot de passe
        </Button>
      </form>
    </Card>
  );
}
