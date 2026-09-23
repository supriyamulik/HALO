/**
 * src/components/PageHeader.jsx
 * ──────────────────────────────
 * Shared page-level header for all HALO pages.
 *
 * Props:
 *   title    {string}   – Required. The h1 page title.
 *   subtitle {string}   – Optional. Secondary descriptor line below the title.
 *   action   {ReactNode}– Optional. Button(s) / icon controls rendered on the right.
 */

import "./PageHeader.css";

export default function PageHeader({ title, subtitle, action }) {
  return (
    <header className="page-header">
      <div className="page-header__titles">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && (
          <p className="page-header__subtitle">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="page-header__actions">{action}</div>
      )}
    </header>
  );
}
