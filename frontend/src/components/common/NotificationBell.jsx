import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { notificationService } from "../../services/notificationService";
import { getErrorMessage } from "../../services/api";
import toast from "react-hot-toast";

function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (!isFinite(seconds)) return "";
  if (seconds < 60) return "À l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${Math.floor(hours / 24)} j`;
}

const typeColors = {
  application: "bg-blue-500",
  message: "bg-green-500",
  alert: "bg-red-500",
  system: "bg-gray-500",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count ?? 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id) {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleMarkAllRead() {
    try {
      await notificationService.markAllRead();
      toast.success("Toutes les notifications ont été marquées comme lues");
      fetchNotifications();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg hover:bg-primary-bg transition-colors cursor-pointer"
      >
        <Bell size={20} className="text-text-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-danger rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 bg-surface rounded-xl shadow-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-text">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={14} />
                    Tout marquer comme lu
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-text-muted"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                  <Bell size={32} className="mb-2 opacity-40" />
                  <span className="text-sm">Aucune notification</span>
                </div>
              ) : (
                <ul>
                  {notifications.map((n) => {
                    return (
                      <li
                        key={n.id}
                        className={`flex items-start gap-3 p-4 border-b border-border last:border-0 hover:bg-primary-bg/50 transition-colors ${!n.read_at ? "bg-primary-bg/30" : ""}`}
                      >
                        <span
                          className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${typeColors[n.type] || "bg-primary"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text truncate">
                            {n.title || "Notification"}
                          </p>
                          {n.message && (
                            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                          )}
                          <span className="text-[11px] text-text-muted/70 mt-1 block">
                            {timeAgo(n.created_at)}
                          </span>
                        </div>
                        {!n.read_at && (
                          <button
                            onClick={() => handleMarkAsRead(n.id)}
                            className="p-1.5 rounded-md hover:bg-primary-bg text-primary shrink-0 self-start cursor-pointer transition-colors"
                            title="Marquer comme lu"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="p-3 border-t border-border text-center">
              <span className="text-xs text-text-muted">
                {notifications.length} notification{notifications.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
