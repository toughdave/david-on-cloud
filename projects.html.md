# David On Cloud - Projects (Markdown)
> Project portfolio in Markdown format for AI agents and lightweight text processing workflows.

## Source of Truth
- [Projects JSON](https://www.davidoncloud.com/js/projects.json): Canonical project content managed through CMS data files.

## Exam Operations SLA Tracker
- Category: data
- Posted: 2026-02-02
- Updated: 2026-02-03
- Tags: Power BI, Google Sheets, SLA Tracking, Operations, Reporting, At-Risk Alerts
- Deliverable Link: [View SLA Reporting Scripts](https://github.com/toughdave/scripting/tree/main/scripts/python/reporting)
- PDF: N/A

### Project Summary
Built a Power BI and Google Sheets-based SLA tracking system to centralize examination readiness monitoring across device compliance, invigilation staffing, and pre-exam preparation checkpoints, enabling operations teams to identify and escalate at-risk items before examination periods.

### Technical Notes
- Centralized examination readiness data from multiple operational streams — device inventory and compliance status, invigilation personnel assignments, venue preparation checklists, and technology setup verification — into a single unified dashboard providing real-time visibility into overall exam preparedness.
- Designed SLA threshold indicators and automated alerting logic to flag checkpoints at risk of breaching target deadlines, enabling operations leads to prioritize escalation actions and allocate resources to the most critical preparation gaps before each examination cycle.
- Produced daily SLA health snapshots shared with examination coordinators and operations leads, providing concise status summaries that highlighted items requiring immediate attention and tracking the resolution progress of previously flagged issues across 120+ tracked devices per cycle.
- Improved overall SLA adherence to 95% by replacing ad-hoc tracking methods with a structured, metric-driven approach that established clear accountability for each readiness checkpoint and provided historical trend data to support continuous process improvement across examination operations.
- Work Context: At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this SLA tracking model was used to coordinate exam readiness and prioritize escalation for at-risk checkpoints. Current Implementation: I now preserve the same threshold logic in reusable assets (`scripts/python/reporting/sla_at_risk_report.py` with `data/sample/exam_tasks.csv`) to test queues before each exam window.

### Results and Impact
- **SLA adherence**: 95% (Improved monitoring)
- **Devices tracked**: 120+ (Per cycle)
- **Readiness checkpoints**: 6 (Daily SLA dashboard)

## Student Records Reconciliation Hub
- Category: data
- Posted: 2026-01-28
- Updated: 2026-01-31
- Tags: SQL, Excel, Data Validation, Record Management, Reconciliation, Mismatch Reporting
- Deliverable Link: [View Reconciliation Scripts](https://github.com/toughdave/scripting/tree/main/scripts/python/reconciliation)
- PDF: N/A

### Project Summary
Built and operated a centralized records reconciliation process at a federal university, systematically cross-referencing admissions, enrollment, and results data from multiple source systems to identify and resolve duplicates, eligibility gaps, and data mismatches before official publication for 4,000+ student records each cycle.

### Technical Notes
- Mapped incoming data from admissions portals, enrollment management systems, and departmental results submissions to consistent student identifiers, systematically highlighting records with missing fields, mismatched personal information, or inconsistent enrollment status across sources.
- Developed correction queues and status dashboards in Excel and Google Sheets that provided departmental coordinators with clear, actionable lists of records requiring verification, enabling distributed resolution of issues without disrupting the overall processing timeline.
- Partnered with department leads and academic coordinators to reconcile complex eligibility cases — including transfer students, readmission candidates, and students with incomplete records — ensuring that final published rosters accurately reflected each student's academic standing.
- Maintained lifecycle data integrity from initial application intake through graduation processing, applying SQL queries and formula-driven validation to ensure that records remained consistent and audit-ready across multiple academic sessions and reporting cycles.
- Work Context: At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this reconciliation flow was used to align admissions, enrollment, and results records before publication windows. Current Implementation: I now keep the same source-vs-target checks in reusable assets (`scripts/python/reconciliation/reconcile_students.py` and `scripts/sql/templates/sql_reconciliation_diff_template.sql`) for consistent mismatch tracking.

### Results and Impact
- **Records reviewed**: 4K+ (Each academic cycle)
- **Duplicates flagged**: 1.2% (Resolved pre-publish)
- **Source systems**: 3 (Admissions, enrollment, results)

## Academic Results Analytics Dashboard
- Category: data
- Posted: 2026-01-15
- Updated: 2026-01-31
- Tags: Power BI, Excel, SQL, Data Validation, Reporting, Scripted QA
- Deliverable Link: [View SQL Validation Scripts](https://github.com/toughdave/scripting/tree/main/scripts/sql)
- PDF: N/A

### Project Summary
Built a comprehensive Power BI and Excel analytics suite to centralize results processing tracking, anomaly detection, and cohort performance analysis across multiple admissions and examination cycles at a university serving 4,000+ students.

### Technical Notes
- Consolidated fragmented results data from admissions portals, examination records, and departmental grade submissions into a unified reporting layer, applying SQL-driven validation checks to identify discrepancies such as missing scores, duplicate entries, and eligibility mismatches before official publication.
- Designed interactive KPI panels in Power BI with drill-down capabilities across student cohorts, academic sessions, and departments, enabling leadership to monitor processing timelines, flag anomaly rates in real-time, and compare performance trends across admission intakes.
- Developed automated data quality flags using conditional logic and formula-driven validation in Excel and Google Sheets, reducing the manual effort required to identify outliers and formatting inconsistencies across thousands of records each cycle.
- Delivered export-ready dashboards and audit-trail reports formatted for leadership reviews, accreditation audits, and departmental briefings, directly supporting executive planning decisions and resource allocation across academic programs.
- Work Context: At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this validation workflow was used to protect admissions and results reporting accuracy before publication. Current Implementation: I now maintain the same quality checks in personal GitHub assets (`scripts/sql/mysql/mysql_validate_results_integrity.sql`, `scripts/sql/postgres/postgres_validate_results_integrity.sql`, and `powerbi/powerquery/powerquery_data_quality_template.pq`) so each dashboard refresh starts with repeatable controls.

### Results and Impact
- **Records audited**: 4K+ (Admissions, exams, and results cycles)
- **Faster reconciliation**: 35% (Automation reduced manual review time)
- **Leadership dashboards**: 3 (Power BI, Excel, Sheets)

## Operational Reporting Automation Pipeline
- Category: automation
- Posted: 2025-12-12
- Updated: 2025-12-20
- Tags: Python, SQL, ETL Automation, Reporting, Workflow Automation, Scheduled Jobs
- Deliverable Link: [View ETL Runner Scripts](https://github.com/toughdave/scripting/tree/main/scripts/python/etl)
- PDF: N/A

### Project Summary
Designed and deployed automated data processing pipelines using Python and SQL to transform recurring operational reporting at a federal university from manual, error-prone spreadsheet work into scheduled, quality-checked workflows delivering consistent leadership updates across academic cycles.

### Technical Notes
- Developed Python ETL scripts to extract raw data from academic information systems and MySQL databases, applying automated cleansing routines to handle missing fields, formatting inconsistencies, and duplicate records before loading validated datasets into reporting-ready structures.
- Implemented quality assurance checkpoints within each pipeline stage — extraction validation, transformation rule verification, and output integrity checks — ensuring that data anomalies were caught and flagged before reports reached leadership, significantly reducing post-publication corrections.
- Standardized report templates and data visualizations across recurring deliverables including weekly KPI summaries, session progress updates, and variance analyses, eliminating the manual formatting and rework that previously consumed significant preparation time each reporting cycle.
- Delivered scheduled, automated reporting outputs that provided university leadership with timely insights into admissions throughput, examination processing status, and results publication readiness, directly supporting planning decisions and resource allocation across departments.
- Work Context: At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this pipeline pattern supported recurring admissions, examination, and results reporting with tighter turnaround times. Current Implementation: I mirror the same production cadence in the scripting repository through `scripts/python/etl/etl_runner.py` and `scripts/workflow/schedule_daily_run.sh`, using config-driven runs and timestamped logs.

### Results and Impact
- **Time saved**: 8 hrs/week (Automation vs manual prep)
- **Reports generated**: 40+ (Recurring leadership updates)
- **On-time delivery**: 100% (Scheduled pipeline runs)

## Admissions Data Quality Audit
- Category: data
- Posted: 2025-12-05
- Updated: 2025-12-18
- Tags: Excel, Google Sheets, SQL, Data Validation, Admissions Audit, Rules Engine
- Deliverable Link: [View Data Quality Scripts](https://github.com/toughdave/scripting/tree/main/scripts/python/data_quality)
- PDF: N/A

### Project Summary
Conducted systematic audits of multi-intake admissions datasets at a federal university, reconciling applicant records across identity fields, eligibility criteria, and enrollment status to ensure data integrity before final approvals for 2,000+ applicants per cycle.

### Technical Notes
- Designed and implemented spreadsheet-based validation workflows using advanced lookup formulas, deduplication rules, and eligibility logic to systematically cross-reference applicant submissions against institutional admission criteria, flagging inconsistencies in identity documents, qualification records, and program eligibility.
- Leveraged the institution's Gradent data processing platform alongside Excel and Google Sheets to extract audit exports, reconcile discrepancies between portal submissions and backend records, and deliver clean, verified rosters to admissions committees for final sign-off.
- Built variance summary reports and sign-off documentation packets that provided department heads with clear visibility into correction actions taken, residual error rates, and data quality metrics, supporting transparent and accountable admissions decisions.
- Established repeatable audit procedures that standardized how incoming applicant data was reviewed across multiple intake cycles, reducing manual re-checking and improving turnaround time for final admissions roster publication.
- Work Context: In my FUTA role (Systems & Data Analyst / System Programmer, 2017–2023), this audit pattern was used to verify admissions rosters before committee sign-off each intake cycle. Current Implementation: I now run the same rules through personal assets (`scripts/python/data_quality/config_rules_validator.py` and `data/sample/validation_rules.json`) so field completeness, score thresholds, and eligibility logic stay consistent.

### Results and Impact
- **Applicants reviewed**: 2K+ (Multi-intake audits)
- **Residual error rate**: 0.8% (After cleanup and verification)
- **Validation rule sets**: 4 (ID, eligibility, duplicates, missing fields)

## Operational Readiness Checks
- Category: systems
- Posted: 2025-11-20
- Updated: 2025-11-27
- Tags: Preventative Maintenance, Compliance, Windows Support, Troubleshooting, Operations
- Deliverable Link: N/A
- PDF: N/A

### Project Summary
Performed systematic preventative maintenance and operational readiness verification on examination technology infrastructure before high-stakes testing periods at a federal university, ensuring device compliance, software currency, and security baseline adherence across 150+ systems each exam cycle.

### Technical Notes
- Conducted comprehensive pre-examination readiness assessments covering operating system patch levels, antivirus definition currency, application version compliance, and hardware functionality across laptops and desktop systems used in examination environments.
- Tracked remediation status for identified deficiencies using structured checklists and status dashboards, coordinating with IT support teams to prioritize and resolve critical issues within a 24-hour turnaround target before examination commencement.
- Verified security baseline adherence including user account configurations, access control settings, and network connectivity requirements to ensure that examination systems met institutional security standards and could not be exploited for unauthorized activities during testing periods.
- Logged detailed readiness outcomes and compliance status reports for each examination cycle, building historical records that supported trend analysis, resource planning, and continuous improvement of the pre-exam technology verification process.
- Work Context: At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this readiness process was used before high-stakes examinations to enforce baseline compliance and rapid issue resolution. Current Implementation: I continue applying the same pre-flight verification model in personal operations checklists and lab maintenance routines.

### Results and Impact
- **Devices checked**: 150+ (Per exam cycle)
- **Compliance rate**: 98% (Pre-exam verification)
- **Issue turnaround**: 24 hrs (Readiness remediation)

## VLAN & IP Addressing Lab
- Category: networking
- Posted: 2025-10-04
- Updated: 2025-10-04
- Tags: VLAN, TCP/IP, IP Addressing, Switching, Routing
- Deliverable Link: N/A
- PDF: N/A

### Project Summary
Built and maintained a hands-on networking lab environment using enterprise-grade switching equipment and Cisco Packet Tracer to practice VLAN segmentation, IP addressing schemes, and structured network troubleshooting aligned with Cisco networking fundamentals.

### Technical Notes
- Configured trunk ports, access ports, and inter-VLAN routing scenarios on managed switches to create isolated network segments, simulating enterprise LAN environments where different departments or services operate on dedicated VLANs with controlled inter-segment communication.
- Developed structured IP addressing plans covering subnetting, CIDR notation, and address allocation strategies for multiple VLAN segments, documenting each scheme to mirror production-grade network planning methodologies used in enterprise environments.
- Created repeatable lab scenarios covering trunking configuration, VLAN assignment, static and dynamic routing integration, and basic failover testing, providing a consistent practice environment for validating networking concepts and troubleshooting common connectivity issues.
- Used Cisco Packet Tracer alongside physical equipment and a Cisco network switch to bridge simulation with real-world configuration experience, reinforcing concepts such as switch port security, VLAN pruning, and spanning tree behavior in a controlled lab setting.
- Work Context: At Pures College (Computer IT Instructor, 2024–2025), I used this VLAN and addressing workflow to coach students through practical troubleshooting in structured lab sessions. Current Implementation: I continue extending the same scenarios in my personal home lab for repeatable segmentation, routing, and failover testing.

### Results and Impact
- **VLAN segments**: 6 (Isolated lab services)
- **Endpoints simulated**: 20+ (Clients and lab servers)
- **Lab scenarios**: 4 (Trunking, routing, addressing, failover)

## Virtual Lab Deployment & Active Directory
- Category: systems
- Posted: 2025-10-02
- Updated: 2025-10-02
- Tags: Windows Server, Active Directory, Group Policy, VirtualBox/VMware, Lab Deployment
- Deliverable Link: N/A
- PDF: N/A

### Project Summary
Provisioned and maintained standardized Windows Server and Active Directory lab environments across VirtualBox and VMware platforms for 250+ students over multiple academic terms, ensuring consistent and reliable virtual infrastructure for hands-on systems administration coursework.

### Technical Notes
- Built baseline virtual machine images for Windows Server 2019/2022 and Windows 10/11 client systems in both Oracle VirtualBox and VMware Workstation Pro, pre-configuring Active Directory Domain Services, DNS, and Group Policy to provide students with ready-to-use lab environments from the first day of each term.
- Developed comprehensive setup playbooks and reset procedures to maintain consistency across 250+ student lab seats, enabling rapid redeployment of clean environments between terms and ensuring every student worked with identical baseline configurations regardless of their host machine.
- Guided students through the complete lifecycle of domain controller deployment — from initial server role installation and domain creation through user and group management, Organizational Unit structuring, and Group Policy Object configuration — coaching structured troubleshooting techniques for common AD, DNS resolution, and GPO application issues.
- Documented repeatable onboarding procedures covering hypervisor installation, virtual network adapter configuration, shared folder setup, and snapshot management, reducing first-week setup failures and allowing instructional time to focus on core systems administration concepts.
- Work Context: At Pures College (Computer IT Instructor, 2024–2025), these standardized virtual lab builds were used to support classroom delivery for systems administration practicals. Current Implementation: I continue refining the same baseline images and reset playbooks in personal projects for repeatable Active Directory and policy testing.

### Results and Impact
- **Lab seats**: 250+ (Student environments)
- **Core services**: 3 (AD, DNS, Group Policy)
- **Virtualization stacks**: 2 (VirtualBox and VMware)

## Examination Integrity Monitoring
- Category: systems
- Posted: 2025-09-30
- Updated: 2025-10-01
- Tags: Biometric Verification, CCTV Monitoring, Compliance, Incident Response, Audit Trails
- Deliverable Link: N/A
- PDF: N/A

### Project Summary
Designed and implemented a multi-layered examination integrity monitoring workflow at a federal university, integrating biometric identity verification, CCTV-based monitoring records, and structured incident reporting procedures to strengthen compliance and audit readiness across 12+ high-stakes examination cycles.

### Technical Notes
- Coordinated end-to-end device readiness for examination periods, including the setup, calibration, and testing of biometric fingerprint verification devices used to authenticate student identities before entry into examination halls, achieving 98% verification compliance rates across multiple terms.
- Established CCTV monitoring workflows with systematic incident logging procedures, ensuring continuous visual documentation of examination proceedings and creating a reliable chain-of-custody for recorded footage used in post-exam reviews and misconduct investigations.
- Developed standardized incident documentation templates and escalation procedures aligned with institutional compliance standards, enabling invigilators and support staff to consistently capture and report irregularities with the detail required for disciplinary and audit processes.
- Maintained comprehensive audit trails linking biometric verification records, surveillance footage timestamps, and incident reports to individual examination sessions, providing institutional leadership with transparent records for compliance reporting and policy review.
- Work Context: At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), this integrity workflow supported high-stakes exam operations with biometric checks, CCTV monitoring, and incident logging. Current Implementation: I now maintain the same control flow as checklist-driven templates in personal operations projects for readiness drills and audit reporting.

### Results and Impact
- **Verification compliance**: 98% (Biometric and CCTV checks)
- **Exam cycles**: 12+ (Multi-term coverage)
- **Critical gaps**: 0 (Incident handling standards)

## Systems Implementation & QA Playbooks
- Category: systems
- Posted: 2025-09-29
- Updated: 2025-09-29
- Tags: Documentation, QA Support, Implementation, Process Improvement, Change Management
- Deliverable Link: N/A
- PDF: N/A

### Project Summary
Created comprehensive implementation checklists, quality assurance scripts, and standardized documentation to bring consistency and repeatability to software rollouts, lab environment provisioning, and technical deployment workflows across classroom and examination environments.

### Technical Notes
- Defined structured testing gates, compatibility verification steps, and rollback procedures for each phase of software and system deployments, ensuring that new installations were validated against baseline requirements before being released to production or classroom environments.
- Developed step-by-step QA scripts covering pre-deployment environment checks, installation verification, post-deployment functional testing, and user acceptance criteria, reducing the likelihood of configuration drift and inconsistent setups across multiple machines.
- Aligned documentation standards with institutional procedures so that support staff and instructors could execute repeatable installations independently, following consistent handoff checklists that captured configuration details, version information, and known-issue workarounds.
- Maintained a living library of deployment playbooks covering common scenarios — including development tool installation (Eclipse, VS Code, MySQL), operating system configuration, virtual machine setup, and network service provisioning — with version tracking to keep procedures current as software updates were released.
- Work Context: Across FUTA (2017–2023) and Pures College (2024–2025), these implementation and QA playbooks were used to stabilize rollouts and reduce configuration drift across teams. Current Implementation: I continue maintaining the same checklist-first model in personal projects to keep deployments repeatable and auditable.

### Results and Impact
- **Deployments standardized**: 30+ (Checklist-driven rollouts)
- **Faster setup**: 15% (Reduced repeat troubleshooting)
- **Playbooks**: 6 (Install, QA, rollback, and docs)

## Routing & VPN Basics Lab
- Category: networking
- Posted: 2025-09-26
- Updated: 2025-10-04
- Tags: Routing, VPN Basics, TCP/IP, Troubleshooting, Network Design
- Deliverable Link: N/A
- PDF: N/A

### Project Summary
Designed and operated a multi-site network simulation lab to practice routing fundamentals, VPN tunnel configuration, and connectivity troubleshooting, reinforcing Cisco networking concepts through hands-on experimentation with both static and dynamic routing protocols.

### Technical Notes
- Configured multi-branch network topologies simulating enterprise WAN connectivity, including static routing paths for predictable traffic patterns and dynamic routing protocol scenarios that demonstrated how networks adapt to link failures and topology changes in production environments.
- Implemented VPN tunnel configurations across isolated network segments, practicing split-tunnel, full-tunnel, and failover scenarios to understand how encrypted connectivity is established and maintained between geographically separated sites.
- Captured detailed troubleshooting logs, packet traces, and failover behavior records for each lab scenario, building a documented reference library of common routing and VPN issues along with validated resolution steps for repeatable lab exercises.
- Bridged theoretical networking concepts with practical implementation by systematically working through real-world scenarios such as routing table convergence, asymmetric path detection, and VPN re-establishment after link failures, using both Packet Tracer simulations and physical lab equipment.
- Work Context: At Pures College (Computer IT Instructor, 2024–2025), I used these routing and VPN exercises to guide learners through structured troubleshooting and network behavior analysis. Current Implementation: I continue extending these scenarios in my personal lab to test failover handling and connectivity recovery patterns.

### Results and Impact
- **Site links**: 5 (Simulated branch network)
- **Routing modes**: 2 (Static and dynamic)
- **VPN scenarios**: 4 (Split, full, failover, fallback)

## DNS & DHCP Services Lab
- Category: networking
- Posted: 2025-09-19
- Updated: 2025-09-19
- Tags: DNS, DHCP, Windows, Linux, Network Services
- Deliverable Link: N/A
- PDF: N/A

### Project Summary
Configured and validated DNS and DHCP infrastructure services in a mixed Windows and Linux lab environment, building foundational network service skills for reliable name resolution, automated IP address management, and cross-platform client connectivity troubleshooting.

### Technical Notes
- Built forward and reverse DNS lookup zones with properly configured records (A, AAAA, PTR, CNAME, MX), establishing reliable name resolution services that client machines across multiple VLANs could use for both internal resource discovery and external connectivity.
- Configured DHCP server scopes with appropriate address ranges, lease durations, and reservation policies to provide automated IP assignment for 50+ mixed client devices, including both Windows and Linux systems operating across different network segments.
- Validated DHCP lease lifecycle behavior including initial allocation, renewal timing, and failover scenarios, documenting the troubleshooting steps for common issues such as IP conflicts, scope exhaustion, and relay agent misconfiguration in multi-segment environments.
- Tested cross-platform client connectivity to ensure consistent DNS resolution and DHCP address acquisition across Windows and Linux operating systems, verifying that network services functioned correctly regardless of client platform and documenting platform-specific configuration requirements.
- Work Context: At Pures College (Computer IT Instructor, 2024–2025), this DNS/DHCP workflow supported practical networking lessons on name resolution, lease behavior, and service troubleshooting. Current Implementation: I continue validating the same service patterns in my personal lab across segmented environments.

### Results and Impact
- **Leases managed**: 50+ (Mixed client devices)
- **DNS zones**: 2 (Forward and reverse)
- **Client OS**: 3 (Windows, Linux, VM lab)

## Technical Documentation & End-User Training
- Category: systems
- Posted: 2025-09-14
- Updated: 2025-09-14
- Tags: Documentation, End-User Training, Stakeholder Communication, Process Improvement, Knowledge Base
- Deliverable Link: N/A
- PDF: N/A

### Project Summary
Produced comprehensive standard operating procedures, technical runbooks, and hands-on training materials to support system rollouts, troubleshooting workflows, and staff onboarding across academic IT environments, directly reducing support ticket volume and accelerating new team member productivity.

### Technical Notes
- Authored detailed step-by-step installation guides, configuration runbooks, and quick-reference materials covering common system administration tasks, software deployment procedures, and troubleshooting workflows used by support staff and instructors across classroom and examination environments.
- Facilitated hands-on training workshops for technical and non-technical staff, translating complex system workflows into practical, actionable instructions and ensuring alignment on standard operating procedures, escalation paths, and documentation expectations across teams.
- Maintained a centralized knowledge base of documented solutions, known issues, and configuration templates that reduced repeat support tickets by providing staff with self-service access to verified resolution steps for frequently encountered problems.
- Developed onboarding documentation packages for new team members covering system access procedures, tool configurations, institutional workflows, and key contacts, enabling faster ramp-up and consistent adherence to operational standards from day one.
- Work Context: At FUTA and Pures College, these documentation assets were central to onboarding, support consistency, and smoother handoffs between technical teams. Current Implementation: I keep building the same runbook-first approach in personal projects to preserve repeatable setup and troubleshooting workflows.

### Results and Impact
- **Guides delivered**: 12 (SOPs and runbooks)
- **Workshops led**: 6 (Team onboarding sessions)
- **Users supported**: 100+ (Staff and students)

## Systems Support & Troubleshooting
- Category: systems
- Posted: 2025-09-06
- Updated: 2025-09-12
- Tags: Systems Support, Troubleshooting, Windows, Linux, Service Desk
- Deliverable Link: N/A
- PDF: N/A

### Project Summary
Provided frontline Windows and Linux systems support across academic IT environments, diagnosing and resolving hardware, operating system, and application issues while maintaining structured incident documentation and SLA compliance for 200+ tracked support requests.

### Technical Notes
- Diagnosed and resolved a diverse range of technical issues including hardware failures, OS boot and configuration problems, application installation errors, network connectivity issues, and peripheral device malfunctions across Windows and Linux platforms used in classroom and examination settings.
- Built and maintained a known-issues knowledge base documenting recurring problems, root cause analyses, and validated resolution steps, enabling faster incident resolution and reducing escalation rates for common support scenarios encountered across multiple academic terms.
- Tracked all support requests with detailed incident logs capturing symptoms, diagnostic steps taken, resolution actions, and time-to-resolution metrics, maintaining 95% SLA compliance for response and resolution targets across multiple academic terms and examination cycles.
- Escalated critical incidents through established channels with comprehensive documentation of troubleshooting steps already attempted, enabling senior support teams to quickly assess the situation and implement fixes while prevention recommendations were documented to reduce future recurrence.
- Work Context: At FUTA and Pures College, this incident-response workflow supported day-to-day system stability with structured diagnostics, logging, and escalation discipline. Current Implementation: I continue using the same root-cause and knowledge-base pattern in personal support workflows and lab operations.

### Results and Impact
- **Incidents resolved**: 200+ (Tracked support requests)
- **SLA compliance**: 95% (Response and resolution)
- **Knowledge base**: 1 (Documented recurring fixes)

## A Secured System for Internet-Enabled Host Devices
- Category: systems
- Posted: 2019-06-12
- Updated: 2025-10-27
- Tags: Cybersecurity, Access Control, ECDH, IoT Security, Security Research
- Deliverable Link: [Read Published Paper (CCSE Journal)](https://ccsenet.org/journal/index.php/nct/article/view/0/41982)
- PDF: [Download PDF](https://www.davidoncloud.com/docs/A-Secured-System-for-Internet-Enabled-Host-Devices.pdf)

### Project Summary
Co-authored a peer-reviewed research paper published in the Network and Communication Technologies journal (Canadian Center of Science and Education, 2020), proposing a Capability-based Context Aware Access Control (CCAAC) security model for internet-enabled host devices, validated through a custom web application implementing Elliptic-Curve Diffie-Hellman mutual authentication.

### Technical Notes
- Proposed and developed a security model adapting Capability-based Context Aware Access Control (CCAAC) for heterogeneous internet-enabled device environments, addressing authentication challenges in wireless communication topologies such as Wi-Fi and Long-Term Evolution (LTE) where unauthorized access, spoofing, and privilege escalation pose significant threats to device integrity and data confidentiality.
- Implemented the security model through TetherRemote, a custom-built web application enabling server-controller-client device pairing and remote management, using Apache and MySQL on a simulated server environment (XAMPP). As shown in Fig. 1, the TetherRemote dashboard provided administrators with a centralized overview of all registered devices — categorizing connected computers and smartphones, displaying their online/offline status, and serving as the primary interface for initiating device pairing, authorization, and management operations.
- Applied the Elliptic-Curve Diffie-Hellman (ECDH) algorithm for mutual device authentication, implementing secure key exchange where random prime number generation, public key encryption, and shared secret computation ensured that paired devices could cryptographically verify each other's identity before establishing trusted connections. Central to this process was the Capability structure illustrated in Fig. 2, where each device's Access Right was combined with its Device Identifier to form a capability token processed through the Identity and Capability-based Access Control Protocol (ICAP) — determining whether a subject device was authorized to access an object device based on context-aware policies.
- Designed a three-tier system architecture (Server, Controller, Client) where the server managed engine connectivity, device authorization, and pairing operations; smartphone controllers handled remote device management with assigned capability tokens and access rights (Read, Write, or NULL); and client machines processed authenticated instruction signals. Fig. 3 demonstrates the controller management interface, where administrators could view registered smartphone controllers, see their last-seen timestamps, and perform granular actions including assigning machines to controllers, viewing paired machines, configuring permissions, or revoking access — all governed by the capability-based access control policies enforcing least-privilege principles.
- Validated the CCAAC model against existing authentication solutions, demonstrating effectiveness against Denial of Service, Man-in-the-Middle, and Replay attacks. The Identity and Capability-based Access Control (IACAC) protocol achieved mutual authentication in 14.02ms — substantially outperforming competing schemes including IoT Auth (1,604ms) and HBQ (2,413ms) — while also addressing post-authentication access control that other schemes neglected.
- Documented the complete research methodology, system framework, and experimental validation results for academic peer review, culminating in publication in the Network and Communication Technologies journal (Vol. 5, No. 1, 2020, ISSN 1927-064X), contributing to the body of knowledge on IoT security and access control models for connected device environments.
- Work Context: This research and implementation work was completed during my FUTA tenure, where secure device access and policy enforcement were active operational concerns. Current Implementation: I continue applying the same access-control and secure-authentication principles in personal systems and automation projects.

### Results and Impact
- **Auth latency**: 14ms (IACAC mutual authentication)
- **Attacks mitigated**: 3 (DoS, MITM, Replay)
- **Published paper**: 1 (Peer-reviewed journal (CCSE, 2020))
