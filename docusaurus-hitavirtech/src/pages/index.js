import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import COURSES from '@site/src/data/courses';

function CourseCard({course}) {
  return (
    <div className="col col--4" style={{marginBottom: '1.5rem'}}>
      <div className="hv-card hv-course-card">
        <div className="hv-module-no">
          {course.level} · {course.duration}
        </div>
        <h3>{course.title}</h3>
        <p>{course.desc}</p>
        <div className="hv-course-meta">
          <span>🧱 {course.modules} modules</span>
          <span>📖 {course.lessons} lessons</span>
          {course.tags.map((t) => (
            <span key={t} className="hv-course-tag">
              {t}
            </span>
          ))}
        </div>
        <Link className="button button--primary button--block" to={course.href}>
          Start course →
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="HitaVir Tech learning portal — hands-on data engineering courses for enrolled students">
      <header className="hv-hero">
        <div className="container">
          <div className="hv-sanskrit">HitaVir Tech · Learning Portal</div>
          <h1>Data Engineering, taught the hands-on way</h1>
          <p className="hv-tagline">
            Structured courses with per-lesson objectives, interactive knowledge
            checks, capstone projects, and graded final quizzes. Built for
            HitaVirTech cohorts — sign in with your registered account.
          </p>
          <div className="hv-badges">
            <span className="hv-badge">🎓 Coursera-style lessons</span>
            <span className="hv-badge">🧠 Interactive quizzes</span>
            <span className="hv-badge">🔐 Enrolled students only</span>
          </div>
        </div>
      </header>
      <main className="hv-modules">
        <div className="container">
          <h2 className="hv-portal-heading">Courses</h2>
          <div className="row">
            {COURSES.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
