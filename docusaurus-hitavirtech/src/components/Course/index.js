import React, {useEffect, useState} from 'react';
import {useLocation} from '@docusaurus/router';

/**
 * Coursera-style lesson building blocks. All registered globally in
 * src/theme/MDXComponents.js so course MDX never needs imports.
 */

/** "By the end of this lesson you will be able to…" box. */
export function LearningObjectives({children}) {
  return (
    <div className="hv-objectives">
      <div className="hv-objectives-title">🎯 What you&apos;ll learn</div>
      {children}
    </div>
  );
}

/** End-of-lesson recap box. */
export function KeyTakeaways({children}) {
  return (
    <div className="hv-takeaways">
      <div className="hv-takeaways-title">📌 Key takeaways</div>
      {children}
    </div>
  );
}

/** Reading-time pill, carried over from the claat `Duration:` metadata. */
export function DurationBadge({minutes}) {
  return <span className="hv-duration">⏱ {minutes} min</span>;
}

/**
 * "Mark as complete" toggle. Persists per-lesson completion in
 * localStorage keyed by pathname, so progress survives reloads and
 * deploys (key format is stable — do not change it).
 */
export function LessonComplete() {
  const {pathname} = useLocation();
  const key = `hv-lesson-complete:${pathname.replace(/\/$/, '')}`;
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      setDone(window.localStorage.getItem(key) === '1');
    } catch (e) {
      /* private mode */
    }
  }, [key]);

  const toggle = () => {
    const next = !done;
    setDone(next);
    try {
      if (next) window.localStorage.setItem(key, '1');
      else window.localStorage.removeItem(key);
    } catch (e) {
      /* private mode */
    }
  };

  return (
    <div className="hv-complete">
      <button
        type="button"
        className={`hv-complete-btn${done ? ' done' : ''}`}
        onClick={toggle}>
        {done ? '✓ Lesson completed' : 'Mark lesson as complete'}
      </button>
    </div>
  );
}
