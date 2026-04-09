# Mode: evaluate -- CFII Job Posting Evaluation

Scores a flight instructor job posting against Krystle's profile using 8 weighted dimensions. Produces a structured evaluation report.

## Input

Either:
- A URL to a job posting (navigate with Playwright, extract details)
- Pasted job description text
- A school name from `config/portals.yml` (look up details + evaluate fit)

## Execution Steps

1. **Extract posting details:**
   - If URL: navigate with Playwright, `browser_snapshot` to read content
   - If text: parse directly
   - If school name: read from `config/portals.yml` + WebSearch for current openings

2. **Read context:**
   - `cv.md` (Krystle's qualifications)
   - `config/profile.yml` (hours, certs, targets, preferences)
   - `modes/_profile.md` (narrative, strengths)
   - `config/portals.yml` (school details if known)

3. **Research the school** (quick -- don't spend too long):
   - WebSearch: "{school name} flight instructor reviews"
   - Check if school is in `config/portals.yml` for pre-loaded data
   - Note fleet, reputation, student volume

4. **Score on 8 dimensions** (see `modes/_shared.md` for scoring rubric)

5. **Generate report** (see format below)

6. **Write report** to `reports/{###}-{school-slug}-{YYYY-MM-DD}.md`

7. **Write tracker addition** to `batch/tracker-additions/{num}-{school-slug}.tsv`

## Report Format

```markdown
# {School Name} -- {Position Title}

**Score: {X.X}/5 ({Grade})**
**URL:** {url}
**Date:** {YYYY-MM-DD}
**Airport:** {code} ({name})
**Distance:** {X} min from East Point

---

## Block A: Posting Summary

| Field | Value |
|-------|-------|
| School | {name} |
| Airport | {code} |
| Position | {title} |
| Type | Full-time / Part-time / Contract |
| Pay | ${X}/hr (if known) |
| Part 61/141 | {type} |
| Fleet | {aircraft types} |
| Contact | {phone/email} |

## Block B: Hours & Pay Analysis

- **Expected flight hours/month:** {X}
- **Ground instruction (paid?):** Yes/No, ${X}/hr
- **Estimated monthly income:** ${X}
- **Months to build 300 hours at this pace:** {X}
- **Projected ATP date:** {YYYY-MM}
- **Comparison to rental:** At this job, she earns ${X}/mo. Renting at $75/hr would cost ${X}/mo. Net advantage: ${X}/mo.

## Block C: Fit Assessment

**Strengths:**
- {What makes Krystle a fit for this role}

**Gaps:**
- {Any requirements she doesn't meet}

**Red Flags:**
- {Concerning details about the school or posting}

## Block D: Distance & Logistics

- **Drive time:** {X} min from 3351 Bachelor St, East Point
- **Route:** {highway or surface streets}
- **Early morning feasibility:** {assessment}

## Block E: School Research

- **Google rating:** {X}/5 ({N} reviews)
- **AOPA recognition:** {if any}
- **Student volume:** {estimate}
- **Instructor count:** {known or estimated}
- **Fleet size:** {N} aircraft
- **Airline pathway:** {Delta Propel, ATP partnership, etc.}
- **Turnover signal:** {do instructors stay or leave quickly?}

## Block F: Application Strategy

**How to apply:** {online form / email / phone call / walk-in}
**Key contacts:** {chief instructor, owner name if found}
**Resume emphasis:** {what to highlight for this specific school}
**Cover letter angle:** {personalized hook}

---

## Dimension Scores

| Dimension | Weight | Score | Notes |
|-----------|--------|-------|-------|
| Pay Rate | 25% | {X}/5 | {brief note} |
| Hours Potential | 25% | {X}/5 | {brief note} |
| Distance | 15% | {X}/5 | {brief note} |
| Fleet Quality | 10% | {X}/5 | {brief note} |
| Schedule Flex | 10% | {X}/5 | {brief note} |
| School Reputation | 5% | {X}/5 | {brief note} |
| Student Pipeline | 5% | {X}/5 | {brief note} |
| Benefits/Perks | 5% | {X}/5 | {brief note} |
| **GLOBAL** | 100% | **{X.X}/5** | |

## Recommendation

{APPLY / CONTACT FIRST / SKIP}

{1-2 sentence recommendation with reasoning}
```

## Scoring Guidelines

### Pay Rate (25%)
- 5: $50+/hr for flight + ground
- 4: $40-49/hr
- 3: $30-39/hr
- 2: $20-29/hr
- 1: Under $20/hr, unpaid, or "stipend only"
- If pay is unlisted, score 3 and note "unconfirmed"

### Hours Potential (25%)
- 5: 60+ hrs/month guaranteed, full student load
- 4: 40-59 hrs/month, busy school
- 3: 20-39 hrs/month, moderate activity
- 2: 10-19 hrs/month, part-time or slow school
- 1: Under 10 hrs/month, or "as needed"

### Distance (15%)
- 5: Under 15 min (KFTY)
- 4: 15-25 min (KFFC, KPDK, KHMP)
- 3: 25-35 min (KRYY, KCCO)
- 2: 35-45 min (KLZU, KCTJ)
- 1: Over 45 min (KGVL)

### Fleet Quality (10%)
- 5: Modern glass cockpit (G1000+), diverse fleet, well-maintained
- 4: Mix of glass and steam, multiple aircraft types
- 3: Standard six-pack gauges, adequate fleet
- 2: Older aircraft, small fleet (1-2 planes)
- 1: Unknown/questionable maintenance, single old aircraft

### Schedule Flex (10%)
- 5: Fly any day of the week including evenings/weekends, set own schedule
- 4: 6 days/week, some evening/weekend availability
- 3: Standard business hours, 5 days/week
- 2: Limited to specific days/times
- 1: Very restricted schedule, minimal availability

### School Reputation (5%)
- 5: AOPA Distinguished, Part 141, airline pathway, nationally recognized
- 4: Well-established (10+ years), good reviews, Part 141
- 3: Decent reputation, Part 61, adequate reviews
- 2: New school or mixed reviews
- 1: Bad reviews, safety concerns, unknown

### Student Pipeline (5%)
- 5: Waitlist for students, constantly busy, multiple instructors all flying
- 4: Steady student flow, rarely idle
- 3: Average student volume
- 2: Slow periods common
- 1: Very few students, instructor often sitting idle

### Benefits/Perks (5%)
- 5: Health insurance + free flight time + airline pathway + checkride discounts
- 4: Some benefits (insurance or flight time)
- 3: Basic employment perks
- 2: 1099 contractor, no benefits
- 1: Nothing beyond hourly pay
