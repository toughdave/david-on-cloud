# 127-Chapter Role-Based Documentation System

## Project Summary
Authored and maintained a 127+ chapter documentation system for a multi-tenant SaaS platform, scoped per user role and CI-verified so that broken cross-links fail the build rather than reaching users.

## Work Context
Delivered as IT Administrator and Full-Stack Developer for Anchor Coaching (www.theanchorcoach.com, Remote, May–July 2026). The public documentation surface is live at https://www.theanchorcoach.com/documentation.

## The Problem
A platform with four distinct user types — Super Admin, Staff Coach, Independent Coach, and two client types — cannot be documented as one undifferentiated manual. A Staff Coach reading Super Admin procedures learns things they cannot act on and misses the ones they can. Meanwhile, documentation that is not validated rots silently: a renamed route leaves dead links that nobody notices until a user hits one.

## Approach
- Structured the material as **role-based manuals** so each audience reads only the surface it actually operates, with a clickable chapter rail and anchored sections for navigation.
- Wrote in plain English with short steps and explicit role boundaries, rather than in feature-reference style.
- Added **action playbooks** for common day-to-day tasks, so the docs answer "how do I do this" and not only "what is this."
- Wired **link integrity checking into CI**, so a renamed or removed chapter breaks the build on the pull request that caused it.
- Sourced content from current platform routes and public-safe product documentation, keeping it anchored to what the software actually does.

## Results and Impact
- Chapters authored: **127+**
- Distinct roles covered: **four** user types, plus public documentation surfaces
- Cross-link verification: **automated**, run on every pull request
- Dead links reaching production: **caught at CI** rather than reported by users

## Deliverables
- Role-scoped manuals for Super Admin, Staff Coach, Independent Coach, and client types
- Public documentation surface with chapter rail and anchored sections
- Action playbooks for recurring operational tasks
- CI job validating cross-links and chapter references
- Deployment runbooks for production cutover procedures

## Technical Notes
- Treating documentation as a build artifact — subject to the same validation gates as code — is what keeps it accurate past the week it was written.
- Role scoping is a security-adjacent concern as much as a usability one: documentation that describes actions a role cannot perform invites support tickets and confusion about permissions.
- This extends the documentation-standards practice established across admissions and examination workflows at FUTA, where written procedure was what made a one-person office auditable.
