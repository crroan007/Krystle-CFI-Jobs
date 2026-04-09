# Mode: pipeline -- Batch URL Processing

Process all pending URLs from `data/pipeline.md` through the evaluation pipeline.

## Execution

1. **Read `data/pipeline.md`** and find all unchecked items under "Pending":
   ```
   - [ ] https://example.com | School Name | Title | Airport | Distance
   ```

2. **For each pending URL:**
   a. Run the `evaluate` mode (read `modes/evaluate.md` instructions)
   b. Generate the evaluation report
   c. Write tracker addition TSV
   d. Mark the item as processed: `- [x] ...`
   e. Move to "Processed" section

3. **If 3+ URLs are pending**, consider launching as parallel subagents:
   ```
   Agent(
     subagent_type="general-purpose",
     prompt="[_shared.md + evaluate.md + cv.md context]\n\nEvaluate this posting: {url}",
     description="evaluate {school}"
   )
   ```
   Maximum 3 parallel evaluations at a time.

4. **After all processed**, run `node merge-tracker.mjs` to merge additions.

5. **Output summary:**
   ```
   Pipeline Processing Complete -- {YYYY-MM-DD}
   =============================================
   URLs processed: N
   
   Results (sorted by score):
     4.5/5 | {School} | {Title} | ${pay}/hr | {distance}min | APPLY
     4.2/5 | {School} | {Title} | ${pay}/hr | {distance}min | APPLY
     3.8/5 | {School} | {Title} | ${pay}/hr | {distance}min | CONTACT FIRST
     3.1/5 | {School} | {Title} | ${pay}/hr | {distance}min | SKIP
   
   Recommended next steps:
   - Apply to {top school} immediately
   - Draft outreach for {second school}: /flight-school-jobs contact {school}
   ```

## Error Handling

- If a URL fails to load, mark it as `- [!] {url} | FAILED: {reason}`
- Continue processing remaining URLs
- Include failed URLs in the summary with error details
