# Admissions Data Quality Audit

## Project Summary
Conducted systematic audits of multi-intake admissions datasets at a federal university, reconciling applicant records across identity fields, eligibility criteria, and enrollment status to ensure data integrity before final approvals for 2,000+ applicants per cycle. Validation workflows used advanced lookup formulas, deduplication rules, and eligibility logic to systematically cross-reference submissions against institutional admission criteria.

## Work Context
At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this audit pattern was used to verify admissions rosters before committee sign-off each intake cycle. The institution's Gradent data processing platform was used alongside Excel and Google Sheets to extract audit exports, reconcile discrepancies between portal submissions and backend records, and deliver clean, verified rosters to admissions committees. Variance summary reports and sign-off documentation packets gave department heads clear visibility into correction actions taken, residual error rates, and data quality metrics.

## Current Implementation
I now maintain the same rules through script-driven validation assets and reusable configuration files. Field completeness, score thresholds, and eligibility logic stay consistent across cycles using the config-driven rules engine.

## Results and Impact
- Applicants reviewed: 2,000+ per multi-intake audit cycle
- Residual error rate after cleanup and verification: 0.8%
- Validation rule sets: 4 (ID, eligibility, duplicates, missing fields)

## Deliverables
- Data quality scripts: https://github.com/toughdave/scripting/tree/main/scripts/python/data_quality
- Rules validator: `scripts/python/data_quality/config_rules_validator.py`
- Validation rule sample: `data/sample/validation_rules.json`

## Technical Notes
- Rule categories: required fields, score range thresholds, duplicate identity checks, conditional eligibility conditions.
- Outputs include row-level violation queues for manual review and summary metadata for sign-off.
- Repeatable audit procedures standardized how incoming applicant data was reviewed across multiple intake cycles.
- Config-driven approach allows rule definitions to be updated without modifying validation logic.
