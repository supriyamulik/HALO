/**
 * src/pages/PlaceholderPage.jsx
 * ──────────────────────────────
 * Generic placeholder rendered for routes that haven't been built yet.
 * Pass a `title` prop to label the section.
 */

export default function PlaceholderPage({ title = "Coming Soon" }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">🚧</div>
      <h2>{title}</h2>
      <p>This section is under construction.</p>
    </div>
  );
}
