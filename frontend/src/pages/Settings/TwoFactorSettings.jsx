import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldOff,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { securityService } from "../../services/securityService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";

export default function TwoFactorSettings() {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [otpauthUrl, setOtpauthUrl] = useState(null);
  const [secret, setSecret] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [code, setCode] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await securityService.get2faStatus();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleEnable = async () => {
    setEnabling(true);
    try {
      const data = await securityService.enable2fa();
      setQrUrl(data.qr_code_url);
      setOtpauthUrl(data.otpauth_url);
      setSecret(data.secret);
      setRecoveryCodes(data.recovery_codes);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEnabling(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!code || code.length < 6) return;
    setConfirming(true);
    try {
      await securityService.confirm2fa(code);
      toast.success("Double authentification activée !");
      setQrUrl(null);
      setOtpauthUrl(null);
      setSecret(null);
      setRecoveryCodes(null);
      setCode("");
      fetchStatus();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setConfirming(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    if (!disablePassword || !disableCode || disableCode.length !== 6) return;
    setDisabling(true);
    try {
      await securityService.disable2fa(disablePassword, disableCode);
      toast.success("Double authentification désactivée.");
      setDisablePassword("");
      setDisableCode("");
      setShowDisableForm(false);
      fetchStatus();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDisabling(false);
    }
  };

  if (loading) {
    return <p className="text-text-muted">{t("common.loading")}</p>;
  }

  const isEnabled = status?.enabled;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          {t("nav.twoFactor")}
        </h1>
        <p className="text-text-muted mt-1">
          {isEnabled
            ? "La double authentification est active sur votre compte."
            : "Ajoutez une couche de sécurité supplémentaire à votre compte."}
        </p>
      </div>

      {isEnabled ? (
        <div className="space-y-6">
          <Card className="p-6 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-text">2FA active</p>
                <p className="text-text-muted text-sm">
                  Activée le{" "}
                  {new Date(status.confirmed_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Codes de récupération
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Conservez ces codes en lieu sûr. Ils vous permettront d'accéder à
              votre compte si vous perdez votre appareil d'authentification.
            </p>
            {!showRecovery ? (
              <Button
                variant="outline"
                onClick={() => setShowRecovery(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Afficher les codes
              </Button>
            ) : (
              <div>
                {status.recovery_codes && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                    {status.recovery_codes.map((c, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 rounded-lg bg-surface border border-border font-mono text-sm text-text text-center"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRecovery(false)}
                >
                  <EyeOff className="w-4 h-4 mr-1" />
                  Masquer
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6 border-red-200 dark:border-red-800">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <ShieldOff className="w-5 h-5" />
              Désactiver la 2FA
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Pour désactiver la double authentification, vous devez fournir
              votre mot de passe et un code de votre application
              d'authentification.
            </p>
            {!showDisableForm ? (
              <Button
                variant="danger"
                onClick={() => setShowDisableForm(true)}
              >
                <ShieldOff className="w-4 h-4 mr-2" />
                Désactiver la 2FA
              </Button>
            ) : (
              <form onSubmit={handleDisable} className="space-y-3 max-w-sm">
                <Input
                  label="Mot de passe"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="••••••••"
                />
                <Input
                  label="Code TOTP"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]*"
                  value={disableCode}
                  onChange={(e) =>
                    setDisableCode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="000000"
                />
                <div className="flex gap-2">
                  <Button variant="outline" type="button" onClick={() => setShowDisableForm(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button
                    variant="danger"
                    loading={disabling}
                    disabled={!disablePassword || disableCode.length !== 6}
                  >
                    Confirmer la désactivation
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Qu'est-ce que la double authentification ?
            </h2>
            <p className="text-text-muted text-sm mb-4">
              La double authentification (2FA) ajoute une couche de sécurité
              supplémentaire. Lors de la connexion, en plus de votre mot de
              passe, vous devrez fournir un code généré par une application
              d'authentification (Google Authenticator, Authy, etc.).
            </p>
            <ul className="space-y-2 text-text-muted text-sm mb-4">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                Protection contre les mots de passe compromis
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                Code renouvelé toutes les 30 secondes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                Codes de récupération en cas de perte d'appareil
              </li>
            </ul>
          </Card>

          {!qrUrl ? (
            <Card className="p-6">
              <Button
                onClick={handleEnable}
                loading={enabling}
                disabled={enabling}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Activer la double authentification
              </Button>
            </Card>
          ) : (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-text mb-4">
                Configuration de la 2FA
              </h2>
              <div className="space-y-4">
                {otpauthUrl && (
                  <div className="flex justify-center">
                    <QRCodeSVG
                      value={otpauthUrl}
                      size={192}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                      className="rounded-lg border border-border"
                    />
                  </div>
                )}
                {secret && (
                  <div>
                    <p className="text-text-muted text-sm mb-1">
                      Saisissez manuellement cette clé si le QR code ne
                      fonctionne pas :
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-surface border border-border font-mono text-sm text-text select-all">
                        {showSecret ? secret : "••••••••••••••••"}
                      </code>
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="p-2 rounded-lg hover:bg-surface text-text-muted cursor-pointer"
                      >
                        {showSecret ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {recoveryCodes && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-amber-700 dark:text-amber-300 text-sm">
                          Codes de récupération
                        </p>
                        <p className="text-amber-600 dark:text-amber-400 text-xs mb-2">
                          Sauvegardez ces codes. Ils ne seront plus affichés.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                          {recoveryCodes.map((c, i) => (
                            <code key={i} className="px-2 py-1 rounded bg-white dark:bg-dark-surface font-mono text-xs text-text text-center">
                              {c}
                            </code>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <form onSubmit={handleConfirm} className="space-y-3 max-w-sm">
                  <Input
                    label="Code de vérification"
                    type="text"
                    inputMode="text"
                    maxLength={8}
                    pattern="[A-Za-z0-9]*"
                    autoCapitalize="characters"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                    }
                    placeholder="000000"
                  />
                  <Button
                    type="submit"
                    loading={confirming}
                    disabled={code.length < 6}
                  >
                    Confirmer et activer
                  </Button>
                </form>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
