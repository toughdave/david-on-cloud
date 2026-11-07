#!/usr/bin/env python3
"""Build the generalized resume PDF published on davidoncloud.com.

This is the site's general-purpose resume, not a job-tailored one. The facts it
states are locked in scripts/fact-lock.json, which mirrors the job-search source
of truth (the tailor-tech-resume skill on the H drive). Rules enforced here:

  * No em dash anywhere. Date ranges use a plain hyphen.
  * Education carries degree and institution only, never a year or range.
  * One target-title line, no pipe-separated keyword banner beneath it.
  * Employer line is "Employer - Remote, City, ON", with no client website
    and no "(Contract)" suffix.
  * Never the word "Present" for the Anchor engagement.
  * Canadian spelling.

Run:  python3 scripts/build_resume.py
Then: npm run audit        (the resume gate re-reads the PDF and checks it)
"""

import os
import sys

from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "T-David-Matthew-Resume-Information-Systems-Analyst.pdf")

NAME = "TOPE DAVID MATTHEW"
TARGET_TITLE = "INFORMATION SYSTEMS ANALYST"
CONTACT_1 = ("North York, ON | matthewtopedavid@gmail.com | 437-660-1843 | "
             "GitHub: www.github.com/toughdave")
CONTACT_2 = ("Portfolio: https://davidoncloud.com | "
             "LinkedIn: www.linkedin.com/in/tope-david-m-48076969")

SUMMARY = (
    "Information Systems and Data Analyst with a Master's degree in Computer Science and 9+ years "
    "across academic ERP environments, enterprise reporting workflows, and IT infrastructure "
    "administration. Experienced in application and production support, identity and access "
    "management, data validation and reporting, and systems implementation support, with recent "
    "contract delivery supporting a live multi-tenant platform and reviewing AI training-data "
    "quality. Combines structured systems analysis with hands-on automation, documentation, and "
    "reliability-focused operations."
)

SKILLS = [
    ("Systems &amp; Infrastructure",
     "Windows Server, Linux, Active Directory, Entra ID, Microsoft 365 Administration, Microsoft "
     "Intune, Exchange and SharePoint user support, TCP/IP, DNS, DHCP, VLANs, VMware, VirtualBox, Docker"),
    ("Support &amp; Service Operations",
     "Application and production support, incident and request workflow, ticketing and escalation, "
     "root-cause and recurring-issue analysis, ITIL-based service operations, endpoint and user-device support"),
    ("Data &amp; Reporting",
     "SQL/MySQL, PostgreSQL, Excel (advanced formulas and validation), Google Sheets, Power BI, "
     "Microsoft Fabric, ETL automation, reconciliation, data quality controls"),
    ("Automation &amp; Delivery",
     "Python, PowerShell, Bash, Git/GitHub, GitHub Actions CI/CD, automated testing, "
     "release and change coordination"),
    ("Analysis &amp; Governance",
     "Systems and business analysis, UAT and implementation support, technical documentation "
     "standards, knowledge management, process improvement"),
]

