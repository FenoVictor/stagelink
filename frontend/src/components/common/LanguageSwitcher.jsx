import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { useState } from "react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const switchLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("sl_lang", lang);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors cursor-pointer"
        title="Langue / Language"
      >
        <Globe size={18} className="text-text-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-32 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl shadow-lg z-20 p-1">
            <button
              onClick={() => switchLang("fr")}
              className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                i18n.language === "fr" ? "bg-primary-bg dark:bg-dark-hover text-primary" : "hover:bg-gray-50 dark:hover:bg-dark-hover"
              }`}
            >
              Français
            </button>
            <button
              onClick={() => switchLang("en")}
              className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                i18n.language === "en" ? "bg-primary-bg dark:bg-dark-hover text-primary" : "hover:bg-gray-50 dark:hover:bg-dark-hover"
              }`}
            >
              English
            </button>
          </div>
        </>
      )}
    </div>
  );
}
