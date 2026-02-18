# Exam Operations SLA Tracker

## Project Summary
Built a Power BI and Google Sheets-based SLA tracking system to centralize examination readiness monitoring across device compliance, invigilation staffing, and pre-exam preparation checkpoints. The system enabled operations teams to identify and escalate at-risk items before examination periods, improving overall SLA adherence to approximately 95% by replacing ad-hoc tracking with a structured, metric-driven approach.

## Work Context
At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this SLA tracking model coordinated exam readiness and prioritized escalation for at-risk checkpoints across multiple operational streams — device inventory and compliance status, invigilation personnel assignments, venue preparation checklists, and technology setup verification. SLA threshold indicators and automated alerting logic flagged checkpoints at risk of breaching target deadlines, and daily health snapshots were shared with examination coordinators and operations leads.

## Current Implementation
I continue the same threshold logic in reusable reporting assets, using configurable at-risk thresholds and sample task queues to test readiness classification before each exam window.

## Results and Impact
- SLA adherence: 95% through structured monitoring
- Devices tracked per cycle: 120+
- Readiness checkpoints tracked daily: 6

## Deliverables
- Reporting scripts: https://github.com/toughdave/scripting/tree/main/scripts/python/reporting
- At-risk report script: `scripts/python/reporting/sla_at_risk_report.py`
- Audit packet export: `scripts/python/reporting/excel_export_audit_packet.py`
- Task queue sample: `data/sample/exam_tasks.csv`

## Technical Notes
- Classification bands: on-track, at-risk (within threshold days of due date), overdue (past due date), and completed (on-time or late).
- Configurable threshold parameter controls the boundary between on-track and at-risk states.
- Daily snapshots provide concise status summaries highlighting items requiring immediate attention.
- Historical trend data supports continuous process improvement across examination operations.