EXPERIENCE = [
    {
        "title": "IT Application/Production Support Analyst",
        "dates": "Sept 2025 - Sept 2026",
        "employer": "Anchor Coaching - Remote, North York, ON",
        "bullets": [
            "Provided production and application support for a live multi-tenant coaching platform "
            "serving administrators, staff coaches, independent coaches, and clients.",
            "Ran support ticketing and incident workflow end to end, diagnosing recurring faults and "
            "converting them into preventive fixes rather than repeat tickets.",
            "Resolved a production scheduling fault that could let two clients book the same session, "
            "moving the safeguard into the database so it applies to every booking route.",
            "Built the payments and payouts process, including coach payouts and a reconciliation "
            "check confirming the fees charged match the fees actually deducted.",
            "Implemented application-level MFA enrolment and enforcement, Entra ID app registration, "
            "and delegated Microsoft Graph access for calendar and mail integration.",
            "Supported endpoints and user devices across computers, phones, tablets, printers and "
            "peripherals as part of the wider application and access operation.",
            "Authored 127+ chapters of role-based user documentation with automated link checking in CI.",
            "Administered custom domain setup and verification, business email delivery and transport "
            "security, and scheduled backups; shipped 300+ reviewed changes with nightly automated testing.",
        ],
    },
    {
        "title": "AI Training Data Scientist / Data Analyst",
        "dates": "Dec 2025 - July 2026",
        "employer": "Outlier - Remote, North York, ON",
        "bullets": [
            "Reviewed the rubrics and automated tests used to grade AI training data, checking each "
            "criterion had exactly one defensible interpretation.",
            "Flagged tests that passed for only one specific solution, tests that validated their own "
            "output, and criteria carrying incorrect scoring weights.",
            "Separated checks a machine can verify from those needing human judgment, and cross-checked "
            "findings against independent analysis.",
        ],
    },
    {
        "title": "IT Systems Support and Computer Instructor",
        "dates": "Jan 2024 - Aug 2025",
        "employer": "Pures College of Technology - Scarborough, ON",
        "bullets": [
            "Supported 250+ students with hands-on lab guidance across laptops, desktops, tests, and "
            "project sessions.",
            "Built and maintained Windows Server and Windows client virtual labs in VirtualBox/VMware, "
            "including Active Directory and identity-access practicals.",
            "Installed, imaged and troubleshot course tooling (VS Code, Eclipse, MySQL, "
            "Python/HTML/CSS/JS) plus collaboration and access workflows.",
            "Ran networking practicals covering VLAN basics, cabling, and connectivity troubleshooting, "
            "documenting repeatable lab setups.",
        ],
    },
    {
        "title": "Systems &amp; Data Analyst / System Programmer (Head, System Programmer's Office)",
        "dates": "Mar 2017 - Aug 2023",
        "employer": "Federal University of Technology, Akure - Centre for Continuing Education",
        "bullets": [
            "Led the System Programmer's Office, owning admissions, examinations, academic records, and "
            "identity management for 4,000+ users.",
            "Migrated result processing from the legacy CLI-based Smarty workflow to the GUI-based "
            "Gradent platform, reducing turnaround from 3-5 days per programme to same-day and "
            "reclaiming 200+ hours annually.",
            "Processed and validated 800+ student records per cycle using SQL/MySQL querying, "
            "reconciliation, and pre-publication integrity checks.",
            "Provisioned and managed Active Directory users, staff and student portals, and departmental "
            "email, overseeing onboarding and offboarding across all Centre departments.",
            "Supported Microsoft Exchange and SharePoint for staff and students, and maintained IT asset "
            "inventory across laptops, tablets, biometric units and CCTV equipment.",
            "Built executive reporting in Excel, Google Sheets, and Power BI supporting enrolment "
            "planning and programme performance review.",
            "Provided Tier 1 to Tier 3 technical support, remote and on-premise, across all departments.",
        ],
    },
    {
        "title": "Computer Science (ICT) Teacher",
        "dates": "Dec 2014 - Aug 2015",
        "employer": "Community Secondary School, Agulu-Awka, Nigeria",
        "bullets": [
            "Delivered foundational computer science instruction emphasizing logical reasoning and "
            "structured problem solving.",
        ],
    },
]

EDUCATION = [
    "Master of Technology (M.Tech.), Computer Science, Federal University of Technology, Akure",
    "Bachelor of Technology (B.Tech.), Computer Science, Federal University of Technology, Akure",
    "Cloud Computing (coursework), Loyalist College",
]

ADDITIONAL = (
    "Enterprise-style home lab using Cisco Catalyst switching, VMware/VirtualBox virtualization, and "
    "Docker-based support utilities, covering routing, VLAN configuration, IP addressing, DNS, and DHCP "
    "in isolated test environments. Maintains domain and DNS operations and a CI-validated publishing "
    "pipeline for davidoncloud.com. Ongoing study toward CCNA and foundational cloud topics; these are "
    "study tracks, not completed certifications."
)

LEFT = RIGHT = 0.62 * inch
TOP = 0.5 * inch
BOTTOM = 0.45 * inch
USABLE = LETTER[0] - LEFT - RIGHT

