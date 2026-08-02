import { useState, useEffect } from "react";
import { Lightbulb, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { feedbackService } from "../../services/feedbackService";
import { getErrorMessage } from "../../services/api";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import toast from "react-hot-toast";

const TYPES = ["feature", "improvement", "bug", "general"];
const TYPE_ICONS = { feature: "💡", improvement: "✨", bug: "🐛", general: "💬" };

export default function FeedbackWidget() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("feature");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const openFromEvent = () => setOpen(true);
    window.addEventListener("stagelink:open-feedback", openFromEvent);
    return () => window.removeEventListener("stagelink:open-feedback", openFromEvent);
  }, []);

  const reset = () => {
    setMessage("");
    setRating(0);
    setHover(0);
    setType("feature");
    setName("");
    setEmail("");
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (message.trim().length < 10) {
      setError(t("feedback.minMessage"));
      return;
    }
    setLoading(true);
    try {
      const payload = { type, message: message.trim(), rating: rating || null };
      if (!user) {
        if (name.trim()) payload.name = name.trim();
        if (email.trim()) payload.email = email.trim();
      }
      await feedbackService.submit(payload);
      toast.success(t("feedback.success"));
      setOpen(false);
      reset();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all duration-200 cursor-pointer"
      >
        <Lightbulb size={20} />
        <span className="text-sm font-semibold hidden sm:inline">{t("feedback.button")}</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t("feedback.title")} size="md">
        <p className="text-sm text-text-muted dark:text-dark-text-muted -mt-2 mb-4">{t("feedback.subtitle")}</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">{t("feedback.typeLabel")}</p>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map((tKey) => (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => setType(tKey)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer text-left ${
                    type === tKey
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border dark:border-dark-border bg-background dark:bg-dark-surface text-text-muted dark:text-dark-text-muted hover:border-primary/50"
                  }`}
                >
                  <span>{TYPE_ICONS[tKey]}</span>
                  <span>{t(`feedback.types.${tKey}`)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t("feedback.messageLabel")}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={t("feedback.messagePlaceholder")}
              className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text placeholder:text-text-muted/50 dark:placeholder:text-dark-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
            />
            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
              {message.trim().length}/3000 — {t("feedback.minMessage")}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1.5">{t("feedback.ratingLabel")}</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className="cursor-pointer p-0.5 transition-transform hover:scale-110"
                  aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                >
                  <Star
                    size={26}
                    fill={n <= (hover || rating) ? "#f59e0b" : "none"}
                    stroke={n <= (hover || rating) ? "#f59e0b" : "#94a3b8"}
                  />
                </button>
              ))}
            </div>
          </div>

          {!user ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label={t("auth.name")} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("feedback.namePlaceholder")} />
              <Input label={t("auth.email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("feedback.emailPlaceholder")} />
            </div>
          ) : (
            <p className="text-xs text-text-muted dark:text-dark-text-muted">
              {t("feedback.asUser")} <span className="font-medium">{user.name}</span>
            </p>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            {t("common.send")}
          </Button>
        </form>
      </Modal>
    </>
  );
}
