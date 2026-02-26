# Virtual Lab Deployment & Active Directory

## Project Summary
Provisioned and maintained standardized Windows Server and Active Directory lab environments across VirtualBox and VMware platforms for 250+ students, ensuring consistent and reliable virtual infrastructure for systems administration coursework.

## Work Context
At Pures College (Computer IT Instructor, 2024–2025), these lab builds supported classroom delivery for systems administration practicals. Baseline VM images were pre-configured with Active Directory Domain Services, DNS, and Group Policy so students had ready-to-use environments from the first day of each term.

## Current Implementation
I continue refining the same baseline images and reset playbooks in personal projects and consultant onboarding drills for repeatable Active Directory and Group Policy testing across VirtualBox and VMware.

## Results and Impact
- Lab seats supported: 250+
- Core services configured: 3 (AD, DNS, Group Policy)
- Virtualization stacks maintained: 2 (VirtualBox, VMware)

## Deliverables
- Baseline VM images for Windows Server 2019/2022 and Windows 10/11 client systems
- Setup playbooks and reset procedures for consistent redeployment between terms
- Onboarding documentation covering hypervisor installation, network adapter setup, and snapshot management

![VMware Active Directory lab baseline](/img/projects/systems/virtual-lab-active-directory/VMWare-1.png)

![VirtualBox Active Directory lab baseline](/img/projects/systems/virtual-lab-active-directory/VirtualBox-1.png)

## Technical Notes
- Domain controller lifecycle: role installation, domain creation, OU structuring, GPO configuration.
- Reset procedures ensure every student works from identical baseline configurations.
- Documented platform-specific steps for VirtualBox and VMware Workstation Pro.
