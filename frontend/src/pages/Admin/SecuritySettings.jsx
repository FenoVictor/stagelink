import { useState, useEffect } from "react";
import {
  Key,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Lock,
  Mail,
  Database,
  Radio,
  Search,
  Server,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const categoryIcons = {
  core: Key,
  email: Mail,
  monitoring: Shield,
  broadcasting: Radio,
  database: Database,
  cache: Server,
};

const categoryLabels = {
  core: "Cœur",
  email: "Email",
  monitoring: "Monitoring",
  broadcasting: "Diffusion",
  database: "Base de données",
  cache: "Cache",
};

export default function SecuritySettings() {
  const [secrets, setSecrets] = useState([]);
  const [gitignoreOk, setGitignoreOk] = useState(false);
  const [envSafe, setEnvSafe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkRunning, setCheckRunning] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [showMasked, setShowMasked] = useState({});

  useEffect(() => {
    fetchSecretsStatus();
  }, []);

  const fetchSecretsStatus = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSecretsStatus();
      setSecrets(data.secrets || []);
      setGitignoreOk(data.gitignore_ok);
      setEnvSafe(data.env_not_versioned);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const runCheck = async () => {
    setCheckRunning(true);
    setCheckResult(null);
    try {
      const data = await adminService.runSecretsCheck();
      setCheckResult(data);
      if (data.passed) {
        toast.success("Aucun secret exposé détecté !");
      } else {
        toast.error("Secrets exposés détectés !");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCheckRunning(false);
    }
  };

  const toggleMasked = (key) => {
    setShowMasked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const configuredCount = secrets.filter((s) => s.configured).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            Gestion des secrets
          </h1>
          <p className="text-text-muted mt-1">
            Sécurité des clés API et mots de passe de la plateforme
          </p>
        </div>
        <Button onClick={runCheck} loading={checkRunning} variant="outline" size="sm">
          <Search className="w-4 h-4 mr-2" />
          Scanner le code
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${gitignoreOk && envSafe ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
              {gitignoreOk && envSafe ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <p className="text-text font-medium text-sm">.gitignore</p>
              <p className="text-text-muted text-xs">{gitignoreOk && envSafe ? "Protégé" : "Vulnérable"}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${configuredCount === secrets.length ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
              <Key className={`w-5 h-5 ${configuredCount === secrets.length ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`} />
            </div>
            <div>
              <p className="text-text font-medium text-sm">Secrets configurés</p>
              <p className="text-text-muted text-xs">{configuredCount}/{secrets.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-text font-medium text-sm">Middleware actif</p>
              <p className="text-text-muted text-xs">SecretsGuard + SecurityHeaders</p>
            </div>
          </div>
        </Card>
      </div>

      {checkResult && (
        <Card className={`p-4 ${checkResult.passed ? "border-green-200 dark:border-green-800" : "border-red-200 dark:border-red-800"}`}>
          <div className="flex items-start gap-3">
            {checkResult.passed ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            )}
            <div>
              <p className={`font-medium text-sm ${checkResult.passed ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                {checkResult.passed ? "Aucun secret exposé détecté" : "Secrets exposés détectés"}
              </p>
              {checkResult.output && (
                <pre className="mt-2 text-xs text-text-muted bg-surface p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {checkResult.output}
                </pre>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text">Registre des secrets</h2>
          <p className="text-text-muted text-sm mt-1">
            Toutes les clés sensibles de l'application
          </p>
        </div>
        {loading ? (
          <div className="p-6 text-center text-text-muted">Chargement...</div>
        ) : (
          <div className="divide-y divide-border">
            {secrets.map((secret) => {
              const Icon = categoryIcons[secret.category] || Key;
              return (
                <div key={secret.key} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-medium text-text">{secret.key}</code>
                      <Badge variant={secret.configured ? "success" : "warning"} className="text-xs">
                        {secret.configured ? "Configuré" : "Non défini"}
                      </Badge>
                      <Badge variant="info" className="text-xs">
                        {categoryLabels[secret.category] || secret.category}
                      </Badge>
                    </div>
                    <p className="text-text-muted text-xs mt-1">{secret.description}</p>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-text-muted text-xs">
                        Rotation : {secret.rotation}
                      </span>
                      {secret.configured && (
                        <button
                          onClick={() => toggleMasked(secret.key)}
                          className="flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors"
                        >
                          {showMasked[secret.key] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                          {showMasked[secret.key] ? "Masquer" : "Aperçu"}
                        </button>
                      )}
                    </div>
                    {showMasked[secret.key] && secret.masked && (
                      <code className="block mt-1 text-xs font-mono text-text-muted bg-surface px-2 py-1 rounded">
                        {secret.masked}
                      </code>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Règles de sécurité
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: EyeOff, title: "Jamais loggés", desc: "Aucun secret n'apparaît dans les logs, erreurs, ou réponses API" },
            { icon: Shield, title: "Jamais versionnés", desc: ".env dans .gitignore, jamais commité dans Git" },
            { icon: Lock, title: "Stockés dans .env", desc: "Toutes les clés sensibles dans .env, jamais en dur" },
            { icon: RefreshCw, title: "Rotation régulière", desc: "Chaque secret a une fréquence de rotation définie" },
          ].map((rule) => (
            <div key={rule.title} className="flex items-start gap-3 p-3 rounded-lg bg-surface/50">
              <rule.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-text font-medium text-sm">{rule.title}</p>
                <p className="text-text-muted text-xs mt-1">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
