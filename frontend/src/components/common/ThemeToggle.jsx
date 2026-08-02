import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggle}
      title={dark ? t("common.lightMode") : t("common.darkMode")}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors cursor-pointer"
    >
      {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-text-muted" />}
    </button>
  );
}
