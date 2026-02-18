# Academic Results Analytics Dashboard

## Project Summary
Unified admissions, examination, and results processing into a reporting workflow that reduced reconciliation overhead and improved release readiness for leadership reporting.

## Work Context
At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this workflow supported admissions and results publication cycles where score mismatches, duplicate records, and eligibility gaps had to be resolved before official release.

## Current Implementation
I continue this workflow in reusable assets under the scripting repository and run validation-first refresh routines before report packaging.

## Results and Impact
- Records audited: 4K+
- Faster reconciliation: 35%
- Leadership dashboards delivered: 3

## Deliverables
- SQL validation scripts: https://github.com/toughdave/scripting/tree/main/scripts/sql
- MySQL integrity check: `scripts/sql/mysql/mysql_validate_results_integrity.sql`
- PostgreSQL integrity check: `scripts/sql/postgres/postgres_validate_results_integrity.sql`
- Power Query quality template: `powerbi/powerquery/powerquery_data_quality_template.pq`

## Technical Notes
- Validation sequence: null checks, duplicate checks, eligibility checks, result consistency checks.
- Reporting views are structured for cohort, session, and department drill-down.
