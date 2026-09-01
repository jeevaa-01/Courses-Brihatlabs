export default function LessonLoading() {
  return (
    <main id="main-content" className="lesson-loading" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading lesson…</span>
      <div className="skeleton skeleton-meta" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line skeleton-short" />
      <div className="skeleton skeleton-card" />
    </main>
  );
}