S = {
    "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=16.5, leading=19,
                           alignment=1, spaceAfter=2),
    "contact": ParagraphStyle("contact", fontName="Helvetica", fontSize=8.1, leading=10.2,
                              alignment=1),
    "target": ParagraphStyle("target", fontName="Helvetica-Bold", fontSize=9.8, leading=12,
                             alignment=1, spaceBefore=4, spaceAfter=1),
    "h": ParagraphStyle("h", fontName="Helvetica-Bold", fontSize=9.6, leading=11.5,
                        spaceBefore=7, spaceAfter=3),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=8.6, leading=10.6,
                           alignment=TA_LEFT),
    "role": ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=9.1, leading=11,
                           spaceBefore=5),
    "dates": ParagraphStyle("dates", fontName="Helvetica-Bold", fontSize=9.1, leading=11,
                            alignment=2),
    "employer": ParagraphStyle("employer", fontName="Helvetica-Oblique", fontSize=8.5, leading=10.2,
                               spaceAfter=2),
    "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=8.5, leading=10.3,
                             leftIndent=10, bulletIndent=1, spaceAfter=1.2, alignment=TA_LEFT),
}


def rule():
    t = Table([[""]], colWidths=[USABLE], rowHeights=[0.8])
    t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.6, "#333333"),
                           ("TOPPADDING", (0, 0), (-1, -1), 0),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    return t


def role_line(title, dates):
    """Title left, date range right-aligned to the margin, in one row."""
    t = Table([[Paragraph(title, S["role"]), Paragraph(dates, S["dates"])]],
              colWidths=[USABLE * 0.70, USABLE * 0.30])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


def build():
    story = [
        Paragraph(NAME, S["name"]),
        Paragraph(CONTACT_1, S["contact"]),
        Paragraph(CONTACT_2, S["contact"]),
        Paragraph(TARGET_TITLE, S["target"]),
        rule(),
        Paragraph("PROFESSIONAL SUMMARY", S["h"]),
        Paragraph(SUMMARY, S["body"]),
        Paragraph("CORE TECHNICAL SKILLS", S["h"]),
    ]
    for label, items in SKILLS:
        story.append(Paragraph(f"<b>{label}:</b> {items}", S["bullet"], bulletText="•"))

    story.append(Paragraph("PROFESSIONAL EXPERIENCE", S["h"]))
    for role in EXPERIENCE:
        story.append(role_line(role["title"], role["dates"]))
        story.append(Paragraph(role["employer"], S["employer"]))
        for b in role["bullets"]:
            story.append(Paragraph(b, S["bullet"], bulletText="•"))

    story.append(Paragraph("EDUCATION", S["h"]))
    for line in EDUCATION:
        story.append(Paragraph(line, S["bullet"], bulletText="•"))

    story.append(Paragraph("ADDITIONAL PRACTICAL EXPERIENCE", S["h"]))
    story.append(Paragraph(ADDITIONAL, S["body"]))
    story.append(Spacer(1, 2))

    doc = BaseDocTemplate(
        OUT, pagesize=LETTER,
        leftMargin=LEFT, rightMargin=RIGHT, topMargin=TOP, bottomMargin=BOTTOM,
        title="Tope David Matthew - Resume", author="Tope David Matthew",
        subject="Information Systems / IT Support / Data Analyst",
    )
    frame = Frame(LEFT, BOTTOM, USABLE, LETTER[1] - TOP - BOTTOM, id="body",
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="page", frames=[frame])])
    doc.build(story)
    return doc.page


def self_check():
    """Fail loudly rather than publish a resume that breaks the hard rules."""
    blob = " ".join(
        [NAME, TARGET_TITLE, CONTACT_1, CONTACT_2, SUMMARY, ADDITIONAL]
        + [f"{a} {b}" for a, b in SKILLS]
        + EDUCATION
        + [f"{r['title']} {r['dates']} {r['employer']} {' '.join(r['bullets'])}" for r in EXPERIENCE]
    )
    problems = []
    if "—" in blob:
        problems.append("em dash present")
    for banned in ("99.9%", "40%", "Present", "(Contract)", "theanchorcoach.com", "Full-Stack Developer"):
        if banned in blob:
            problems.append(f"banned text: {banned}")
    for line in EDUCATION:
        if any(ch.isdigit() for ch in line):
            problems.append(f"education line carries a date: {line}")
    if problems:
        print("Resume source failed its own checks:", file=sys.stderr)
        for p in problems:
            print(f"  - {p}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    self_check()
    pages = build()
    print(f"Wrote {os.path.relpath(OUT, ROOT)} ({pages} page(s)).")
    if pages > 2:
        print("WARNING: resume exceeds the two-page maximum.", file=sys.stderr)
        sys.exit(1)
