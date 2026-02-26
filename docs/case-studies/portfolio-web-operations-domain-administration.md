# Portfolio Web Operations & Domain Administration

## Project Summary
Built and operated my portfolio website as a production-style web and domain operations project, combining CMS-managed content delivery, DNS record administration, Microsoft 365 identity governance, scripted release automation, and pre-flight validation checks across 50+ versioned releases.

## Work Context
At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), I managed implementation handovers, post-deployment stabilization, and operational continuity for high-visibility institutional systems. At Pures College (Computer IT Instructor, 2024–2025), I maintained lab software installations and configuration baselines across classroom environments. Those same controls shaped how I run this website project end to end.

## Current Implementation
I now apply the same release discipline, validation controls, and operational monitoring to my portfolio operations, combining CMS governance, domain administration, identity controls, Docker-containerized support utilities, and continuous service validation before each production update.

## Results and Impact
- Production domain managed: 1 (`davidoncloud.com` — DNS, SSL, email, hosting)
- Releases shipped: 50+ (versioned, tagged, and validated)
- Core service layers: 5 (web delivery, DNS routing, identity administration, CMS, CI/CD)
- Pre-flight checks: 9 automated validation gates per release

## Deliverables
- CMS-managed content model using Decap CMS with structured JSON data sources
- Domain and DNS operations checklist covering A/CNAME/MX/TXT record lifecycle
- Scripted release workflow (Bash) handling version bump, cache-bust, changelog, Git tag, and push
- Node.js pre-flight validation script checking HTML, CSS, JS, images, favicon, and version consistency
- Docker-containerized support utilities for portable troubleshooting and deployment verification
- Localized frontend dependencies eliminating external CDN calls for production resilience
- Microsoft 365 Admin Center integration for identity provisioning and access governance

## Technical Notes
- Website content is managed from JSON/CMS sources with modular JavaScript rendering.
- Domain and DNS changes are verified before and after each release window.
- Identity and access updates are handled through Microsoft 365 admin workflows.
- All runtime frontend dependencies and fonts are localized to the repository.
- Release automation reduces manual steps and prevents version drift across assets.
- Docker containers keep validation and troubleshooting tools consistent across environments.
