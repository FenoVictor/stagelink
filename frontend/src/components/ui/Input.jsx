import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({ label, error, className = "", id, showPasswordToggle = false, ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = props.type === "password";

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text dark:text-dark-text">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          {...props}
          type={showPasswordToggle && isPassword ? (show ? "text" : "password") : props.type}
          className={`w-full px-4 py-2.5 rounded-lg border ${error ? "border-danger" : "border-border dark:border-dark-border"} bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-muted/50 dark:placeholder:text-dark-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${showPasswordToggle && isPassword ? "pr-11" : ""} ${className}`}
        />
        {showPasswordToggle && isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted dark:text-dark-text-muted hover:text-primary transition-colors cursor-pointer"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
    </div>
  );
}
