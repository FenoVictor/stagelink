import { Link } from "react-router-dom";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-primary-bg flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary font-heading">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#0369A1"/>
                <path d="M16 8L24 14V24H8V14L16 8Z" fill="white" opacity="0.9"/>
                <path d="M16 12L20 15V20H12V15L16 12Z" fill="#0EA5E9"/>
              </svg>
              StageLink
            </Link>
          </div>
          <div className="bg-surface rounded-xl border border-border p-8 shadow-sm">
            {title && <h1 className="text-2xl font-bold text-center mb-1">{title}</h1>}
            {subtitle && <p className="text-text-muted text-center mb-6">{subtitle}</p>}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
