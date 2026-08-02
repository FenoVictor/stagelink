import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { getErrorMessage } from "../../services/api";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [status, setStatus] = useState("loading");
  const [resending, setResending] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      const params = new URL(token, window.location.origin).searchParams;
      const id = params.get("id");
      const hash = params.get("hash");
      if (id && hash) {
        authService.verifyEmail(id, hash)
          .then(() => { setStatus("verified"); toast.success("Email vérifié avec succès !"); })
          .catch(() => setStatus("error"));
      } else {
        setStatus("error");
      }
    } else if (user?.email_verified_at) {
      setStatus("verified");
    } else {
      setStatus("pending");
    }
  }, [token, user]);

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerification();
      toast.success("Un nouveau lien a été envoyé !");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  if (status === "loading") {
    return (
      <AuthLayout title="Vérification en cours...">
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AuthLayout>
    );
  }

  if (status === "verified") {
    return (
      <AuthLayout title="Email vérifié" subtitle="Votre compte est maintenant actif.">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <p className="text-sm text-text-muted">
            Votre adresse email a été vérifiée avec succès.
          </p>
          <Link to={`/${user?.role || "student"}`}>
            <Button className="w-full">Accéder au tableau de bord</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Vérifiez votre email" subtitle="Un lien de vérification vous a été envoyé.">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Mail size={32} className="text-primary" />
        </div>
        <p className="text-sm text-text-muted">
          Nous avons envoyé un lien de vérification à <strong>{user?.email}</strong>.
          Vérifiez votre boîte de réception et cliquez sur le lien pour activer votre compte.
        </p>
        <p className="text-xs text-text-muted">
          Le lien expire dans 60 minutes.
        </p>
        <Button onClick={handleResend} loading={resending} variant="outline" className="w-full">
          <RefreshCw size={16} className="mr-2" />
          Renvoyer le lien
        </Button>
        <button onClick={() => { logout(); }} className="text-xs text-text-muted hover:text-primary cursor-pointer">
          Changer d'email ?
        </button>
      </div>
    </AuthLayout>
  );
}
