# Admissions Data Quality Audit

## Project Summary
Standardized admissions intake checks across identity, qualification, and eligibility fields to reduce correction loops before committee sign-off.

## Work Context
At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this process was used each intake cycle to validate submitted applicant records and prepare clean rosters for review.

## Current Implementation
I now maintain the same rules in script-driven validation assets and reusable configuration files for consistent execution across cycles.

## Results and Impact
- Applicants reviewed: 2K+
- Residual error rate after cleanup: 0.8%
- Validation rule sets: 4

## Deliverables
- Data quality scripts: https://github.com/toughdave/scripting/tree/main/scripts/python/data_quality
- Rules validator: `scripts/python/data_quality/config_rules_validator.py`
- Validation rule sample: `data/sample/validation_rules.json`

## Technical Notes
- Rule categories: required fields, score thresholds, duplicate identity checks, eligibility conditions.
- Outputs include issue queues for manual review and sign-off summaries.
