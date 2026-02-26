# Cisco Catalyst 3850 Troubleshooting Lab (Phase 1)

## Project Summary
Completed a hands-on troubleshooting exercise on a physical Cisco Catalyst 3850 lab by resolving connectivity, subnet alignment, VLAN interface state, and DHCP conflict issues with command-level validation and screenshot-backed evidence.

## Work Context
At Pures College (Computer IT Instructor, 2024–2025), I regularly guided students through structured switch troubleshooting routines where each fault was isolated, corrected, and validated before moving to the next stage. This same approach was used in this lab phase to maintain clear diagnostics and consistent recovery steps.

## Current Implementation
I now run and document this workflow in my personal home lab and maintain evidence-backed records in my networking documentation repository so each troubleshooting phase can be reused as a repeatable reference project.

## Results and Impact
- Issues resolved: 5
- Evidence screenshots captured: 9
- Physical devices used: 3 (Catalyst switch + 2 endpoints)

## Deliverables
- Stepwise troubleshooting timeline with root cause and corrective actions
- Command snippets used for verification and DHCP cleanup
- Screenshot evidence extracted and arranged in issue sequence

## Technical Notes
- Connectivity checks used ICMP validation before and after each fix.
- VLAN/subnet alignment was corrected by readdressing the VLAN 1 SVI to the active segment.
- Inter-VLAN reachability was restored after bringing VLAN 30 out of shutdown state.
- DHCP conflict handling included clearing active bindings and removing conflicting assignment definitions.
