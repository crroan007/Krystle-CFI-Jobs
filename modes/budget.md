# Mode: budget -- Budget Burndown & Scenario Calculator

Displays current financial status, runway projections, and scenario comparisons for Krystle's ATP hour building.

## Execution

1. **Read `data/budget.yml`** for all financial data
2. **Read `data/rental-rates.md`** for aircraft cost comparison
3. **Read `config/profile.yml`** for current hours and target
4. **Read `data/applications.md`** to factor in any current employment

5. **Calculate and display:**

```
Budget Dashboard -- {YYYY-MM-DD}
=================================

CASH STATUS
  Starting cash (Apr 2026):     $82,616
  Monthly bills:                -$7,000/mo
  Months elapsed:               {N}
  Bills paid to date:           -${X}
  Flying expenses to date:      -${X}
  Flying income to date:        +${X}
  Current cash (estimated):     ${X}
  
DANGER ZONE: {YES/NO -- below $5,000?}
  Months until $5,000:          {X} months at current burn rate
  Months until $0:              {X} months at current burn rate

FLIGHT HOURS
  Current total:                {X} hrs
  Target (ATP):                 1,500 hrs
  Remaining:                    {X} hrs
  Hours logged this month:      {X} hrs
  Average hours/month:          {X} hrs (if data available)
  Projected ATP date:           {YYYY-MM} at current pace

===================================
SCENARIO COMPARISON
===================================

| Scenario | Monthly Cost | Monthly Income | Net/Mo | Hrs/Mo | Months to ATP | Ending Cash | ATP Date |
|----------|-------------|----------------|--------|--------|---------------|-------------|----------|
| A: Pure Rental ($75/hr) | -$10,750 | $0 | -$10,750 | 50 | 6 | $17,616 | Oct 2026 |
| B: Full-time CFII ($40/hr) | -$7,000 | +$2,400 | -$4,600 | 60 | 5 | ~$59,616 | Sep 2026 |
| C: Hybrid | -$8,500 | +$1,600 | -$6,900 | 60 | 5 | ~$48,116 | Sep 2026 |
| D: Part-time CFII ($25/hr) | -$7,000 | +$1,000 | -$6,000 | 40 | 7.5 | ~$37,616 | Nov 2026 |

BEST SCENARIO: B (Full-time CFII)
  - Preserves $42,000 MORE cash than pure rental
  - Reaches ATP 1 month FASTER
  - Gets PAID instead of paying

===================================
RENTAL COST COMPARISON (if renting is needed)
===================================

| Rank | School | Aircraft | $/hr Wet | Total for 300hrs | Distance |
|------|--------|----------|----------|------------------|----------|
| 1 | West GA (KCTJ) | C152 | $75 | $22,500 | 45 min |
| 2 | AeroVentures (KLZU) | C172 | ~$135 | ~$40,500 | 40 min |
| 3 | Atlanta Flying Club | Archer | ~$160 | ~$48,000 | 25 min |
| 4 | Aero Atlanta (KRYY) | C172SP | $200-280 | $60-84K | 30 min |

===================================
BREAK-EVEN ANALYSIS
===================================

At $75/hr rental (cheapest option):
- 1 hour instructing at $40/hr offsets 0.53 hours of rental
- 1 hour instructing at $50/hr offsets 0.67 hours of rental
- 1 hour instructing at $60/hr offsets 0.80 hours of rental

The math is clear: EVERY hour spent instructing instead of renting 
saves $115-355 (earning $40-60 instead of paying $75-280).

===================================
MONTHLY PROJECTION
===================================

| Month | Bills | Flying Cost | Flying Income | Net | Cash Balance | Hours Total |
|-------|-------|-------------|---------------|-----|-------------|-------------|
| Apr 2026 | -$7,000 | {varies} | {varies} | {net} | ${X} | {X} |
| May 2026 | -$7,000 | {varies} | {varies} | {net} | ${X} | {X} |
| Jun 2026 | -$7,000 | {varies} | {varies} | {net} | ${X} | {X} |
| Jul 2026 | -$7,000 | {varies} | {varies} | {net} | ${X} | {X} |
| Aug 2026 | -$7,000 | {varies} | {varies} | {net} | ${X} | {X} |
| Sep 2026 | -$7,000 | {varies} | {varies} | {net} | ${X} | {X} |
```

## Interactive Scenario Builder

If the user asks "what if" questions, recalculate:
- "What if she gets hired at $35/hr flying 50 hrs/month?"
- "What if she rents the Archer for 10 hrs/month on top of instructing?"
- "What if monthly bills drop to $6,000?"
- "What if she starts in May instead of April?"

Recalculate all projections with the new inputs and show the impact.

## Danger Zone Alerts

Flag immediately if ANY of these are true:
- Current cash below $5,000
- Any future month in the projection drops below $5,000
- Burn rate exceeds income by more than $10,000/month
- Cash will hit $0 before September 2026

Use this language:
```
!! DANGER ZONE !!
Cash projected to drop below $5,000 in {month}.
At current burn rate of ${X}/mo, you have {X} months of runway.

RECOMMENDATION: {specific action to take}
```
