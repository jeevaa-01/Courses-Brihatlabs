# Certificate template integration contract

The course app owns eligibility, identity confirmation, credential IDs, evidence snapshots, and public verification. A template integration owns only rendering approved data into a final artifact.

## Required configuration

Each course may have one `course_certification_settings` record:

| Field | Meaning |
| --- | --- |
| `enabled` | Whether the course offers certification |
| `required_completion_percentage` | Must remain `100` for this workflow |
| `eligibility_rule` | Must remain `all-required-items` |
| `template_id` / `template_version` | Versioned renderer contract; both are required to enable issuance |
| `issuer_name` / `issuer_title` | Issuer text supplied by the platform |
| `verification_enabled` | Enables public verification links |
| `pdf_enabled` / `png_enabled` | Output types actually produced by the renderer |

## Typed renderer contract

```ts
type CertificateTemplateData = {
  credentialId: string;
  recipientDisplayName: string;
  courseTitle: string;
  issuerName: string;
  issuerTitle: string | null;
  issuedAt: string;
  verificationUrl: string;
  courseVersion: string;
  completedRequiredItems: number;
  totalRequiredItems: number;
};

type CertificateTemplateRenderer = (data: CertificateTemplateData) => Promise<{
  pdfStoragePath?: string;
  pngStoragePath?: string;
  contentHash: string;
}>;
```

The application must construct this data server-side from the verified identity, course catalog, and evidence snapshot. The renderer must not query client state or make eligibility decisions. Storage paths are private implementation details and must not be accepted from a browser.

## Generation and idempotency

`POST /api/courses/:id/certification/issue` requires a server-authenticated learner, a confirmed name, exact eligibility, a configured template, and an `Idempotency-Key`. The unique `(user_id, course_id)` and credential indexes make retries safe. A retry returns the existing issued record rather than creating a second credential.

The generated record stores the course-version identifier, required-item counts, progress evidence snapshot, template version, timestamps, output paths, and content hash. These fields are the audit boundary for future catalog changes.

## Verification

`GET /api/certificates/:credentialId/verify` is public and returns only safe verification fields: validity/status, credential ID, recipient name, course title, issuer, issue date, course version, and template version. It never returns email addresses, raw progress, internal storage paths, or authentication data. Revoked credentials remain discoverable with `valid: false` and `status: REVOKED`.

## Enablement checklist

1. Apply the certification migration to the target D1 database.
2. Register a stable renderer for the template ID/version.
3. Configure output storage and verify access controls.
4. Enable PDF/PNG only for formats the renderer creates.
5. Test locked, 99%, exact 100%, duplicate retry, renderer failure, revoke, and public verification cases.
6. Do not ship final artwork or platform branding as part of the integration foundation.
