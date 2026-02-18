# Operational Reporting Automation Pipeline

## Project Summary
Replaced manual recurring report preparation with a scheduled Python and SQL pipeline for cleaner inputs, repeatable transforms, and predictable delivery windows.

## Work Context
At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this pipeline model supported recurring leadership updates for admissions throughput, examination operations, and results readiness.

## Current Implementation
I continue the same model with config-driven runs and scheduled workflow wrappers to maintain timing and output consistency.

## Results and Impact
- Time saved: 8 hours per week
- Recurring reports generated: 40+
- On-time delivery for scheduled runs: 100%

## Deliverables
- ETL scripts: https://github.com/toughdave/scripting/tree/main/scripts/python/etl
- ETL runner: `scripts/python/etl/etl_runner.py`
- Workflow scheduler: `scripts/workflow/schedule_daily_run.sh`

## Technical Notes
- Pipeline checkpoints: extract validation, transform checks, output integrity checks.
- Artifacts are timestamped to support run tracking and operational handoff.
