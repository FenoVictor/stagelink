export default function Select({ label, error, className = "", id, children, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-4 py-2.5 rounded-lg border ${error ? "border-danger" : "border-border"} bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
    </div>
  );
}
