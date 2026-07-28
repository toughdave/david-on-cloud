# Portfolio Web Operations & Domain Administration

## Project Summary
Built and operated my portfolio website as a production-style web and domain operations project, combining CMS-managed content delivery, DNS record administration, Microsoft 365 identity governance, scripted release automation, and pre-flight validation checks across 50+ versioned releases.

## Work Context
At FUTA (Systems & Data Analyst / System Programmer, 2017–2023), I managed implementation handovers, post-deployment stabilization, and operational continuity for high-visibility institutional systems. At Pures College (Computer IT Instructor, 2024–2025), I maintained lab software installations and configuration baselines across classroom environments. Those same controls shaped how I run this website project end to end.

## Current Implementation
I now apply the same release discipline, validation controls, and operational monitoring to my portfolio operations, combining CMS governance, domain administration, identity controls, Docker-containerized support utilities, and continuous service validation before each production update.

## Extension: Multi-Tenant Custom Domains at Anchor Coaching
The same domain-operations skill set was applied at production scale during my contract engagement with Anchor Coaching (www.theanchorcoach.com, Remote, March 2026 – Present), where the requirement moved from operating one domain to letting many coaches attach their own.

- Shipped **host-resolved, DNS-verified custom storefront domains**, so an independent coach can point their own domain at their storefront and have ownership verified through DNS records before the domain goes live.
- Gated the capability behind an explicit environment-variable feature switch, so the rollout could be enabled deliberately per environment rather than shipping on by default.
- Authored a **deployment runbook for custom-domain go-live**, covering the ordered steps and verification points for the production cutover.
- Diagnosed and resolved outbound mail delivery on the platform's Hetzner hosting, moving SMTP from port 465 to **587 with STARTTLS** after the provider's port policy blocked the original configuration — the same class of connectivity troubleshooting as a blocked firewall port, applied to a mail path.
- Added rate limiting and audit logging to outbound mailbox sends, and access revocation on coach offboarding, so mail identity followed the same lifecycle discipline as any other account.

## Results and Impact
- Production domain managed: 1 (`davidoncloud.com` — DNS, SSL, email, hosting)
- Multi-tenant custom domains: host-resolved and DNS-verified, feature-switched for controlled rollout
- Releases shipped: 50+ (versioned, tagged, and validated)
- Core service layers: 5 (web delivery, DNS routing, identity administration, CMS, CI/CD)
- Pre-flight checks: 9 automated validation gates per release
- Mail delivery: outbound SMTP restored on Hetzner via STARTTLS on 587, with send rate limits and audit trail

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
