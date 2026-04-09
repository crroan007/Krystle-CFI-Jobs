# Mode: contact -- Cold Outreach Drafting

Draft personalized outreach messages (email, phone script, or walk-in pitch) for schools that may not have formal job listings but could be hiring.

## Input

- School name (must exist in `config/portals.yml`)
- OR school name + airport code (will look up details)
- Optional: specific contact name/email if known

## Execution

1. **Look up school in `config/portals.yml`** for known details (phone, email, fleet, notes)
2. **Read `cv.md`** and `config/profile.yml` for Krystle's qualifications
3. **Read `modes/_profile.md`** for narrative and strengths
4. **WebSearch** "{school name} {airport}" for additional context:
   - Chief instructor or owner name
   - Recent news or social media posts
   - Student reviews mentioning instructor availability
   - Fleet details

5. **Draft 3 outreach options:**

### Option A: Email

```
Subject: CFII Available -- Interested in Instructing at {School Name}

Hi {Contact Name / Hiring Manager},

{1-2 personalized sentences showing you know about the school -- reference fleet, location, reputation, or recent news.}

I'm a CFII based in East Point, GA, currently at {X} total hours and building toward ATP minimums. I'm available immediately and looking for a full-time (or part-time) instructor position where I can contribute to your team.

Quick highlights:
- CFII and CFI certified
- {X} total flight hours, {X} dual given
- Experienced in {aircraft types from cv.md}
- Available {days/schedule from profile}
- {1 specific strength from _profile.md}

I'd love to learn more about any instructor openings at {school}. I'm happy to come by the airport to introduce myself in person, or we can set up a quick phone call.

Thank you for your time,
{Name}
{Phone}
{Email}
```

### Option B: Phone Script

```
PHONE CALL SCRIPT -- {School Name}
Phone: {number from portals.yml}

"Hi, my name is {Name}. I'm a CFII based here in the Atlanta area, and I'm 
looking for an instructor position. I was wondering if {school} has any 
openings for flight instructors right now?

[If yes]: Great! I have {X} total hours and I'm CFII certified. I'm available 
immediately and flexible on schedule. What would be the best way to apply?

[If no]: I understand. Would it be okay if I sent over my resume in case 
something opens up? I'm building toward ATP minimums and I'd love to be part 
of your team. Who should I send it to?

[Either way]: Thank you so much for your time. Have a great day."
```

### Option C: Walk-in Pitch (30-second version)

```
WALK-IN PITCH -- {School Name} at {Airport}

Show up in business casual. Bring 3 printed copies of resume.

"Hi, I'm {Name}. I'm a CFII looking for an instructor position here in the 
Atlanta area. I've got {X} total hours and I'm available to start right away. 
Is there someone I could speak with about instructor openings?"

If chief instructor is available, be ready to discuss:
- Your teaching philosophy
- Aircraft types you're comfortable in
- Your availability
- How long you plan to instruct (honest: building to ATP, but committed to 
  giving quality instruction while here)
```

6. **Log the outreach** -- after the user sends any of these, update the tracker:
   - Status: `Contacted`
   - Notes: "Cold email sent" or "Phone call" or "Walk-in"

## Tone Guidelines

- Professional but warm. Flight schools are small operations -- personal touch matters.
- Show you researched the school. Mention their fleet, their airport, something specific.
- Be honest about ATP hour-building. Schools expect it. Frame it positively: "committed instructor for the next 6+ months."
- Don't oversell. Let qualifications speak for themselves.
- Keep emails under 150 words. Chief instructors are busy people.
