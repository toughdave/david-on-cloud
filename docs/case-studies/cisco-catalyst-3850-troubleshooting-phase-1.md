# Cisco Catalyst 3850 Troubleshooting Lab - Connectivity Recovery Playbook

## Project Summary
Executed a hands-on troubleshooting exercise on a physical Cisco Catalyst 3850 lab by resolving connectivity, subnet alignment, VLAN interface state, and DHCP conflict issues with command-level validation.

## Work Context
At Pures College (Computer IT Instructor, 2024–2025), I regularly guided students through structured switch troubleshooting routines where each fault was isolated, corrected, and validated before moving to the next stage. The same approach drove this lab execution to keep diagnostics clear and recovery steps consistent.

## Current Implementation
I now run and document this workflow in my personal home lab and consultant operations, pairing switch diagnostics with Docker-based validation checks, domain/DNS verification, and Microsoft 365 access-impact checks before closure.

## Results and Impact
- Issues resolved: 5
- Focused visuals used: 4
- Physical devices used: 3 (Catalyst switch + 2 endpoints)

## Deliverables
- Stepwise troubleshooting timeline with root cause and corrective actions
- Command snippets used for verification and DHCP cleanup
- Curated visual checkpoints aligned to each major recovery step

## Technical Notes
- Connectivity checks used ICMP validation before and after each fix.
- VLAN/subnet alignment was corrected by readdressing the VLAN 1 SVI to the active segment.
- Inter-VLAN reachability was restored after bringing VLAN 30 out of shutdown state.
- DHCP conflict handling included clearing active bindings and removing conflicting assignment definitions.
