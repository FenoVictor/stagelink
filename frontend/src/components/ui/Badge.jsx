const colors = {
  open: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
  draft: "bg-yellow-100 text-yellow-700",
  filled: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  student: "bg-sky-100 text-sky-700",
  company: "bg-purple-100 text-purple-700",
  admin: "bg-rose-100 text-rose-700",
};

export default function Badge({ children, variant = "open", className = "" }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[variant] || colors.open} ${className}`}>
      {children}
    </span>
  );
}
