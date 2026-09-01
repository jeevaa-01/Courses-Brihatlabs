# AgentLab Course Integration

This repository contains only the course-learning workflow:

`Course → Modules → Lessons → 2 Assigned Projects → Project Prerequisites → Enrollment → Progress → Completion`

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verify

```powershell
npm test
npm run lint
node_modules\.bin\tsc.cmd --noEmit
```

Course content is defined in `lib/course-data.ts`; the two assigned projects and prerequisite rules are in `lib/course-projects.ts`. Public catalog/curriculum GET APIs are cacheable. Learner enrollment, progress, workspace, and completion APIs require the current authenticated identity.
