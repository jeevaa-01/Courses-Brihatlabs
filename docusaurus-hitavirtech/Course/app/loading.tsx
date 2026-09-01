export default function Loading() {
  return (
    <main id="main-content" className="route-loading" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading AgentLab…</span>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line skeleton-short" />
      <div className="skeleton skeleton-card" />
    </main>
  );
}
