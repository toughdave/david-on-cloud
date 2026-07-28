# Booking-Conflict Prevention with PostgreSQL Exclusion Constraints

## Project Summary
Closed a double-booking race condition on a live multi-tenant coaching platform by moving the booking-integrity guarantee out of application code and into the database, using a PostgreSQL `btree_gist` EXCLUDE constraint over the booking's time range.

## Work Context
Delivered as IT Administrator and Full-Stack Developer for Anchor Coaching (www.theanchorcoach.com, Remote, March 2026 – Present), a multi-tenant Next.js coaching SaaS platform serving Super Admin, Staff Coach, Independent Coach, and Suite client roles.

## The Problem
Concurrent booking requests could both pass an application-level availability check before either committed. Under normal load this was invisible; under simultaneous requests for the same coach slot, two overlapping bookings could be written, and the conflict then had to be untangled manually by a coach — after a client had already been told the slot was theirs.

## Approach
The fix went in as two layers, in order:

1. **Unique indexes** to close the exact-duplicate slot race first — the narrow, immediately shippable case.
2. **A `btree_gist` EXCLUDE constraint** over the booking interval to close the harder case: bookings that are not identical but *overlap*. The exclusion constraint rejects any two overlapping intervals for the same coach at the engine level.

An exclusion constraint was chosen over optimistic locking or advisory locks because it holds for **every** write path — application code, admin tooling, background jobs, and manual SQL — rather than only the paths that remember to take the lock. A guarantee that depends on every future caller behaving correctly is not a guarantee.

## Results and Impact
- Overlapping bookings possible after the fix: **0**, enforced by the database itself
- Write paths covered: **all** — the constraint cannot be bypassed by new code
- Conflict handling centralized behind a single shared sentinel so every call site reacts to a caught conflict the same way
- Regression coverage added as integration tests, re-run by CI on every pull request

## Deliverables
- Migration adding the booking-slot conflict unique index
- Migration adding the `btree_gist` overlap EXCLUDE constraint
- Shared slot-conflict detection module with unit tests
- Integration test suite exercising concurrent-booking scenarios
- Follow-up pass making every call site observe the shared conflict sentinel

## Technical Notes
- `btree_gist` is the PostgreSQL extension that lets a GiST index combine scalar equality (the coach identifier) with range overlap (the booking window) inside one exclusion constraint.
- The constraint expresses the business rule directly: for a given coach, no two active bookings may have overlapping time ranges.
- Because enforcement is declarative, the rule is visible in the schema rather than buried in service code — it documents itself for whoever maintains the platform next.
- Shipped across three pull requests, layering the narrow fix first and the general guarantee second, so each step was independently reviewable and revertible.
