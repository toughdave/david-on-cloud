# Student Records Reconciliation Hub

## Project Summary
Built and operated a centralized records reconciliation process at a federal university, systematically cross-referencing admissions, enrollment, and results data from multiple source systems to identify and resolve duplicates, eligibility gaps, and data mismatches before official publication for 4,000+ student records each cycle. The workflow mapped incoming data to consistent student identifiers and produced correction queues for distributed resolution.

## Work Context
At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this reconciliation flow was used to align admissions, enrollment, and results records before publication windows. Correction queues and status dashboards in Excel and Google Sheets provided departmental coordinators with actionable lists of records requiring verification. Complex eligibility cases — including transfer students, readmission candidates, and students with incomplete records — were reconciled in partnership with department leads and academic coordinators to ensure final published rosters accurately reflected each student's academic standing.

## Current Implementation
I now keep the same source-vs-target checks in reusable assets for consistent mismatch tracking. The reconciliation pipeline includes exact-key matching, fuzzy name matching for records with missing or inconsistent IDs, and survivorship merge logic for conflict resolution.

## Results and Impact
- Records reviewed per cycle: 4,000+ across admissions, enrollment, and results
- Duplicates flagged and resolved pre-publish: 1.2%
- Source systems reconciled: 3 (admissions, enrollment, results)

## Deliverables
- Reconciliation scripts: https://github.com/toughdave/scripting/tree/main/scripts/python/reconciliation
- Exact-key reconciliation: `scripts/python/reconciliation/reconcile_students.py`
- Fuzzy name matching: `scripts/python/reconciliation/fuzzy_match_students.py`
- Survivorship merge: `scripts/python/reconciliation/survivorship_merge_students.py`
- SQL diff template: `scripts/sql/templates/sql_reconciliation_diff_template.sql`

## Technical Notes
- Matching controls include ID alignment, cross-field validation, and mismatch classification (match, mismatch, source-only, target-only).
- Fuzzy matching uses name similarity scoring with department boost for records missing consistent keys.
- Survivorship merge resolves field-level conflicts using configurable priority order (source vs target).
- Output queues support distributed correction workflows and final release readiness checks.
