# Student Records Reconciliation Hub

## Project Summary
Built a centralized reconciliation workflow to align admissions, enrollment, and results records before publication windows.

## Work Context
At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this process reduced mismatch carryover between systems and improved publication accuracy for each cycle.

## Current Implementation
I now maintain reusable reconciliation scripts and SQL comparison templates for repeatable source-versus-target checks.

## Results and Impact
- Records reviewed per cycle: 4K+
- Duplicates flagged and resolved pre-publish: 1.2%
- Source systems reconciled: 3

## Deliverables
- Reconciliation scripts: https://github.com/toughdave/scripting/tree/main/scripts/python/reconciliation
- Reconcile workflow: `scripts/python/reconciliation/reconcile_students.py`
- SQL diff template: `scripts/sql/templates/sql_reconciliation_diff_template.sql`

## Technical Notes
- Matching controls include ID alignment, cross-field validation, and mismatch classification.
- Output queues support distributed correction and final release readiness checks.
