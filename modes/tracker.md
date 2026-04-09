# Mode: tracker -- Application Status Dashboard

Display a summary of all tracked applications from `data/applications.md`.

## Execution

1. **Read `data/applications.md`**
2. **Read `config/profile.yml`** for current hours and target
3. **Read `data/budget.yml`** for financial context

4. **Display dashboard:**

```
CFII Job Search Dashboard -- {YYYY-MM-DD}
==========================================
Hours: {current} / 1,500 ({remaining} to go)
Cash: ${remaining} | Runway: {months} months at ${burn}/mo
Apps sent: {N} | Interviews: {N} | Offers: {N}

BY STATUS:
  Evaluated:  {N} postings scored but not yet applied
  Applied:    {N} applications sent
  Contacted:  {N} cold outreach sent
  Responded:  {N} schools responded
  Interview:  {N} interviews scheduled/completed
  Offer:      {N} offers received
  Hired:      {N} currently working
  Rejected:   {N}
  Passed:     {N} declined by us
  SKIP:       {N} not worth pursuing

TOP OPPORTUNITIES (score >= 4.0):
| # | Score | School | Role | Status | Pay | Distance | Notes |
|---|-------|--------|------|--------|-----|----------|-------|
{filtered and sorted rows}

RECENT ACTIVITY (last 7 days):
{list of status changes, new evaluations, new applications}

PENDING ACTIONS:
- {N} postings in pipeline awaiting evaluation
- {N} evaluated postings not yet applied to (score >= 4.0)
- {N} applications with no response after 7+ days (follow up?)

NEXT STEPS:
{prioritized recommendations based on current state}
```

5. **Smart recommendations based on state:**
   - If 0 applications sent: "Start applying! Your top-scored opportunity is {school}."
   - If applications sent but no responses: "Consider following up with {school} -- applied {N} days ago."
   - If interviews scheduled: "Prep for {school} interview. Run `/flight-school-jobs deep {school}` for research."
   - If offers received: "Compare offers with `/flight-school-jobs compare`."
   - If no new scans in 3+ days: "Run `/flight-school-jobs scan` to check for new openings."
