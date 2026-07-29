# Preventing Double-Booked Coaching Sessions

## Project Summary
Fixed a fault on a live coaching platform that could let two clients book the same session at the same time. The safeguard now sits in the database rather than in one screen's code, so it applies to every route that creates a booking.

## Work Context
Delivered as IT Administrator and Full-Stack Developer for Anchor Coaching (www.theanchorcoach.com, Remote, March 2026 – Present), a multi-tenant Next.js coaching SaaS platform serving Super Admin, Staff Coach, Independent Coach, and Suite client roles.

## The Problem
Concurrent booking requests could both pass an application-level availability check before either committed. Under normal load this was invisible; under simultaneous requests for the same coach slot, two overlapping bookings could be written, and the conflict then had to be untangled manually by a coach — after a client had already been told the slot was theirs.

## Approach
The fix went in as two layers, in order:

1. **Block exact duplicates first** — the narrow case where two requests ask for the identical slot. This was the quickest safe win, so it shipped on its own.
2. **Then block overlaps** — the harder case, where two bookings are not identical but still collide (a 2:00–3:00 session against a 2:30–3:30 one). The database now rejects any two bookings for the same coach whose times overlap at all.

The key decision was *where* to put the rule. Putting it in the database means it applies to every route that creates a booking — the app, admin tools, background jobs, and manual data fixes — instead of only the paths a developer remembered to protect. A rule that depends on every future caller behaving correctly is not really a rule.

## Results and Impact
- Double bookings possible after the fix: **0**, prevented by the database itself
- Booking routes covered: **all** — the rule cannot be skipped by new code
- Conflict handling centralized so every part of the app responds to a rejected booking the same way
- Tests added covering simultaneous-booking scenarios, re-run automatically on every change

## Deliverables
- Database change blocking exact duplicate slots
- Database change blocking overlapping bookings for the same coach
- Shared conflict-detection module with unit tests
- Test suite exercising simultaneous-booking scenarios
- Follow-up pass making every part of the app handle a rejected booking consistently

## Technical Notes
For readers who want the specifics: the rule is a PostgreSQL exclusion constraint using the `btree_gist` extension, which lets one index combine an exact match (which coach) with a range check (does the time overlap). In plain terms, the database is told "for any one coach, no two active bookings may overlap in time," and it enforces that on every write.

- Expressing the rule in the schema keeps it visible to whoever maintains the platform next, rather than buried inside service code.
- Shipped across three changes — narrow fix first, general rule second — so each step could be reviewed and undone independently.
