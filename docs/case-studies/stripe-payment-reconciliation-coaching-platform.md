# Stripe Payment Reconciliation for a Coaching Platform

## Project Summary
Built the payment and payout layer for a multi-tenant coaching platform: a provider adapter around Stripe, contractor payout disbursement, and estimated-vs-actual gateway-fee reconciliation so fee variances surface in the ledger instead of being silently absorbed.

## Work Context
Delivered as IT Administrator and Full-Stack Developer for Anchor Coaching (www.theanchorcoach.com, Remote, March 2026 – Present). The public plan structure this work supports — including the free tier and the "zero platform fee on your sales" commitment — is visible at https://www.theanchorcoach.com/suite/pricing.

## The Problem
A coaching platform that takes money on behalf of coaches has two numbers that must agree and usually don't: the fee **estimated** when a client is charged, and the fee the payment gateway **actually** deducts on settlement. If nothing reconciles the two, the difference quietly comes out of somebody's margin — and on a free tier that advertises no platform fee, that somebody is the platform.

## Approach
- Put gateway-specific logic behind a single payment-provider abstraction rather than letting Stripe calls spread through feature code, so the payment surface stays swappable and testable.
- Persisted the VAT breakdown and the gateway fee alongside each payment, making the fee a first-class recorded value rather than something recomputed on demand.
- Wrote the estimated and actual figures into an accounting journal so the variance is an auditable ledger entry, not a discrepancy someone notices later.
- Built payout disbursement covering the path from a completed coaching session through to a coach receiving funds, including multi-rail payout support and a self-serve earnings view.

## Results and Impact
- Reconciliation: **estimated vs. actual** gateway fees compared per payment and recorded
- Provider logic consolidated behind **one** adapter boundary
- Payout rails supported: **multiple**, with auto-disbursement and a pay-record view for coaches
- Free-tier economics made verifiable rather than assumed

## Deliverables
- Payment provider adapter isolating Stripe integration behind a stable interface
- Persisted VAT breakdown and gateway-fee capture on payment records
- Accounting journal service recording fee variance as auditable entries
- Coach payout auto-disbursement with multi-rail support and pay-record navigation
- Self-serve earnings view for independent coaches
- Refund guards blocking refunds on non-refundable bundle purchases

## Technical Notes
- This is the same reconciliation discipline applied to institutional financial data at FUTA — compare source against target, surface the variance, and make the check repeatable — expressed in a payments domain instead of an academic-records one.
- Recording the fee at payment time rather than deriving it later means historical records stay correct even when fee schedules change.
- Refund and payout paths were treated as part of the payment surface, not as afterthoughts — the failure modes there are the expensive ones.
