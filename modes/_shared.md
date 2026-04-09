# System Context -- flight-school-jobs

<!-- ============================================================
     THIS FILE IS AUTO-UPDATABLE. Don't put personal data here.
     
     Krystle's customizations go in modes/_profile.md.
     This file contains system rules, scoring logic, and tool config.
     ============================================================ -->

## Sources of Truth

| File | Path | When |
|------|------|------|
| cv.md | `cv.md` (project root) | ALWAYS |
| article-digest.md | `article-digest.md` (if exists) | ALWAYS (flight experience detail) |
| profile.yml | `config/profile.yml` | ALWAYS (certs, hours, targets) |
| _profile.md | `modes/_profile.md` | ALWAYS (narrative, strengths, proof points) |

**RULE: NEVER hardcode flight hours or certifications.** Read them from cv.md + config/profile.yml at evaluation time.
**RULE: Read _profile.md AFTER this file. User customizations in _profile.md override defaults here.**

---

## CFII Job Scoring System (8 Dimensions)

Each posting is scored 1-5 on these dimensions, then weighted for a global score:

| Dimension | Weight | 5 (Best) | 3 (Average) | 1 (Worst) |
|-----------|--------|----------|-------------|-----------|
| **Pay Rate** | 25% | $50+/hr (flight + ground) | $30-40/hr | Under $20/hr or unpaid |
| **Hours Potential** | 25% | 60+ hrs/month, full schedule | 30-40 hrs/month | Under 15 hrs/month, sporadic |
| **Distance** | 15% | Under 15 min from East Point | 25-35 min | Over 50 min |
| **Fleet Quality** | 10% | Modern avionics (G1000+), well-maintained | Standard six-pack, decent fleet | Old/poorly maintained, single aircraft |
| **Schedule Flex** | 10% | 6-7 days/week available, evenings/weekends | Standard business hours only | Rigid limited schedule |
| **School Reputation** | 5% | AOPA honored, Part 141, airline pathway, high student volume | Established Part 61, decent reviews | Unknown, no web presence, complaints |
| **Student Pipeline** | 5% | Waitlist for students, multiple instructors busy | Steady student flow | Few students, instructor sitting idle |
| **Benefits/Perks** | 5% | Insurance, free flight time, airline pathway, checkride discounts | Some perks | Nothing beyond hourly pay |

### Score Interpretation

- **4.5+** -> Apply immediately. This is ideal -- high pay, lots of hours, close to home.
- **4.0-4.4** -> Strong fit. Apply soon, this checks most boxes.
- **3.5-3.9** -> Decent opportunity. Apply if nothing better is available.
- **Below 3.5** -> Skip unless desperate. Low pay, bad commute, or limited hours.

### Distance Reference (from 3351 Bachelor St, East Point, GA 30344)

| Airport | Distance | Drive Time |
|---------|----------|------------|
| KFTY (Fulton County) | ~8 mi | ~10 min |
| KFFC (Falcon Field) | ~25 mi | ~25 min |
| KPDK (DeKalb-Peachtree) | ~20 mi | ~25 min |
| KHMP (Hampton/Speedway) | ~25 mi | ~25 min |
| KRYY (McCollum/Kennesaw) | ~28 mi | ~30 min |
| KCCO (Newnan) | ~30 mi | ~30 min |
| KLZU (Briscoe/Lawrenceville) | ~35 mi | ~40 min |
| KCTJ (Carrollton) | ~50 mi | ~45 min |
| KGVL (Gainesville) | ~65 mi | ~60 min |

### Employment Type Classification

| Type | Description | Typical Pay | Hours/Month |
|------|-------------|-------------|-------------|
| **Full-time Employee** | W-2, set schedule, benefits possible | $25-45/hr | 60-80 |
| **Part-time Employee** | W-2, flexible schedule | $20-35/hr | 20-40 |
| **Independent Contractor** | 1099, set own rates, find own students | $50-80/hr charged | Variable |
| **Part 141 Instructor** | Structured curriculum, standardized | $30-45/hr | 40-60 |
| **Part 61 Instructor** | Flexible curriculum, more autonomy | $20-35/hr | Variable |

---

## Evaluation Report Format (6 Blocks)

### Block A: Posting Summary
- School name, airport, distance from home
- Position title, employment type (FT/PT/contract)
- Pay rate (if listed), estimated hours/month
- Fleet (aircraft types)
- Part 61 vs Part 141

### Block B: Hours & Pay Analysis
- Expected flight hours per week/month
- Ground instruction hours (if paid)
- Estimated monthly income
- How many months to build 300 hours at this pace
- Projected ATP date

### Block C: Fit Assessment
- How well Krystle's CFII cert matches the requirements
- Any gaps (multi-engine? specific endorsements? experience level?)
- What she brings that other candidates might not
- Red flags (low pay, bad reviews, aircraft condition)

### Block D: Distance & Logistics
- Drive time from East Point
- Highway vs surface streets
- Early morning / late evening commute feasibility
- Multiple location requirements?

### Block E: School Research
- Google reviews, AOPA ratings
- Student volume, number of instructors
- Fleet size and condition
- Airline pathways (Delta Propel, ATP partnerships)
- Instructor turnover (do people stay or leave fast?)

### Block F: Application Strategy
- Best way to apply (online, email, walk-in, phone call)
- What to emphasize in resume/cover letter
- Key contacts (chief instructor, owner)
- Interview tips specific to this school

---

## Global Rules

### NEVER
1. Invent flight hours, ratings, or endorsements
2. Modify cv.md directly
3. Submit applications without user review
4. Recommend accepting below $20/hr unless there's a strong strategic reason
5. Ignore the tracker -- every evaluated posting gets registered
6. Use corporate-speak in resumes or cover letters

### ALWAYS
1. Read cv.md and config/profile.yml before evaluating
2. Read _profile.md for narrative and proof points
3. Check distance from East Point for every posting
4. Calculate projected ATP timeline for each opportunity
5. Register in tracker after evaluating
6. Be direct and actionable -- every dollar and every hour matters
7. Flag any posting where details seem suspiciously good (scam check)
8. Note if a school has been contacted before (check applications.md)

### Tools

| Tool | Use |
|------|-----|
| WebSearch | School research, pay rates, reviews, fleet info |
| WebFetch | Extract job posting details from static pages |
| Playwright | Verify postings, scan career pages, fill application forms |
| Read | cv.md, _profile.md, config files, data files |
| Write | Reports, temporary HTML for PDF, tracker additions |
| Edit | Update tracker entries |
| Bash | `node generate-pdf.mjs` |

---

## Professional Writing Rules (Resumes & Cover Letters)

### Aviation-specific guidance
- Lead with certifications: CFII, CFI, Commercial, Instrument
- Total flight hours prominent in header or summary
- Specific aircraft types with hours in each
- Safety record emphasis
- Teaching philosophy in 1-2 sentences

### Avoid
- "Passionate about aviation" (everyone says this)
- "Detail-oriented" (show it, don't say it)
- Generic cover letters -- each one must reference the specific school and fleet

### Include
- Specific hour counts (total, PIC, dual given, instrument, cross-country)
- Aircraft types flown and taught in
- Endorsements given
- Pass rates for students (if known)
- Availability -- immediately, full-time, flexible schedule
