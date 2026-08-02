import { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  CheckCircle,
  Clock,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { securityService } from "../../services/securityService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function TokenManagement() {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTokenName, setNewTokenName] = useState("");
  const [creating, setCreating] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [revoking, setRevoking] = useState(null);
  const [newTokenValue, setNewTokenValue] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const data = await securityService.getTokens();
      setTokens(data.data || data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;
    setCreating(true);
    try {
      const data = await securityService.createToken(newTokenName.trim());
      setNewTokenValue(data.token || data.plainTextToken || data.value);
      setNewTokenName("");
      toast.success("Clé API créée !");
      fetchTokens();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleRotate = async () => {
    setRotating(true);
    try {
      const data = await securityService.rotateToken();
      setNewTokenValue(data.token || data.plainTextToken || data.value);
      toast.success("Clé rotée avec succès !");
      fetchTokens();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRotating(false);
    }
  };

  const handleRevoke = async (tokenId) => {
    setRevoking(tokenId);
    try {
      await securityService.revokeToken(tokenId);
      toast.success("Clé révoquée.");
      fetchTokens();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRevoking(null);
    }
  };

  const copyToken = () => {
    if (!newTokenValue) return;
    navigator.clipboard.writeText(newTokenValue).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Clé copiée !");
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Key className="w-6 h-6 text-primary" />
          {t("nav.apiTokens")}
        </h1>
        <p className="text-text-muted mt-1">
          Gérez vos clés d'API pour l'accès programmatique
        </p>
      </div>

      {newTokenValue && (
        <Card className="p-6 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-text mb-1">
                Nouvelle clé créée
              </p>
              <p className="text-amber-600 dark:text-amber-400 text-sm mb-3 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Copiez cette clé maintenant. Elle ne sera plus affichée.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-surface border border-border font-mono text-sm text-text break-all">
                  {newTokenValue}
                </code>
                <button
                  onClick={copyToken}
                  className="p-2 rounded-lg hover:bg-surface border border-border text-text-muted cursor-pointer shrink-0"
                  title="Copier"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => setNewTokenValue(null)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Créer une clé API
          </h2>
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input
              placeholder="Nom de la clé (ex: Mobile App)"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" loading={creating} disabled={!newTokenName.trim()}>
              <Plus className="w-4 h-4 mr-1" />
              Créer
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Rotation des clés
          </h2>
          <p className="text-text-muted text-sm mb-4">
            La rotation génère une nouvelle clé et révoque automatiquement
            l'ancienne. Toutes les applications utilisant l'ancienne clé
            devront être mises à jour.
          </p>
          <Button variant="outline" onClick={handleRotate} loading={rotating}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Rotation des clés
          </Button>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface">
          <h2 className="font-semibold text-text">Clés actives</h2>
        </div>
        {loading ? (
          <p className="p-6 text-text-muted text-center">{t("common.loading")}</p>
        ) : tokens.length === 0 ? (
          <p className="p-6 text-text-muted text-center">
            Aucune clé API. Créez-en une ci-dessus.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Key className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text text-sm truncate">
                        {token.name}
                      </p>
                      {token.is_current && (
                        <Badge variant="open" className="text-xs shrink-0">
                          Actuelle
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Créée {formatDate(token.created_at)}
                      </span>
                      {token.last_used_at && (
                        <span className="flex items-center gap-1">
                          Utilisée {formatDate(token.last_used_at)}
                        </span>
                      )}
                      {token.expires_at && (
                        <span>
                          Expire {formatDate(token.expires_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!token.is_current && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRevoke(token.id)}
                    loading={revoking === token.id}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Révoquer
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
