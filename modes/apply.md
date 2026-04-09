# Mode: apply -- Application Form Assistant

Fill out online job application forms using Playwright. Reads Krystle's profile and tailors responses to each form field.

## Input

- URL of the application form
- OR school name (will look up the application page)

## Execution

1. **Read context:**
   - `cv.md`, `config/profile.yml`, `modes/_profile.md`
   - If a report exists for this school, read it for tailored responses

2. **Navigate to the application URL** with Playwright

3. **Read the form** with `browser_snapshot`:
   - Identify all form fields (name, email, phone, resume upload, text areas)
   - Note required vs optional fields
   - Identify any essay/short answer questions

4. **Fill fields:**
   - **Name, email, phone, location**: from `config/profile.yml`
   - **Resume upload**: Point to the PDF in `output/` if one was generated
   - **Cover letter**: Generate one inline or reference the PDF
   - **"Why do you want to work here?"**: Personalized answer referencing school research
   - **"Describe your teaching experience"**: Pull from cv.md
   - **"Availability"**: From profile.yml -- "Immediately, 6-7 days/week"
   - **Certifications checkboxes**: Check CFII, CFI, Commercial, Instrument
   - **Total flight hours**: From profile.yml

5. **STOP BEFORE SUBMITTING.** Show the user what was filled in:
   ```
   Application Ready -- {School Name}
   ===================================
   All fields filled. Here's what I entered:
   
   Name: {value}
   Email: {value}
   Phone: {value}
   ...
   Essay: "{preview of answer}"
   
   Resume: {filename} attached
   
   READY TO SUBMIT. Say "submit" to send, or tell me what to change.
   ```

6. **Only submit after explicit user confirmation.**

7. **After submission**, update tracker:
   - Set status to `Applied`
   - Add applied_date
   - Note: "Applied via online form"

## CRITICAL RULES

- **NEVER submit without user saying "submit" or "send" or "go ahead"**
- **NEVER invent qualifications** -- only use data from cv.md and profile.yml
- If a required field asks for something not in the profile (salary expectations, references), ask the user
- If the form requires a login/account creation, STOP and tell the user to create it themselves
