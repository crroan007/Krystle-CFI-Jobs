# Mode: deep -- Flight School Deep Research

Comprehensive research on a specific flight school to help Krystle decide whether to apply and prepare for interviews.

## Input

- School name (and optionally airport code)

## Execution

1. **Look up school in `config/portals.yml`** for baseline data

2. **WebSearch** multiple queries:
   - "{school name} flight instructor reviews"
   - "{school name} {airport} student reviews"
   - "{school name} glassdoor" or "{school name} indeed reviews"
   - "{school name} accident incident NTSB" (safety check)
   - "{school name} fleet aircraft"
   - "{school name} chief instructor owner"
   - "site:reddit.com {school name} flight school"
   - "site:pilotsofamerica.com {school name}"

3. **Navigate school website** with Playwright:
   - About page (history, mission, team)
   - Fleet page (aircraft types, tail numbers, photos)
   - Instructor page (how many listed? bios?)
   - Programs offered (Private, Instrument, Commercial, CFI, CFII, Multi)
   - Pricing page (what do they charge students?)
   - News/blog (recent activity level)

4. **Check Google Maps**:
   - Google rating and review count
   - Recent reviews (look for mentions of instructors, aircraft condition, scheduling)
   - Photos of facility and aircraft

5. **Generate research report:**

```
Deep Research: {School Name}
============================
Airport: {code} ({name})
Distance: {X} min from East Point
Website: {url}
Phone: {number}
Email: {email}
Type: Part {61/141}

## Overview
{2-3 sentence summary of what this school is, how long they've been around, 
what they're known for}

## Fleet
| Aircraft | Type | Avionics | Condition | Notes |
|----------|------|----------|-----------|-------|
{table of known aircraft}

Total fleet size: {N} aircraft

## Instructors
- Number of instructors: {N known/estimated}
- Named instructors found: {list}
- Chief instructor: {name if found}
- Owner/operator: {name if found}
- Turnover signal: {high/medium/low based on reviews and tenure}

## Student Volume & Demand
- Programs offered: {list}
- Student reviews mention: {scheduling ease, wait times, instructor availability}
- Estimated monthly student starts: {estimate}
- Waitlist reported: {yes/no}

## Reputation
- Google rating: {X.X}/5 ({N} reviews)
- AOPA recognition: {if any}
- Yelp/other ratings: {if found}
- Positive themes in reviews: {list}
- Negative themes in reviews: {list}
- Any NTSB incidents: {findings}

## Financial
- What they charge students: {rates if published}
- Estimated instructor pay: {based on market and school type}
- Business health signals: {growing, stable, declining}

## Airline Pathways
- Delta Propel: {yes/no}
- ATP partnership: {yes/no}
- Other airline agreements: {if any}
- Relevance: {does this help attract students?}

## Instructor Experience
- What current/former instructors say: {from reviews and forums}
- Average tenure before moving to airlines: {estimate}
- Reported pay range: {if found}
- Work environment: {supportive/demanding/mixed}

## Red Flags
{Any concerning findings -- safety issues, bad reviews, 
financial trouble, legal issues, high turnover}

## Green Flags
{Positive signals -- awards, growth, good reviews, 
large fleet, busy schedule, airline pathways}

## Recommendation for Krystle
{Should she apply? What to emphasize? Any concerns to address?
Specific contacts to reach out to?}
```
