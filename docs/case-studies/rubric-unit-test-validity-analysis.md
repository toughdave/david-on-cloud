# Rubric & Unit-Test Validity Analysis for AI Training Data

## Project Summary
Evaluated the validity of rubrics and unit tests used to train AI agents, applying a "zero degrees of freedom" standard to surface overfit assertions, self-referential test logic, and reward/penalty scoring errors, and separating machine-verifiable criteria from natural-language judgment.

## Work Context
Delivered as AI Training Data Scientist / Data Analyst for Outlier under the OpenClaw Atlas Program (Remote, February–July 2026).

## The Problem
Training data for AI agents is often graded by rubrics and unit tests written alongside the task. If a grading criterion admits more than one defensible interpretation, it does not measure capability — it measures whether the model guessed the author's intent. Worse failure modes hide inside tests that look rigorous:

- **Overfit assertions** that pin behaviour to one specific implementation, so a correct alternative solution fails.
- **Self-referential test logic** that validates its own output rather than the behaviour under test, and therefore passes regardless of correctness.
- **Reward/penalty scoring errors** that misprice a criterion, teaching the model the wrong lesson even when the check itself is sound.

## Approach
- Applied a **"zero degrees of freedom"** standard: a criterion is valid only if it has exactly one defensible interpretation. Anything else is a judgment call wearing a checkmark.
- Classified every criterion as either **deterministic and programmatically verifiable** or **requiring natural-language judgment** — the distinction that decides whether an item can be machine-scored at all.
- Read the Python/pytest suites directly rather than reasoning from task descriptions, since the assertion is the real specification.
- **Cross-validated** conclusions against independent AI-generated analysis, treating disagreement between the two as a signal for where to look harder rather than accepting either as authoritative.
- Applied coverage-gap analysis to find requirements the tests never exercised.

## Results and Impact
- Validity standard applied: **zero degrees of freedom** per criterion
- Criterion classification: **deterministic vs. natural-language judgment**, made explicit in every report
- Verification method: **two-way cross-validation** against independent analysis
- Findings delivered as structured written analysis supporting dataset-integrity decisions

## Deliverables
- Structured written analysis reports per task set
- Criterion-level classification separating verifiable checks from judgment calls
- Identified failure modes: overfit assertions, self-referential logic, scoring errors
- Coverage-gap findings for untested requirements

## Technical Notes
- Tools: Python, pytest, rubric and test-design review, LLM evaluation methodology.
- The analytical core here is the same one used for academic records at FUTA: establish ground truth, verify against it, and document the reasoning so the conclusion can be checked by someone else.
- A test that cannot fail is worse than no test — it produces false confidence and consumes the grading budget that a real check would have used.
