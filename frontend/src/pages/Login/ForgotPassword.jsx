import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { getErrorMessage } from "../../services/api";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Veuillez entrer votre email"); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success("Email de réinitialisation envoyé !");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Mot de passe oublié" subtitle="Entrez votre email pour réinitialiser votre mot de passe">
      {sent ? (
        <div className="text-center space-y-4">
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm">
            Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
            Consultez votre boîte de réception (ou les logs du serveur).
          </div>
          <Link to="/login" className="text-primary font-semibold hover:underline text-sm block">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="vous@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Envoyer le lien
          </Button>
        </form>
      )}
      <p className="text-center text-sm text-text-muted mt-6">
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </AuthLayout>
  );
}
