#!/usr/bin/env node

/**
 * Generate LLM-friendly Markdown documents from CMS-managed JSON content.
 * Outputs:
 * - /llms.txt
 * - /index.html.md
 * - /projects.html.md
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://www.davidoncloud.com';

const readJson = (relativePath) => {
  const absolutePath = path.join(ROOT, relativePath);
  const content = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(content);
};

const writeText = (relativePath, content) => {
  const absolutePath = path.join(ROOT, relativePath);
  fs.writeFileSync(absolutePath, content.trimEnd() + '\n', 'utf8');
};

const normalizeText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const toBulletList = (items) => {
  const cleanItems = (Array.isArray(items) ? items : [])
    .map((item) => normalizeText(item))
    .filter(Boolean);

  return cleanItems.map((item) => `- ${item}`).join('\n');
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return normalizeText(value);
  return date.toISOString().slice(0, 10);
};

const buildHomeMarkdown = ({ about, skills, toolsPlatforms, experience }) => {
  const summary = toBulletList(about.professionalSummary || []);

  const education = (Array.isArray(about.education) ? about.education : [])
    .map((entry) => {
      const degree = normalizeText(entry.degree);
      const institution = normalizeText(entry.institution);
      const year = normalizeText(entry.year);
      return `- ${degree} - ${institution} (${year})`;
    })
    .join('\n');

  const skillBlocks = (Array.isArray(skills.categories) ? skills.categories : [])
    .map((category) => {
      const categoryTitle = normalizeText(category.title);
      const itemList = toBulletList(category.items || []);
      return `### ${categoryTitle}\n${itemList}`;
    })
    .join('\n\n');

  const toolBlocks = (Array.isArray(toolsPlatforms.categories) ? toolsPlatforms.categories : [])
    .map((category) => {
      const categoryTitle = normalizeText(category.title);
      const lines = (Array.isArray(category.items) ? category.items : [])
        .map((tool) => {
          const name = normalizeText(tool.name);
          const usage = normalizeText(tool.usage);
          return `- **${name}**: ${usage}`;
        })
        .join('\n');
      return `### ${categoryTitle}\n${lines}`;
    })
    .join('\n\n');

  const experienceBlocks = (Array.isArray(experience.entries) ? experience.entries : [])
    .map((entry) => {
      const title = normalizeText(entry.title);
      const company = normalizeText(entry.company);
      const location = normalizeText(entry.location);
      const period = normalizeText(entry.period);
      const focus = normalizeText(entry.focus);
      const outcomes = toBulletList(entry.outcomes || []);

      return [
        `### ${title}`,
        `- Organization: ${company}`,
        `- Location: ${location}`,
        `- Period: ${period}`,
        `- Work Context: ${focus}`,
        `- Key Outcomes:`,
        outcomes,
      ].join('\n');
    })
    .join('\n\n');

  const additionalExperience = normalizeText(about.additionalExperience);

  return [
    '# David On Cloud - Home (Markdown)',
    '> Systems and Data Analyst portfolio focused on academic information systems, data quality, reporting automation, and operational reliability.',
    '',
    '## Core Pages',
    `- [Projects (Markdown)](${SITE_URL}/projects.html.md): Full project index with project summaries, technical notes, impact, and deliverables.`,
    `- [Projects (JSON)](${SITE_URL}/js/projects.json): Canonical CMS-managed project records used by the website UI.`,
    '',
    '## Professional Summary',
    summary,
    '',
    '## Education',
    education,
    '',
    '## Additional Practical Experience',
    `- ${additionalExperience}`,
    '',
    `## ${normalizeText(skills.sectionTitle || 'Skills')}`,
    skillBlocks,
    '',
    `## ${normalizeText(toolsPlatforms.sectionTitle || 'Tools and Platforms')}`,
    toolBlocks,
    '',
    `## ${normalizeText(experience.sectionTitle || 'Work Experience')}`,
    experienceBlocks,
    '',
    '## Contact',
    `- Email: ${normalizeText(about.email)}`,
    `- Location: ${normalizeText(about.location)}`,
  ].join('\n');
};

const buildProjectsMarkdown = (projectsData) => {
  const projects = Array.isArray(projectsData.projects) ? [...projectsData.projects] : [];
  projects.sort((a, b) => new Date(b.posted || 0).getTime() - new Date(a.posted || 0).getTime());

  const projectBlocks = projects
    .map((project) => {
      const title = normalizeText(project.title);
      const category = normalizeText(project.category || 'other');
      const summary = normalizeText(project.summary || project.mobileSummary || '');
      const details = toBulletList(project.details || []);
      const tags = (Array.isArray(project.tags) ? project.tags : []).map((tag) => normalizeText(tag)).filter(Boolean);

      const impact = (Array.isArray(project.impact) ? project.impact : [])
        .map((entry) => {
          const value = normalizeText(entry.value);
          const label = normalizeText(entry.label);
          const detail = normalizeText(entry.detail);
          if (detail) {
            return `- **${label}**: ${value} (${detail})`;
          }
          return `- **${label}**: ${value}`;
        })
        .join('\n');

      const link = project.link ? `[${normalizeText(project.linkText || 'Project link')}](${normalizeText(project.link)})` : 'N/A';
      const pdf = project.pdf ? `[Download PDF](${SITE_URL}/${normalizeText(project.pdf).replace(/^\/+/, '')})` : 'N/A';

      return [
        `## ${title}`,
        `- Category: ${category}`,
        `- Posted: ${formatDate(project.posted)}`,
        `- Updated: ${formatDate(project.modified)}`,
        `- Tags: ${tags.length ? tags.join(', ') : 'N/A'}`,
        `- Deliverable Link: ${link}`,
        `- PDF: ${pdf}`,
        '',
        '### Project Summary',
        summary,
        '',
        '### Technical Notes',
        details || '- N/A',
        '',
        '### Results and Impact',
        impact || '- N/A',
      ].join('\n');
    })
    .join('\n\n');

  return [
    '# David On Cloud - Projects (Markdown)',
    '> Project portfolio in Markdown format for AI agents and lightweight text processing workflows.',
    '',
    '## Source of Truth',
    `- [Projects JSON](${SITE_URL}/js/projects.json): Canonical project content managed through CMS data files.`,
    '',
    projectBlocks,
  ].join('\n');
};

const buildLlmsTxt = () => {
  return [
    '# David On Cloud Portfolio',
    '> Systems and Data Analyst portfolio with project summaries, work context, current implementation notes, and impact records.',
    '',
    'Primary content is maintained in CMS-managed JSON files and rendered into website sections. Use the Markdown pages below for efficient retrieval, and use JSON sources for canonical structured values.',
    '',
    '## Core Markdown Pages',
    `- [Home (Markdown)](${SITE_URL}/index.html.md): Portfolio summary, skills, tools and platforms, work experience, and contact details.`,
    `- [Projects (Markdown)](${SITE_URL}/projects.html.md): Full project index with project summary, technical notes, impact, tags, and deliverables.`,
    '',
    '## Structured Data Sources',
    `- [Projects JSON](${SITE_URL}/js/projects.json): Canonical project records (summary, details, impact, tags, links, posted, modified).`,
    `- [Skills JSON](${SITE_URL}/js/skills.json): Skills categories and items.`,
    `- [Tools and Platforms JSON](${SITE_URL}/js/tools-platforms.json): Tool categories and usage notes.`,
    `- [Experience JSON](${SITE_URL}/js/experience.json): Work history and key outcomes.`,
    `- [About JSON](${SITE_URL}/js/about.json): Professional summary, education, and contact metadata.`,
    '',
    '## Optional',
    `- [Home (HTML)](${SITE_URL}/): Full interactive website view.`,
    `- [Projects (HTML)](${SITE_URL}/projects.html): Full interactive projects page.`,
  ].join('\n');
};

const main = () => {
  const about = readJson('js/about.json');
  const skills = readJson('js/skills.json');
  const toolsPlatforms = readJson('js/tools-platforms.json');
  const experience = readJson('js/experience.json');
  const projects = readJson('js/projects.json');

  writeText('index.html.md', buildHomeMarkdown({ about, skills, toolsPlatforms, experience }));
  writeText('projects.html.md', buildProjectsMarkdown(projects));
  writeText('llms.txt', buildLlmsTxt());

  console.log('Generated llms.txt, index.html.md, and projects.html.md');
};

main();
