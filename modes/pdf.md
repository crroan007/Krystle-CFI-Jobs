# Mode: pdf -- CFII Resume & Cover Letter Generation

Generate a tailored, ATS-optimized PDF resume and optional cover letter for a specific job posting or school.

## Input

- Job posting URL or report number (to tailor for a specific school)
- OR "generic" for a general-purpose CFII resume
- Optional: "with cover letter" to also generate a cover letter

## Execution

1. **Read context:**
   - `cv.md` (source of truth for all experience and hours)
   - `config/profile.yml` (certs, hours, targets)
   - `modes/_profile.md` (narrative, strengths)
   - If tailoring for a job: read the report from `reports/` or the job posting

2. **If tailoring for a specific school:**
   - Read the evaluation report
   - Identify what the school values (from Block F: Application Strategy)
   - Emphasize matching experience
   - Adjust Professional Summary to mention the school's fleet/program
   - Reorder experience sections by relevance

3. **Build HTML from template:**
   - Read `templates/cv-template.html`
   - Fill in all `{{PLACEHOLDERS}}` with content from cv.md and profile.yml
   - Key sections for a CFII resume:
     a. **Header**: Name, contact info, location
     b. **Certifications Banner**: CFII, CFI, Commercial, Instrument -- prominent
     c. **Professional Summary**: 3-4 lines, tailored to the school if specific
     d. **Flight Experience Table**: Total, PIC, Dual Given, Instrument, XC, Night
     e. **Aircraft Proficiency**: List of types flown and instructed in
     f. **Instruction Experience**: Schools taught at, endorsements given, pass rates
     g. **Education**: Degree(s), flight training program
     h. **Certifications Detail**: Full cert list with dates
     i. **Additional Skills**: Ground instruction, sim, customer service, etc.

4. **Write temporary HTML** to `output/temp-resume.html`

5. **Generate PDF:**
   ```bash
   node generate-pdf.mjs output/temp-resume.html "output/{Name}-CFII-Resume-{School}.pdf" --format=letter
   ```

6. **If cover letter requested:**
   - Generate a separate 1-page cover letter HTML
   - Personalized for the specific school
   - References the school's fleet, program, and location
   - Explains availability, commitment to hour-building, teaching philosophy
   - Generate PDF: `output/{Name}-Cover-Letter-{School}.pdf`

7. **Report output:**
   ```
   Resume Generated
   ================
   File: output/{filename}.pdf
   Pages: {N}
   Tailored for: {School Name} ({Airport})
   
   Key emphasis:
   - {What was highlighted}
   - {What was reordered}
   
   Cover letter: {generated / not requested}
   ```

## ATS Optimization Rules

- Single-column layout (no sidebars)
- Standard section headers: Professional Summary, Flight Experience, etc.
- No text in images or SVGs
- No critical info in headers/footers (ATS ignores them)
- UTF-8, selectable text
- No nested tables
- Certifications front and center (recruiters scan for CFII/CFI first)
- Flight hours prominently displayed (this is what schools care about)

## Writing Rules for Aviation Resumes

### DO:
- Lead with certifications and total hours
- Include specific aircraft types with hours in each
- Mention endorsements given and student pass rates
- Note availability (immediately, full-time, flexible)
- Use action verbs: "Instructed", "Conducted", "Prepared", "Evaluated"
- Include safety record ("Zero incidents/accidents in X hours of instruction")

### DON'T:
- Say "passionate about aviation" (everyone says this)
- Use vague language ("extensive experience" -- give numbers instead)
- Include irrelevant non-aviation work experience (unless no aviation experience)
- Exaggerate hours or ratings
- Make the resume longer than 1 page (unless 10+ years aviation experience)

## Cover Letter Template Structure

1. **Opening**: Why you're writing and which position
2. **Connection**: Something specific about the school (fleet, location, reputation)
3. **Qualifications**: CFII cert, hours, aircraft experience -- brief, not a resume repeat
4. **Value prop**: Why hiring Krystle benefits the school (committed, flexible, CFII)
5. **Availability**: Start immediately, schedule flexibility
6. **Close**: Request for conversation, contact info
