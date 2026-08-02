import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const { login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [twoFaRequired, setTwoFaRequired] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.email || !form.password) {
      setErrors({ email: !form.email ? t("common.error") : "", password: !form.password ? t("common.error") : "" });
      return;
    }
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.requires_2fa) {
        setTempToken(result.temp_token);
        setTwoFaRequired(true);
        setLoading(false);
        return;
      }
      toast.success("Connecté avec succès !");
      navigate(`/${result.role}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTwoFa = async (e) => {
    e.preventDefault();
    if (!twoFaCode || twoFaCode.length < 6) return;
    setTwoFaLoading(true);
    try {
      const user = await verifyTwoFactor(twoFaCode, tempToken);
      toast.success("Connecté avec succès !");
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTwoFaLoading(false);
    }
  };

  return (
    <AuthLayout title={t("auth.login")}>
      {twoFaRequired ? (
        <form onSubmit={handleVerifyTwoFa} className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-text-muted text-sm">{t("auth.twoFaDescription")}</p>
          </div>
          <Input
            label={t("auth.twoFaCode")}
            type="text"
            inputMode="text"
            maxLength={8}
            pattern="[A-Za-z0-9]*"
            autoCapitalize="characters"
            value={twoFaCode}
            onChange={(e) =>
              setTwoFaCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
            }
            placeholder="000000"
          />
          <Button className="w-full" loading={twoFaLoading} disabled={twoFaCode.length < 6}>{t("auth.verify")}</Button>
          <button
            type="button"
            onClick={() => { setTwoFaRequired(false); setTwoFaCode(""); setTempToken(null); }}
            className="w-full text-sm text-text-muted hover:text-primary text-center cursor-pointer"
          >
            {t("common.back")}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("auth.email")}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="etudiant@example.com"
            error={errors.email}
          />
          <Input
            label={t("auth.password")}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            error={errors.password}
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">{t("auth.forgotPassword")}</Link>
          </div>
          <Button className="w-full" loading={loading}>{t("auth.login")}</Button>
          <p className="text-sm text-center text-text-muted">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">{t("auth.register")}</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
