// ============================================================
//  HitaVirTech — Student Access Allowlist (Learning Portal)
//  ------------------------------------------------------------
//  THIS IS THE ONLY FILE YOU EDIT TO CONTROL WHO GETS IN.
//
//  • Add a student:    add their Gmail to the right batch array.
//  • Remove a student: delete their line (takes effect on their
//                      NEXT page load — no waiting for a session
//                      to expire).
//  • New cohort:       add a new "B6-...": [ ... ] block.
//
//  After editing: commit + push. Cloudflare Pages redeploys
//  automatically and the change is live in ~1 minute.
//
//  Email case, dots, and +tags are ignored automatically, so
//  you do NOT need to match the exact spelling a student uses.
//
//  NOTE: this list mirrors the codelabs allowlist so the same
//  students carry over to the PySpark course. Keep the two in
//  sync when you add/remove a student.
// ============================================================

export const BATCHES = {
  "B5-April-2026": [
    "adhyatmahawale1008@gmail.com",
    "khushiklad24@gmail.com",
    "vinayakard0204@gmail.com",
    "nrekha022@gmail.com",
    "spoortishekhargol@gmail.com",
    "omkar6467@gmail.com",
    "sairajwadkar0007@gmail.com",
    "saracuwic@gmail.com",
    "shraddhanemagoudar2003@gmail.com",
    "kamateradhika@gmail.com",
    "rahulshashidhar7@gmail.com",
    "dayanandhatti01@gmail.com",
    "jeevankoulapure@gmail.com",
    "shwetahuvannavar108@gmail.com",
    "shitalkumbhar930@gmail.com",
    "shreshthianeesh@gmail.com",
    "sprahul8005@gmail.com",
    "abhishekkhichade7272@gmail.com",
    "kumbharshubham700@gmail.com",
    "parthshinge@gmail.com",
    "vishwanathchinchale18@gmail.com",
    "nishasorallikar@gmail.com",
    "patilninganagouda100@gmail.com",
    "satishsavadatti1998@gmail.com",
    "ashagorobal1998@gmail.com",
    "pooja.sb934@gmail.com",
    "mahimokhashi96@gmail.com",
    "bhavanargowda0128@gmail.com",
  ],

  // Batch 4 — previous cohort, full access.
  "B4": [
    "Shruthikkr2009@gmail.com",
    "nbalagavi@gmail.com",
    "shimpukadesahil@gmail.com",
    "powarharsh07@gmail.com",
    "rutik17koli@gmail.com",
    "yogeshawate153@gmail.com",
    "wagawadeabhinav@gmail.com",
    "pmalappavpujari@gmail.com",
    "aniketharale12@gmail.com",
    "moreamit7887@gmail.com",
    "shivarajpp18@gmail.com",
    "meenakshitas25@gmail.com",
    "sonalipawar187@gmail.com",
    "prashantsasane05@gmail.com",
    "shubham195pawar@gmail.com",
    "koleavadhut@gmail.com",
    "sharathpujari952@gmail.com",
    "moreshripati28@gmail.com",
    "indrajitawate1999@gmail.com",
    "shashidhark021@gmail.com",
    "patilvishwajit707@gmail.com",
    "ayushkole95@gmail.com",
    "babugoudapatil06@gmail.com",
    "anuprpatil555@gmail.com",
    "onlyvishaldat@gmail.com",
    "nagarajpatil654@gmail.com",
    "kartikkamate00@gmail.com",
  ],

  // To start the next cohort, copy the block above and rename:
  // "B6-July-2026": [
  //   "newstudent@gmail.com",
  // ],
};

// Admins always have access, regardless of batch (you + co-trainers).
export const ADMINS = [
  "iamawannadole@gmail.com",
];

// Shown to denied users so they know who to contact.
export const ADMIN_CONTACT = "iamawannadole@gmail.com";

// Sections of the course restricted to specific cohorts. Key = URL path prefix,
// value = the batch keys (from BATCHES above) allowed to open it. Admins always
// get in. Anything not listed here stays open to every allowlisted student.
//
// Cohort locks carried over from the old codelabs site: the AWS/Azure
// analytics tracks and data modelling are alumni (B4) content; the
// Data Engineering on AWS track is open to both cohorts.
export const RESTRICTED_PATHS = {
  "/courses/aws-analytics-part2": ["B4"],
  "/courses/azure-analytics-part1": ["B4"],
  "/courses/azure-analytics-part2": ["B4"],
  "/courses/data-modelling": ["B4"],
};

// ---- lookup (do not edit below) ----------------------------------
import { normalizeEmail } from "./_auth.js";

const _allowed = new Set(
  [...Object.values(BATCHES).flat(), ...ADMINS].map(normalizeEmail)
);

export function isAllowed(email) {
  return _allowed.has(normalizeEmail(email));
}

const _adminSet = new Set(ADMINS.map(normalizeEmail));

// Per-section cohort restriction, layered on top of the site-wide allowlist.
// Returns true if `email` may open `pathname`. Admins always may; paths not
// listed in RESTRICTED_PATHS are open to everyone already on the allowlist.
export function canAccessPath(email, pathname) {
  const e = normalizeEmail(email);
  if (_adminSet.has(e)) return true;
  for (const prefix in RESTRICTED_PATHS) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return RESTRICTED_PATHS[prefix].some((b) =>
        (BATCHES[b] || []).map(normalizeEmail).includes(e)
      );
    }
  }
  return true;
}
