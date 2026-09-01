# Course Integration Deployment

## Workflow surface

The deployable surface is limited to:

`Course → Modules → Lessons → 2 Assigned Projects → Project Prerequisites → Enrollment → Progress → Completion`

Runtime pages are `/`, `/courses`, `/courses/:slug`, `/dashboard`, `/login`, and protected `/learn/:course/:module/:lesson`. Runtime APIs are under `/api/courses`, `/api/lessons`, `/api/projects`, `/api/users/me/enrollments`, and `/api/learner-state`, plus `/api/health` and `/api/ready`.

## Local

Certification is the final course milestone. Its protected page is `/courses/:slug/certification`, its public verification page is `/verify/:credentialId`, and the public verification API is `/api/certificates/:credentialId/verify`.

```powershell
npm install
npm test
npm run lint
node_modules\.bin\tsc.cmd --noEmit
npm run dev
```

## Cloudflare Worker

The Worker entry point is `worker/index.ts`. Configure the D1 binding `DB` and the `ASSETS` binding in the hosting environment. ChatGPT identity headers are required for enrollment, progress, project workspace, and completion writes. Apply the existing reviewed D1 migrations before testing persistence.

Public course catalog and curriculum responses use edge-cacheable headers. Personalized learner responses use `private, no-store`. Before a high-volume release, load-test public GET traffic separately from D1-backed learner writes, confirm D1 quotas/backups, and verify `/api/health`, `/api/ready`, enrollment, lesson progress, prerequisite locking, project completion, and course completion.

Before enabling certificate issuance, apply `drizzle/0003_certification_foundation.sql`, configure a versioned course template, and register its renderer as described in `docs/CERTIFICATE_TEMPLATE_INTEGRATION.md`. The local default deliberately keeps issuance template-pending until those production inputs exist.

Production deployment is not run from this workspace because it requires the target Cloudflare account, D1 database, identity configuration, certificate renderer/storage, and release approval.
