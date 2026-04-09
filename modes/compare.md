# Mode: compare -- Multi-Offer Comparison

Side-by-side comparison of multiple job opportunities to help decide where to apply or which offer to accept.

## Input

- List of school names or report numbers to compare
- OR "all scored" to compare all evaluated postings with score >= 3.5
- OR "offers" to compare only opportunities with status = Offer

## Execution

1. **Read `data/applications.md`** to find the relevant entries
2. **Read reports** for each entry from `reports/`
3. **Read `config/profile.yml`** for priorities (hours > pay > distance)

4. **Build comparison table:**

```
Offer Comparison -- {YYYY-MM-DD}
================================

| Factor | {School 1} | {School 2} | {School 3} |
|--------|-----------|-----------|-----------|
| **Score** | {X.X}/5 | {X.X}/5 | {X.X}/5 |
| Airport | {code} | {code} | {code} |
| Distance | {X} min | {X} min | {X} min |
| Pay Rate | ${X}/hr | ${X}/hr | ${X}/hr |
| Pay Type | W-2/1099 | W-2/1099 | W-2/1099 |
| Est. Hours/Month | {X} | {X} | {X} |
| Monthly Income | ${X} | ${X} | ${X} |
| Part 61/141 | {type} | {type} | {type} |
| Fleet | {types} | {types} | {types} |
| Schedule | {flex} | {flex} | {flex} |
| Benefits | {list} | {list} | {list} |
| Student Pipeline | {rating} | {rating} | {rating} |
| Months to 300hrs | {X} | {X} | {X} |
| ATP Date | {month} | {month} | {month} |
| Status | {status} | {status} | {status} |

## Financial Impact (6-month projection)

| Metric | {School 1} | {School 2} | {School 3} |
|--------|-----------|-----------|-----------|
| Monthly income | ${X} | ${X} | ${X} |
| Monthly bills | -$7,000 | -$7,000 | -$7,000 |
| Net monthly | ${X} | ${X} | ${X} |
| Cash after 6mo | ${X} | ${X} | ${X} |
| Hours after 6mo | {X} | {X} | {X} |
| ATP reached? | {Yes/No} | {Yes/No} | {Yes/No} |

## Pros & Cons

### {School 1}
Pros: {list}
Cons: {list}

### {School 2}
Pros: {list}
Cons: {list}

### {School 3}
Pros: {list}
Cons: {list}

## Recommendation

{Which school is the best overall fit and why, considering Krystle's 
priorities: HOURS first, then pay, then distance.}

Winner: **{School Name}**
Reason: {1-2 sentences}
```

## Ranking Logic

When ranking, weight priorities in this order:
1. **Hours potential** (25%) -- More hours = faster ATP = most important
2. **Pay rate** (25%) -- Higher pay preserves more savings
3. **Distance** (15%) -- Shorter commute = more energy for flying
4. **Fleet quality** (10%)
5. **Schedule flexibility** (10%)
6. **School reputation** (5%)
7. **Student pipeline** (5%)
8. **Benefits** (5%)

If two schools are close in score, break the tie on hours potential.
