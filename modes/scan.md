# Mode: scan -- Flight School Job Scanner

Scans 30+ Atlanta-area flight school career pages, job boards, and Craigslist for CFI/CFII openings. Filters by relevance and adds new postings to the pipeline for evaluation.

## Recommended Execution

Run as a subagent to preserve main context:

```
Agent(
    subagent_type="general-purpose",
    prompt="[content of this file + portals.yml data]",
    run_in_background=True
)
```

## Configuration

Read `config/portals.yml` which contains:
- `tracked_schools`: Flight schools with career page URLs, sorted by distance from East Point
- `job_boards`: Aviation job board URLs to scrape
- `personal_ads`: Craigslist RSS feeds for gigs and personal ads
- `title_filter`: Keywords for filtering relevant postings

## Scanning Strategy (3 Tiers)

### Tier 1 -- Flight School Career Pages (PRIMARY)

For each school in `tracked_schools` with `enabled: true`:
1. Navigate to `careers_url` with Playwright (`browser_navigate` + `browser_snapshot`)
2. Look for any job listings, "Now Hiring" notices, or instructor openings
3. Extract: title, URL, school name, any pay/schedule info visible
4. If page has no explicit job listings, note whether there's a "Contact Us" or "Join Our Team" link

**Many flight schools don't have formal job boards.** Instead look for:
- "Now Hiring" banners or text
- "Join Our Team" pages
- "Become an Instructor" sections
- Contact forms with "Employment Inquiry" options
- Even just a general contact page (worth a cold outreach)

If `careers_url` returns 404 or doesn't load, try the school's main domain and look for careers/jobs/hiring links.

### Tier 2 -- Aviation Job Boards (COMPLEMENTARY)

For each board in `job_boards`:
- **JSfirm**: Navigate to URL, scrape job listings. Filter for Georgia/Atlanta.
- **Pilot Career Center**: Navigate and extract listings.
- **PDK Airport Jobs**: Navigate and extract listings.
- **Avjobs**: Navigate and extract listings.
- **Skyfarer Academy**: Check for independent instructor opportunities.

### Tier 3 -- Craigslist RSS & Personal Ads (BROAD DISCOVERY)

For each feed in `personal_ads`:
- Fetch the RSS URL with WebFetch
- Parse XML for new postings
- These often catch individuals looking for flight instruction privately
- Mark as `post_type: personal_ad` in pipeline

**Craigslist search terms to use:**
- "flight instructor"
- "CFI" / "CFII"
- "flight lessons" / "flight training"
- "learn to fly"
- "instrument training"

## Workflow

1. **Read configuration**: `config/portals.yml`
2. **Read history**: `data/scan-history.tsv` for URLs already seen
3. **Read dedup sources**: `data/applications.md` + `data/pipeline.md`

4. **Tier 1 scan** (sequential -- one Playwright session):
   For each school with `enabled: true`:
   a. `browser_navigate` to `careers_url`
   b. `browser_snapshot` to read content
   c. Extract any job postings or hiring signals
   d. If hiring signal found but no formal listing, create a "cold outreach" entry

5. **Tier 2 scan** (can run WebFetch in parallel):
   For each job board:
   a. Fetch or navigate to the URL
   b. Extract listings matching title_filter
   c. Accumulate candidates

6. **Tier 3 scan** (RSS feeds -- fast):
   For each RSS feed:
   a. WebFetch the RSS URL
   b. Parse for new entries
   c. Mark post_type as personal_ad

7. **Filter by title** using `title_filter`:
   - At least 1 keyword from `positive` must appear (case-insensitive)
   - 0 keywords from `negative` may appear

8. **Deduplicate** against:
   - `scan-history.tsv` -- exact URL match
   - `applications.md` -- school + role already tracked
   - `pipeline.md` -- URL already pending

9. **For each new posting that passes filters**:
   a. Add to `data/pipeline.md` under "Pending": `- [ ] {url} | {school} | {title} | {airport} | {distance}min`
   b. Register in `data/scan-history.tsv`: `{url}\t{date}\t{source}\t{title}\t{school}\tadded`

10. **Filtered/duplicate entries**: Register in `scan-history.tsv` with status `skipped_title` or `skipped_dup`

## Output Summary

```
Flight School Scan -- {YYYY-MM-DD}
=================================
Schools scanned: N / N total
Job boards checked: N
Craigslist feeds: N
Total postings found: N
Filtered by title: N
Duplicates: N
New added to pipeline: N

NEW OPENINGS:
  + {school} ({airport}, {distance}min) | {title} | {pay if known}
  + ...

SCHOOLS WITH HIRING SIGNALS (no formal listing):
  ~ {school} ({airport}) | "Now Hiring" on homepage | Contact: {phone/email}
  ~ ...

SCHOOLS WITH NO OPENINGS DETECTED:
  - {school} ({airport}) | Last scanned: {date}

-> Run /flight-school-jobs pipeline to evaluate new postings.
-> Run /flight-school-jobs contact {school} to draft outreach for schools with hiring signals.
```

## Cold Outreach Detection

Even if a school has no formal job listing, these signals mean they might hire:
- "Join Our Team" or "Careers" page exists (even if empty)
- "Now Hiring" text anywhere on site
- Multiple student reviews mentioning "need more instructors"
- School has a large fleet (5+ aircraft) but few listed instructors
- School is Part 141 (standardized training = consistent instructor demand)

When detected, add to the scan summary as "hiring signal" and suggest using `/flight-school-jobs contact` for cold outreach.
