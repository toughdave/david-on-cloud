# Operational Reporting Automation Pipeline

## Project Summary
Designed and deployed automated data processing pipelines using Python and SQL to transform recurring operational reporting from manual, error-prone spreadsheet work into scheduled, quality-checked workflows delivering consistent leadership updates across academic cycles. The pipeline pulled raw data from academic information systems and MySQL databases, applied automated cleansing routines, and loaded validated datasets into reporting-ready structures.

## Work Context
At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this pipeline pattern supported recurring admissions, examination, and results reporting with tighter turnaround times. Quality assurance checkpoints at each pipeline stage — extraction validation, transformation rule verification, and output integrity checks — ensured data anomalies were caught before reports reached leadership. Standardized report templates eliminated manual formatting and rework that previously consumed significant preparation time each cycle.

## Current Implementation
I mirror the same production cadence in the scripting repository through config-driven ETL runs and scheduled workflow wrappers. Timestamped logs and summary artifacts maintain run tracking and output consistency.

## Results and Impact
- Time saved: 8 hours per week replacing manual report preparation
- Recurring reports generated: 40+ leadership updates across academic cycles
- On-time delivery: 100% for scheduled pipeline runs

## Deliverables
- ETL scripts: https://github.com/toughdave/scripting/tree/main/scripts/python/etl
- ETL runner: `scripts/python/etl/etl_runner.py`
- Workflow scheduler: `scripts/workflow/schedule_daily_run.sh`
- ETL config sample: `data/sample/etl_config.json`

## Technical Notes
- Pipeline checkpoints: extract validation, transform rule verification, output integrity checks.
- Config-driven design allows source paths, required columns, date formats, and deduplication keys to be adjusted per run.
- Dry-run mode validates pipeline behavior without writing output, supporting safe pre-production testing.
- Artifacts are timestamped to support run tracking, operational handoff, and audit requirements.
