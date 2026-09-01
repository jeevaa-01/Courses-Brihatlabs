// @ts-check
// HitaVir Tech — PySpark for Data Engineering (Docusaurus 3.10)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'PySpark for Data Engineering',
  tagline: 'Wisdom to Lead, Intelligence to Serve — a HitaVir Tech course',
  favicon: 'img/favicon.svg',

  url: 'https://learn.hitavirtech.com',
  baseUrl: '/',
  organizationName: 'hitavirtech',
  projectName: 'pyspark-data-engineering',

  onBrokenLinks: 'throw',

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        // The PySpark course moved from /docs/... to /courses/pyspark/...
        // Old bookmarks and shared links keep working.
        createRedirects(existingPath) {
          if (existingPath.startsWith('/courses/pyspark/')) {
            return [existingPath.replace('/courses/pyspark', '/docs')];
          }
          return undefined;
        },
      },
    ],
  ],

  // Docusaurus 3.10: opt in to v4 behavior + Docusaurus Faster (Rspack/SWC)
  future: {
    v4: true,
    faster: true,
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          // Docs own the site root so courses live at /courses/<name>/…
          // (the portal landing page at / is src/pages/index.js).
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          showLastUpdateTime: false,
          breadcrumbs: true,
        },
        blog: {
          showReadingTime: true,
          blogTitle: 'Course announcements',
          blogDescription: 'HitaVir Tech cohort announcements and updates',
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: { customCss: './src/css/custom.css' },
        sitemap: { changefreq: 'weekly', priority: 0.5 },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.svg',
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      announcementBar: {
        id: 'batch6',
        content:
          '🚀 HitaVir Tech Batch 6 is live — run every example on <a target="_blank" rel="noopener" href="https://www.databricks.com/learn/free-edition">Databricks Free Edition</a>.',
        backgroundColor: '#0B1F3A',
        textColor: '#F5F7FB',
        isCloseable: true,
      },
      docs: {
        sidebar: { hideable: true, autoCollapseCategories: true },
      },
      navbar: {
        title: 'HitaVir Tech',
        logo: { alt: 'HitaVir Tech', src: 'img/logo.svg' },
        items: [
          {
            type: 'dropdown',
            label: 'Courses',
            position: 'left',
            items: [
              { label: 'Learn Like a Top Performer', to: '/courses/learn-like-a-top-performer' },
              { label: 'DE Environment Setup (Windows 11)', to: '/courses/windows-setup' },
              { label: 'Git & GitHub Basics (Git Bash)', to: '/courses/git-github-basics' },
              { label: 'Linux Basics (Git Bash)', to: '/courses/linux-basics' },
              { label: 'GitHub Ultimate (Beginner–Expert)', to: '/courses/github-ultimate' },
              { label: 'MySQL Workbench Setup (Windows)', to: '/courses/mysql-workbench-setup' },
              { label: 'SQL for Data Engineering', to: '/courses/sql-for-data-engineering' },
              { label: 'Python for Data Engineering', to: '/courses/python-data-engineering' },
              { label: 'PySpark for Data Engineering', to: '/courses/pyspark/intro' },
              { label: 'Data Engineering on AWS', to: '/courses/data-engineering-on-aws' },
              { label: 'AWS Analytics — Part 1', to: '/courses/aws-analytics-part1' },
              { label: 'AWS Analytics — Part 2 (Alumni)', to: '/courses/aws-analytics-part2' },
              { label: 'Azure Analytics — Part 1 (Alumni)', to: '/courses/azure-analytics-part1' },
              { label: 'Azure Analytics — Part 2 (Alumni)', to: '/courses/azure-analytics-part2' },
              { label: 'Data Modelling (Alumni)', to: '/courses/data-modelling' },
            ],
          },
          { to: '/blog', label: 'Announcements', position: 'left' },
          {
            href: 'https://www.databricks.com/learn/free-edition',
            label: 'Databricks Free Edition',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Course',
            items: [
              { label: 'All courses', to: '/' },
              { label: 'PySpark: start here', to: '/courses/pyspark/intro' },
              { label: 'PySpark capstone', to: '/courses/pyspark/module-5-capstone-and-testing/data-engineering-mini-project' },
            ],
          },
          {
            title: 'Ecosystem',
            items: [
              { label: 'Apache Spark docs', href: 'https://spark.apache.org/docs/latest/' },
              { label: 'Databricks Free Edition', href: 'https://www.databricks.com/learn/free-edition' },
              { label: 'Delta Lake', href: 'https://delta.io/' },
            ],
          },
          {
            title: 'HitaVir Tech',
            items: [{ label: 'Announcements', to: '/blog' }],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} HitaVir Tech · Wisdom to Lead, Intelligence to Serve`,
      },
      prism: {
        additionalLanguages: ['powershell', 'sql', 'java', 'bash', 'diff', 'json', 'ini'],
        magicComments: [
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-next-line',
            block: { start: 'highlight-start', end: 'highlight-end' },
          },
        ],
      },
      mermaid: {
        theme: { light: 'neutral', dark: 'dark' },
      },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
    }),
};

// Prism themes (module scope per Docusaurus v3 convention)
const { themes: prismThemes } = require('prism-react-renderer');
config.themeConfig.prism.theme = prismThemes.github;
config.themeConfig.prism.darkTheme = prismThemes.dracula;

module.exports = config;
