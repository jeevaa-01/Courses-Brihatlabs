# Course Learning Module

This repository now exposes the active learning product as one integration boundary:

`Courses -> Modules -> Lessons -> Projects 01/02 -> Enrollment -> Progress -> Completion`

## Source of truth

- `lib/course-data.ts` — the published course records, curriculum, lessons, quizzes, skills, and certificate criteria.
- `lib/course-projects.ts` — the two course-owned project records, their order, module prerequisites, instructions, milestones, and submission metadata.
- `lib/progress.ts` — the browser-safe progress and enrollment snapshot format, including a migration path from the previous progress key.
- `lib/server-course-progress.ts` and `learner_records` — authenticated persistence for enrollment, lesson progress, project progress/submissions, quiz evidence, notes, and last active lesson.
- `app/chatgpt-auth.ts` — the required authentication adapter. The module consumes a stable user ID and does not own the host platform's sign-in flow.

`career_programs`, `subjects`, and payment tables remain legacy commerce/program infrastructure. They are not used as a second course source by the active `/courses` experience. No rows are dropped or migrated by this extraction.

## Integration entry point

Import `lib/course-learning-module.ts` for catalog summaries, curriculum sequences, course status, next-learning-item resolution, project status, and validation. The functions are framework-light and accept a `CourseModuleUser`/progress snapshot boundary rather than requiring unrelated page providers.

## Routes

| Route | Purpose |
| --- | --- |
| `GET /api/courses` | Published course cards/catalog |
| `GET /api/courses/:id` | Full course details |
| `GET /api/courses/:id/curriculum` | Ordered modules, embedded projects, and final assessment metadata |
| `GET /api/courses/:id/modules` | Backward-compatible curriculum alias |
| `GET /api/courses/:id/progress` | Authenticated course progress and next item |
| `POST /api/courses/:id/enroll` | Authenticated enrollment; aliases the existing start flow |
| `POST /api/courses/:id/start` | Authenticated enrollment/start compatibility route |
| `PATCH /api/lessons/:id/progress` | Authenticated lesson progress |
| `GET /api/users/me/enrollments` | Authenticated course enrollments and status |
| `GET/PUT /api/projects/:slug` | Course project workspace and prerequisite-gated access |
| `POST /api/projects/:slug/complete` | Prerequisite-gated project completion |
| `POST /api/projects/:slug/review` | Project evidence review |
| `POST /api/projects/:slug/defense` | Project defense state |
| `POST /api/projects/:slug/github` | Public GitHub submission metadata analysis |

Standalone project/program pages are compatibility redirects or are no longer indexed. Course project detail routes remain available because the project is embedded in a course curriculum.

## Required host adapter

The destination platform can provide its own identity adapter:

```ts
export type CourseModuleUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};
```

Pass the host user's stable `id` to enrollment/progress services. The learning module owns course access, progress, project submissions, and completion; the parent platform owns authentication and sessions.

## Required persisted models

The active implementation uses `users` and a versioned `learner_records` snapshot for the current course flow, plus `certificates` for completion records. The legacy Drizzle schema also contains normalized program tables. Do not delete existing users, enrollments, progress, submissions, or certificates during integration; map them into the destination system before changing persistence.

## Mounting

The UI currently mounts at `/courses`, `/courses/:slug`, and `/learn/:courseSlug/:unitSlug/:lessonSlug`. Use relative links or an application-level route prefix when embedding the components. API consumers should use the route table above rather than reaching into page components.

## Validation

`validateCourseLearningCatalog()` checks every active course for exactly two projects and verifies each project has a course relationship, position, prerequisites, instructions/requirements, milestones, skills, technologies, and submission-related fields. The production test suite calls the catalog and curriculum APIs and fails if any course violates the contract.

