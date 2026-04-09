# Flight School Jobs -- CFII Job Search & Hour-Building Command Center

## Origin

This system is built for Krystle, a CFII building toward 1,500 ATP minimums. It automates the job hunt across 30+ Atlanta-area flight schools, evaluates opportunities on 8 dimensions specific to time-building CFIIs, generates tailored resumes, and tracks the budget runway.

Adapted from [career-ops](https://github.com/santifer/career-ops) by santifer.

## Data Contract (CRITICAL)

**User Layer (NEVER auto-updated, personalization goes HERE):**
- `cv.md`, `config/profile.yml`, `modes/_profile.md`, `article-digest.md`
- `data/*`, `reports/*`, `output/*`, `interview-prep/*`

**System Layer (auto-updatable, DON'T put user data here):**
- `modes/_shared.md`, all other `modes/*.md`
- `CLAUDE.md`, `*.mjs` scripts, `templates/*`, `batch/*`

**THE RULE: When customizing anything (narrative, proof points, strengths, availability), ALWAYS write to `modes/_profile.md` or `config/profile.yml`. NEVER edit `modes/_shared.md` for user-specific content.**

## What is flight-school-jobs

AI-powered CFII job search automation built on Claude Code: portal scanning, offer evaluation, resume generation, application tracking, and budget burndown analysis. Focused on getting Krystle hired as a CFII at flight schools in metro Atlanta so she gets **paid to fly** rather than paying to rent.

### Main Files

| File | Function |
|------|----------|
| `data/applications.md` | Application tracker |
| `data/pipeline.md` | Inbox of pending URLs |
| `data/scan-history.tsv` | Scanner dedup history |
| `data/budget.yml` | Budget and financial data |
| `data/rental-rates.md` | Aircraft rental comparison |
| `config/portals.yml` | Flight schools + job boards to scan |
| `config/profile.yml` | Krystle's identity, certs, hours |
| `cv.md` | Canonical resume |
| `templates/cv-template.html` | HTML template for resumes |
| `generate-pdf.mjs` | Playwright: HTML to PDF |
| `reports/` | Evaluation reports (`{###}-{school-slug}-{YYYY-MM-DD}.md`) |

### First Run -- Onboarding

Before doing ANYTHING else, check if the system is set up. Run these checks silently:

1. Does `cv.md` exist and have content?
2. Does `config/profile.yml` exist?
3. Does `modes/_profile.md` exist?

**If `cv.md` is missing or empty:**
> "I need Krystle's resume to get started. You can either:
> 1. Paste her resume here and I'll format it
> 2. Tell me about her experience and I'll draft it
>
> Which do you prefer?"

**If `config/profile.yml` needs updates:**
> "I need a few details to fill in the profile:
> - Krystle's full name, email, phone
> - Current flight hour breakdown (total, PIC, dual given, instrument, cross-country)
> - Any aircraft type ratings or endorsements"

**After setup, confirm:**
> "All set! You can now:
> - `/flight-school-jobs scan` to search all Atlanta flight schools for openings
> - `/flight-school-jobs budget` to see cash runway and scenarios
> - Paste a job URL to evaluate it
> - `/flight-school-jobs` to see all commands"

### Skill Modes

| If the user... | Mode |
|----------------|------|
| Pastes JD or URL | auto-pipeline (evaluate + report + tracker) |
| Asks to scan for jobs | `scan` |
| Asks to evaluate a posting | `evaluate` |
| Wants resume/CV generated | `pdf` |
| Asks about application status | `tracker` |
| Wants to process pending URLs | `pipeline` |
| Fills out application form | `apply` |
| Wants cold outreach help | `contact` |
| Researches a specific school | `deep` |
| Compares multiple offers | `compare` |
| Asks about budget/money/runway | `budget` |

### CV Source of Truth

- `cv.md` in project root is the canonical resume
- `article-digest.md` has detailed proof points (optional)
- **NEVER hardcode metrics** -- read them from these files at evaluation time

---

## Ethical Use -- CRITICAL

- **NEVER submit an application without user review.** Fill forms, draft answers, generate PDFs -- but always STOP before clicking Submit/Send/Apply.
- **Be honest about qualifications.** Never invent flight hours, ratings, or endorsements.
- **Respect schools' time.** Only recommend applying where there's genuine fit.

---

## Stack and Conventions

- Node.js (mjs modules), Playwright (PDF + scraping), YAML (config), HTML/CSS (template), Markdown (data)
- Output in `output/` (gitignored), Reports in `reports/`
- Report numbering: sequential 3-digit zero-padded, max existing + 1
- **RULE: After each batch of evaluations, run `node merge-tracker.mjs`**
- **RULE: NEVER create new entries in applications.md if school+role already exists.** Update the existing entry.

### TSV Format for Tracker Additions

Write one TSV file per evaluation to `batch/tracker-additions/{num}-{school-slug}.tsv`. Single line, 9 tab-separated columns:

```
{num}\t{date}\t{school}\t{role}\t{status}\t{score}/5\t{pdf_emoji}\t[{num}](reports/{num}-{slug}-{date}.md)\t{note}
```

**Column order (status BEFORE score):**
1. `num` -- sequential number
2. `date` -- YYYY-MM-DD
3. `school` -- school name
4. `role` -- job title
5. `status` -- canonical status
6. `score` -- format `X.X/5`
7. `pdf` -- checkmark or x
8. `report` -- markdown link
9. `notes` -- one-line summary

### Pipeline Integrity

1. **NEVER edit applications.md to ADD new entries** -- Write TSV in `batch/tracker-additions/` and `merge-tracker.mjs` handles the merge.
2. **YES you can edit applications.md to UPDATE status/notes of existing entries.**
3. All reports MUST include `**URL:**` in the header.
4. All statuses MUST be canonical (see `templates/states.yml`).
5. Health check: `node verify-pipeline.mjs`

### Canonical States

| State | When to use |
|-------|-------------|
| `Evaluated` | Report completed, pending decision |
| `Applied` | Application sent |
| `Contacted` | Cold outreach sent (email, phone, walk-in) |
| `Responded` | School responded |
| `Interview` | Interview scheduled or completed |
| `Offer` | Offer received |
| `Hired` | Accepted and started |
| `Rejected` | Rejected by school |
| `Passed` | Candidate passed on the opportunity |
| `SKIP` | Doesn't fit, don't apply |
