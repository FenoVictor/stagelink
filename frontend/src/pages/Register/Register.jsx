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
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
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
      toast.success("Compte créé ! Vérifiez votre email.");
      navigate("/verify-email");
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
    <AuthLayout title={t("auth.register")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Prénom" name="firstname" value={form.firstname} onChange={handleChange} placeholder="Jean" error={errors.firstname} />
          <Input label="Nom" name="lastname" value={form.lastname} onChange={handleChange} placeholder="Dupont" error={errors.lastname} />
        </div>
        <Input label={t("auth.email")} name="email" type="email" value={form.email} onChange={handleChange} placeholder="etudiant@example.com" error={errors.email} />
        <Select label={t("auth.role")} name="role" value={form.role} onChange={handleChange}>
          <option value={ROLES.STUDENT}>{t("auth.student")}</option>
          <option value={ROLES.COMPANY}>{t("auth.company")}</option>
        </Select>
        <Input label={t("auth.password")} name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" error={errors.password} />
        <Input label="Confirmer le mot de passe" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} placeholder="••••••••" error={errors.password_confirmation} />
        <Button className="w-full" loading={loading}>{t("auth.register")}</Button>
        <p className="text-sm text-center text-text-muted">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">{t("auth.login")}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
