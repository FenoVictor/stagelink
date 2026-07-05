export default function Input({ label, error, className = "", id, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-2.5 rounded-lg border ${error ? "border-danger" : "border-border"} bg-white text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
    </div>
  );
}
