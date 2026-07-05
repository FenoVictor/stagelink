import { Inbox } from "lucide-react";
import Button from "./Button";

export default function EmptyState({ icon: Icon = Inbox, title, description, action, onAction, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-primary-bg flex items-center justify-center mb-4">
        <Icon size={32} className="text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      {description && <p className="text-text-muted max-w-sm mb-6">{description}</p>}
      {action && onAction && (
        <Button onClick={onAction} variant="primary">{actionLabel}</Button>
      )}
    </div>
  );
}
