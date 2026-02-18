# Academic Results Analytics Dashboard

## Project Summary
Built a comprehensive Power BI and Excel analytics suite to centralize results processing tracking, anomaly detection, and cohort performance analysis across multiple admissions and examination cycles at a university serving 4,000+ students. The workflow unified fragmented data from admissions portals, examination records, and departmental grade submissions into a single reporting layer with automated validation checks.

## Work Context
At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this workflow supported admissions and results publication cycles where score mismatches, duplicate records, and eligibility gaps had to be resolved before official release. Each cycle involved consolidating data from multiple departmental submissions, running SQL-driven validation checks, and producing leadership-ready dashboards within tight publication windows. Interactive KPI panels in Power BI provided drill-down capabilities across student cohorts, academic sessions, and departments, enabling leadership to monitor processing timelines and flag anomaly rates in real-time.

## Current Implementation
I continue this workflow in reusable assets under the scripting repository, running validation-first refresh routines before report packaging. Each dashboard refresh starts from repeatable quality checks maintained in version-controlled SQL and Power Query templates.

## Results and Impact
- Records audited: 4,000+ per cycle across admissions, exams, and results
- Faster reconciliation: 35% reduction through automation of manual review steps
- Leadership dashboards delivered: 3 (Power BI, Excel, Google Sheets)

## Deliverables
- SQL validation scripts: https://github.com/toughdave/scripting/tree/main/scripts/sql
- MySQL integrity check: `scripts/sql/mysql/mysql_validate_results_integrity.sql`
- PostgreSQL integrity check: `scripts/sql/postgres/postgres_validate_results_integrity.sql`
- Power Query quality template: `powerbi/powerquery/powerquery_data_quality_template.pq`

## Technical Notes
- Validation sequence: null checks, duplicate detection, eligibility verification, result consistency checks.
- Reporting views are structured for cohort, session, and department drill-down with export-ready formatting.
- Data quality flags use conditional logic and formula-driven validation to identify outliers and formatting inconsistencies.
- Audit-trail reports formatted for leadership reviews, accreditation audits, and departmental briefings.
