# Mode: scan -- Flight School Job Scanner

Scans Atlanta-area flight school career pages, job boards, and web sources for CFI/CFII openings. **Only reports VERIFIED, active postings** -- no evergreen pages, no closed businesses, no stale listings.

## VERIFICATION RULES (CRITICAL)

**A listing is ONLY considered "active" if it meets at least ONE of these criteria:**
1. **Dated job posting** on Indeed, LinkedIn, Glassdoor, ZipRecruiter, or JSfirm posted within the last 60 days
2. **Specific "Now Hiring" language** with a date, position title, and application instructions
3. **Direct confirmation** from the school (phone call, email reply, social media post within 30 days)

**These do NOT count as active listings:**
- Undated "Careers" or "Join Our Team" pages (evergreen)
- Generic "We're always looking for great people" language
- Job board results with no post date visible
- Listings for a school that has closed, merged, or rebranded

**Before adding any posting to the pipeline, you MUST:**
1. Verify the business is currently operating (Google Maps, recent reviews within 6 months, active social media)
2. Check if the specific job posting has a date or was cross-posted to a major job board with a date
3. If the only evidence is an undated careers page, mark it as `cold-outreach` NOT `active-posting`

**Verification tier labels:**
- `verified-active` -- Dated posting on job board OR confirmed by school
- `likely-active` -- Recent hiring signals (social media post, student reviews mentioning hiring, multiple job board appearances) but no single dated post
- `cold-outreach` -- Business exists but no confirmed opening. Worth contacting.
- `unverified` -- Cannot confirm business is operating or posting is real
- `stale-closed` -- Business closed, listing expired, or confirmed not hiring

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
1. WebSearch "{school name} hiring flight instructor 2026" or "{school name} CFI job"
2. WebFetch the `careers_url` to read content
3. Check for DATED job postings (not just generic careers pages)
4. Cross-reference: WebSearch "site:indeed.com {school name} flight instructor"
5. Verify business is operating: check for recent Google reviews, active website, social media activity

**IMPORTANT: Many flight schools have fake or stale "careers" pages.** A page that says "Join Our Team" with no date, no specific position, and no application process is NOT a real job posting. Mark these as `cold-outreach` only.

### Tier 2 -- Aviation Job Boards (COMPLEMENTARY)

For each board in `job_boards`:
- **JSfirm**: Search for Georgia/Atlanta CFI/CFII postings. Note post dates.
- **Indeed**: Search "flight instructor Atlanta GA" -- sort by date, only include last 60 days.
- **LinkedIn**: Search for flight instructor positions in Atlanta metro.
- **ZipRecruiter**: Check for recent CFI postings.
- **Glassdoor**: Check for recent CFI postings.

**Job board results MUST have a post date.** Undated results are treated as unverified.

### Tier 3 -- Craigslist RSS & Personal Ads (BROAD DISCOVERY)

For each feed in `personal_ads`:
- Fetch the RSS URL with WebFetch
- Parse XML for new postings
- These often catch individuals looking for flight instruction privately
- Mark as `post_type: personal_ad` in pipeline

## Workflow

1. **Read configuration**: `config/portals.yml`
2. **Read history**: `data/scan-history.tsv` for URLs already seen
3. **Read dedup sources**: `data/applications.md` + `data/pipeline.md`

4. **Tier 1 scan**:
   For each school with `enabled: true`:
   a. WebSearch for the school + "hiring" or "CFI job"
   b. WebFetch `careers_url` to read content
   c. Cross-reference on Indeed/LinkedIn for dated postings
   d. **Verify business is operating** (recent reviews, active site)
   e. Assign verification tier: `verified-active`, `likely-active`, `cold-outreach`, `unverified`, or `stale-closed`

5. **Tier 2 scan** (job boards -- search for dated postings):
   a. Search each job board for Atlanta/Georgia CFI/CFII positions
   b. Only include postings with visible dates within last 60 days
   c. Cross-reference school names against portals.yml

6. **Tier 3 scan** (RSS feeds):
   a. WebFetch each RSS URL
   b. Parse for new entries with dates
   c. Mark post_type as personal_ad

7. **Filter by title** using `title_filter`:
   - At least 1 keyword from `positive` must appear (case-insensitive)
   - 0 keywords from `negative` may appear

8. **Deduplicate** against:
   - `scan-history.tsv` -- exact URL match
   - `applications.md` -- school + role already tracked
   - `pipeline.md` -- URL already pending

9. **For each VERIFIED new posting**:
   a. Add to `data/pipeline.md` under "Pending" with verification tier
   b. Register in `data/scan-history.tsv`: `{url}\t{date}\t{source}\t{title}\t{school}\t{verification_tier}`

10. **Unverified/cold-outreach entries**: Still register in `scan-history.tsv` but clearly mark the tier

## Output Summary

```
Flight School Scan -- {YYYY-MM-DD}
=================================
Schools scanned: N / N total
Job boards checked: N
Total postings found: N

VERIFIED ACTIVE POSTINGS:
  [verified-active] {school} ({airport}, {distance}min) | {title} | {pay} | Posted: {date} | Source: {where found}

LIKELY ACTIVE (strong signals, not fully confirmed):
  [likely-active] {school} ({airport}) | {signals found} | Recommended: call to confirm

COLD OUTREACH (business active, no confirmed opening):
  [cold-outreach] {school} ({airport}) | Contact: {phone/email}

STALE / CLOSED / NOT HIRING:
  [stale-closed] {school} -- {reason}

-> Run /flight-school-jobs pipeline to evaluate verified postings.
-> Run /flight-school-jobs contact {school} to draft outreach for cold-outreach schools.
```

## Business Verification Checklist

Before marking a school as a valid lead, confirm:
- [ ] Website loads and has current content (not a parked domain)
- [ ] Google Maps shows "Open" with recent reviews (within 6 months)
- [ ] Phone number is callable (not disconnected)
- [ ] Social media has recent activity (if applicable)
- [ ] No news articles about closure, bankruptcy, or acquisition

If any of these fail, mark as `unverified` or `stale-closed` and note why.
