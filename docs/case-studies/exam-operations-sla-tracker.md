# Exam Operations SLA Tracker

## Project Summary
Centralized exam readiness checkpoints into SLA-focused tracking with at-risk flags to support faster escalation before exam windows.

## Work Context
At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this SLA model coordinated operational readiness across devices, staffing, venue preparation, and setup verification.

## Current Implementation
I continue the same threshold logic through reusable reporting scripts and sample task queues for readiness testing.

## Results and Impact
- SLA adherence: 95%
- Devices tracked per cycle: 120+
- Readiness checkpoints tracked daily: 6

## Deliverables
- Reporting scripts: https://github.com/toughdave/scripting/tree/main/scripts/python/reporting
- At-risk report script: `scripts/python/reporting/sla_at_risk_report.py`
- Task queue sample: `data/sample/exam_tasks.csv`

## Technical Notes
- Threshold bands separate normal, warning, and at-risk checkpoints.
- Daily snapshots support escalation routing and closure tracking.
