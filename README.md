# David On Cloud — Professional CV & Portfolio Website

**Live Portfolio**: [davidoncloud.com](https://davidoncloud.com) | **Version**: see `VERSION`

A modern, responsive portfolio website showcasing professional experience in information systems, system optimization, data analysis, reporting automation, and IT operations across academic and enterprise environments.

## Development and publishing

This site uses **Porkbun Secure Static Hosting**, connected to this repository's **main** branch through GitHub Connect. The domain registration and hosting subscription renew separately. GitHub Pages, Netlify and Vercel are not the production hosting service.

Use Node.js 24 LTS in WSL:

```bash
npm ci
npm run build
npm start
```

The build compiles Tailwind into `css/utilities.css`, validates HTML, JavaScript, CMS JSON and local resource paths, runs mocked contact-form regression tests, and copies public files into `dist/`. Production CSS is committed because Porkbun serves the repository directly; it does not execute the Node build. Run the build after introducing CSS classes in templates or CMS content. CI checks that committed CSS matches the source.

CMS content remains in `js/*.json`. Four selected case studies appear on the homepage; every visible project stays available in the full library. Project links use `projects.html?project=<id>` and reopen the corresponding detail view. These links work with new CMS records without a separate page-generation step.

After reviewing and committing a change batch:

```bash
printf 'Y\n' | bash scripts/bump_version.sh --type minor --local-only
npm run deploy
# Push only this release's tag after the live checks succeed:
git push origin "v$(cat VERSION)"
```

Choose patch, minor or major according to the change. `--local-only` prepares the version commit and tag without publishing. `npm run deploy` builds and validates, requires a clean main branch, checks that the remote can be advanced safely, and pushes main. Porkbun then updates the live site. The script checks the public release and reports a failure if it cannot verify it. `npm run deploy:staging` performs a local dry run without pushing. Before publishing CMS edits, note that GitHub Connect updates production on commit; CI is a check, not a deployment gate.

To roll back a bad release, revert its change and release commits on main, run the checks, and push the revert normally. Keep the known-good release tag; do not force-push public history.

The `_headers` file documents a configuration for hosts that support that format. Current Porkbun responses do not apply it. Server-only policies such as HSTS and frame restrictions require support from the hosting provider; HTML metadata is not a replacement. The pages set a referrer policy directly.

## About David

Systems and Data Analyst with M.Tech and B.Tech degrees in Computer Science, currently based in Toronto, ON (open to relocate). Professional background spans academic information systems, business application workflows, cloud-connected identity operations, system optimization, data quality assurance, reporting automation, and operational reliability across roles at a federal university and a private college.

## Website Features

### Responsive Design

- Mobile-first layout with grouped navigation (primary + secondary dropdown)
- Smooth animations using AOS (Animate On Scroll)
- Optional Vanta.js 3D background, loaded after Fun Lab is enabled
- Optimized for all device sizes

### Professional Sections

- **Hero**: Dynamic introduction with availability badge and CTA buttons
- **About**: Professional summary, education, and additional experience
- **Skills**: Seven skill categories covering systems, data, automation, and networking
- **Tools & Platforms**: Practical tool usage organized by delivery category
- **Scripts Library**: Curated script families linked to the scripting repository
- **Experience**: Work history with key outcomes and timeline
- **Projects**: CMS-managed project cards with case study links, impact metrics, and modal details
- **Process & Services**: Structured delivery methodology centered on system optimization and reliable handover
- **Testimonials**: Professional endorsements
- **Contact**: Functional contact form with Formspree integration

### Technical Features

- **CMS-Managed Content**: Decap CMS (admin/config.yml) with JSON data files
- **LLM-Friendly Docs**: Generated llms.txt, index.html.md, and projects.html.md
- **Version Control**: Automated version bumping with Git integration
- **Validation Pipeline**: HTML, CSS, JS, and JSON validation via CI/CD
- **Grouped Navigation**: CMS-managed primary and secondary menu composition
- **Project Modals**: Detailed views with Work Context and Current Implementation continuity
- **Local Vendor Hosting**: Runtime frontend libraries served from `/static/vendor` and local font assets

## Built With

### Frontend Technologies

- **HTML5** - Semantic markup
- **CSS3** - Custom animations and responsive design
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **JavaScript (ES6+)** - Interactive functionality and dynamic content loading

### Libraries & Frameworks

- **[AOS](https://michalsnik.github.io/aos/)** - Animate On Scroll library
- **[Vanta.js](https://www.vantajs.com/)** - 3D animated backgrounds
- **[Feather Icons](https://feathericons.com/)** - Icon set
- **[Formspree](https://formspree.io/)** - Contact form backend
- **[Decap CMS](https://decapcms.org/)** - Git-based content management

### Content & Data

- **CMS JSON Files**: about, skills, tools-platforms, script-library, experience, process, testimonials, contact, footer, hero, config
- **Projects JSON**: CMS-managed project entries with case study markdown and PDF deliverables
- **LLM Docs Generator**: Node.js script producing markdown pages from CMS data

## Featured Projects

### Data & Reporting

- **Academic Results Analytics Dashboard** - Power BI and Excel analytics for results processing and anomaly detection
- **Admissions Data Quality Audit** - Config-driven validation of multi-intake admissions datasets
- **Student Records Reconciliation Hub** - Centralized source-vs-target reconciliation across 3 systems
- **Exam Operations SLA Tracker** - SLA monitoring with at-risk flags for exam readiness checkpoints

### Automation

- **Operational Reporting Automation Pipeline** - Python/SQL ETL with scheduled quality-checked workflows

### Systems

- **Virtual Lab Deployment & Active Directory** - Standardized VM labs for 250+ students
- **Examination Integrity Monitoring** - Biometric verification, CCTV, and incident reporting
- **Portfolio Web Operations & Domain Administration** - CMS delivery, DNS routing, and Microsoft 365 operations support
- **A Secured System for Internet-Enabled Host Devices** - Peer-reviewed published research (CCSE, 2020)
- **Systems Implementation & QA Playbooks** - Deployment checklists and rollback procedures
- **Operational Readiness Checks** - Pre-exam device compliance and remediation tracking
- **Technical Documentation & End-User Training** - SOPs, runbooks, and onboarding packages
- **Systems Support & Troubleshooting** - Frontline Windows/Linux support with SLA compliance

### Networking

- **VLAN & IP Addressing Lab** - Enterprise switching with VLAN segmentation and IP planning
- **Routing & VPN Basics Lab** - Multi-site routing and VPN tunnel configuration
- **DNS & DHCP Services Lab** - Cross-platform name resolution and IP management

## Contact

- **Email**: [matthewtopedavid@gmail.com](mailto:matthewtopedavid@gmail.com)
- **Location**: Toronto, ON, Canada (open to relocate)
- **LinkedIn**: [tope-david-m-48076969](https://www.linkedin.com/in/tope-david-m-48076969)
- **GitHub**: [toughdave](https://github.com/toughdave)

## License

All rights reserved. David on Cloud.

### Social link previews

Both HTML pages include static Open Graph and Twitter card tags near the beginning of the head, so link crawlers do not need JavaScript. The shared image is `img/branding/portfolio-preview-2026-09.jpg` (1200 x 630, approximately 106 KB). Keep its dimensions and MIME type aligned with the HTML metadata, and give replacement images a new filename so social caches can refresh. Preserve old image URLs for existing shares.

After changing preview metadata, publish first and then use [Meta's Sharing Debugger](https://developers.facebook.com/tools/debug/) to scrape the URL again. A successful debugger preview verifies Facebook's fetched metadata; it cannot guarantee WhatsApp's device or cache behavior. In WhatsApp, `Settings > Privacy > Advanced > Disable link previews` must be off to generate outgoing previews. [WhatsApp documentation](https://faq.whatsapp.com/445453537819972/).