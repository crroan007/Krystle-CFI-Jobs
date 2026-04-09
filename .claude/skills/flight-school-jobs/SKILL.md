---
name: flight-school-jobs
description: CFII job search command center -- scan flight schools, evaluate postings, generate resumes, track applications, budget planning
user_invocable: true
args: mode
---

# flight-school-jobs -- Router

## Mode Routing

Determine the mode from `{{mode}}`:

| Input | Mode |
|-------|------|
| (empty / no args) | `discovery` -- Show command menu |
| JD text or URL (no sub-command) | **`auto-pipeline`** |
| `scan` | `scan` |
| `evaluate` | `evaluate` |
| `pdf` | `pdf` |
| `tracker` | `tracker` |
| `pipeline` | `pipeline` |
| `apply` | `apply` |
| `contact` | `contact` |
| `deep` | `deep` |
| `compare` | `compare` |
| `budget` | `budget` |

**Auto-pipeline detection:** If `{{mode}}` is not a known sub-command AND contains JD text (keywords: "flight instructor", "CFI", "CFII", "responsibilities", "requirements", "qualifications") or a URL to a posting, execute `auto-pipeline`.

If `{{mode}}` is not a sub-command AND doesn't look like a JD, show discovery.

---

## Discovery Mode (no arguments)

Show this menu:

```
flight-school-jobs -- Command Center

Krystle's CFII Job Search | 1,200 / 1,500 hrs | 300 to go

Available commands:
  /flight-school-jobs {JD}       -> EVALUATE: score + report + tracker (paste text or URL)
  /flight-school-jobs scan       -> Scan 30+ Atlanta flight schools for openings
  /flight-school-jobs evaluate   -> Score a specific job posting (8 dimensions)
  /flight-school-jobs pdf        -> Generate tailored CFII resume + cover letter
  /flight-school-jobs tracker    -> Application status overview
  /flight-school-jobs pipeline   -> Process pending URLs from inbox
  /flight-school-jobs apply      -> Fill application forms
  /flight-school-jobs contact    -> Draft cold outreach to a school
  /flight-school-jobs deep       -> Deep research a specific flight school
  /flight-school-jobs compare    -> Side-by-side comparison of offers
  /flight-school-jobs budget     -> Budget burndown + scenario projections

Inbox: add URLs to data/pipeline.md -> /flight-school-jobs pipeline
Or paste a job posting URL directly to evaluate it.
```

---

## Context Loading by Mode

After determining the mode, load the necessary files before executing:

### Modes that require `_shared.md` + their mode file:
Read `modes/_shared.md` + `modes/{mode}.md`

Applies to: `auto-pipeline`, `evaluate`, `pdf`, `apply`, `pipeline`, `scan`, `contact`

### Standalone modes (only their mode file):
Read `modes/{mode}.md`

Applies to: `tracker`, `deep`, `compare`, `budget`

### Auto-pipeline execution:
1. Read `modes/_shared.md` + `modes/evaluate.md`
2. Read `cv.md`, `config/profile.yml`, `modes/_profile.md`
3. Evaluate the posting on 8 dimensions
4. Generate report in `reports/`
5. Write TSV to `batch/tracker-additions/`
6. Ask user if they want a tailored resume (`pdf` mode)

### Modes delegated to subagent:
For `scan` and `pipeline` (3+ URLs): launch as Agent with the content of `_shared.md` + `modes/{mode}.md` injected into the subagent prompt.

```
Agent(
  subagent_type="general-purpose",
  prompt="[content of modes/_shared.md]\n\n[content of modes/{mode}.md]\n\n[invocation-specific data]",
  description="flight-school-jobs {mode}"
)
```

Execute the instructions from the loaded mode file.
