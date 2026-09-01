# Course certification audit

## Scope

This audit covers the reusable course workflow only: Course → Modules → Lessons → two assigned Projects → project prerequisites → enrollment → progress → completion → certification. The certification layer is additive and does not change unrelated platform routes.

## Current architecture

- `types/course.ts` is the course contract. Lessons are grouped under modules (`units`) and may be lessons or quizzes.
- `lib/course-projects.ts` is the single catalog for the two ordered projects per course. A project is unlocked from its prerequisite module cutoff and is complete only when its persisted submission is complete.
- `lib/progress.ts` defines the portable progress snapshot. `lib/server-course-progress.ts` persists that snapshot in the D1 `learner_records` record with kind `course-progress`.
- Enrollment and lesson progress APIs authenticate through the ChatGPT identity headers and persist on the server. Local development supports the documented `agentlab-local-demo=1` cookie.
- `progressForCourse()` uses an 80/20 display score (lessons/projects), while its `complete` flag requires every lesson and both projects. Certification intentionally uses a stricter, independently recomputed item count.
- D1/Drizzle is the durable store. The certification tables are in `db/schema.ts` and migration `drizzle/0003_certification_foundation.sql`.

## Certification design

Eligibility is server-side and recomputed from the course catalog plus the server progress snapshot. The exact required set is:

1. Every course lesson is complete.
2. Every quiz lesson has a passing persisted quiz score (currently 60% or greater) and is complete.
3. Both assigned projects have status `COMPLETED` after their prerequisites are satisfied.
4. The learner is enrolled in the course.

The eligibility percentage is `floor(completed required items / total required items × 100)`. Issuance requires the numerator to equal the denominator; the percentage alone never grants access.

The lifecycle is `LOCKED`, `ELIGIBLE_TEMPLATE_PENDING`, `READY_TO_GENERATE`, `GENERATING`, `ISSUED`, `GENERATION_FAILED`, and `REVOKED`. The default local configuration has no final artwork/template, so a fully eligible learner is deliberately shown `ELIGIBLE_TEMPLATE_PENDING` and cannot receive a fake or incomplete credential.

## Findings and mitigations

| Finding | Risk | Mitigation |
| --- | --- | --- |
| Client local storage is useful for offline UX but is not authoritative | A modified browser could claim progress | Certification reads server D1 progress and recomputes all requirements |
| Lesson progress PATCH accepts a completion boolean | A client can mark a quiz complete | Certification additionally verifies the persisted quiz score and pass threshold |
| Existing historical `certificates` table is not part of the minimal integration schema | Legacy rows could have a different lifecycle | New `certificate_records` uses explicit states and immutable evidence snapshots; legacy table remains untouched |
| No production certificate renderer/artwork is supplied | Issuing a misleading file | Default template is unset; issue API refuses until a registered template exists |
| High-volume status checks can be repeated | Unnecessary D1 load | Responses are compact and can be cached at the edge only for public verification; private status remains user-scoped |

## Reusable integration contract

The certification domain is isolated in `lib/certification.ts`, server persistence in `lib/server-certification.ts`, and API/page components under the certification routes. A host platform can supply a template renderer implementing `CertificateTemplateRenderer` and a storage adapter without importing course-page internals.

Before enabling issuance in production, configure a template ID/version, register a renderer, bind durable storage, apply the migration, and add end-to-end tests for the renderer and download paths. Never accept learner-supplied credential IDs, completion totals, eligibility, or file URLs.

## Risks and assumptions

- The existing progress snapshot is retained as the integration boundary for compatibility with the course player.
- Existing course content is treated as the current course version. A production catalog should provide an explicit immutable version/hash before issuance is enabled.
- A 60% quiz pass mark is an assessment rule, not a certification completion threshold. Certification completion remains exactly 100% of required items.
- The local app can display the locked and template-pending flows without a D1 binding; issuance and durable identity confirmation require D1.
