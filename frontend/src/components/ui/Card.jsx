export default function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={`bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-6 ${hover ? "hover:border-primary/30 hover:shadow-sm transition-all duration-200 cursor-pointer" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
