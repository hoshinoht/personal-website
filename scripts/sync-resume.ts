/**
 * Sync script — reads resume YAML index files and generates src/data/portfolio.ts
 *
 * Usage:
 *   bun run sync                              # uses default path
 *   RESUME_INDEX_PATH=/path/to/index bun run sync  # custom path
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const RESUME_INDEX_PATH =
  process.env.RESUME_INDEX_PATH ||
  path.resolve(__dirname, '../../../sit/intern/resume/index');

const OUT_PATH = path.resolve(__dirname, '../src/data/portfolio.ts');

// ─── YAML type definitions ───

interface SummaryYaml {
  summary: string;
  highlights: string[];
}

interface RoleYaml {
  id: string;
  company: string;
  title: string;
  period: string;
  type: string;
  skills_used: string[];
  bullets: string[];
  ats_tags: string[];
}

interface EducationYaml {
  institution: string;
  degree: string;
  field: string;
  period: string;
}

interface ExperienceYaml {
  roles: RoleYaml[];
  education: EducationYaml[];
}

interface ProjectYaml {
  id: string;
  name: string;
  summary: string;
  period: string;
  type: string;
  repo?: string;
  responsibilities: string[];
  impact: string[];
  ats_tags: string[];
  tech_stack: {
    languages: string[];
    frameworks: string[];
    infrastructure: string[];
    patterns: string[];
    tools: string[];
  };
}

interface SkillYaml {
  name: string;
  proficiency: string;
  ats_keywords: string[];
  evidence: { ref: string; type: string; detail?: string }[];
}

interface SkillCategoryYaml {
  name: string;
  skills: SkillYaml[];
}

interface CertYaml {
  id: string;
  name: string;
  issuer: string;
  ats_keywords: string[];
  relevance: string[];
}

// ─── Domain mapping ───
// Maps ATS tags and skill category names to interest domains shown in the onboarding UI.
// A project/experience belongs to a domain if any of its tags match.

const DOMAIN_TAG_MAP: Record<string, string[]> = {
  'ML & AI': [
    'Machine Learning', 'Deep Learning', 'Neural Networks', 'LSTM', 'GRU', 'LLM',
    'NLP', 'Natural Language Processing', 'AI', 'Generative AI', 'GenAI',
    'Computer Vision', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'RAG',
    'Fine-Tuning', 'Multi-Agent', 'Federated Learning', 'Data Science',
    'ArcFace', 'ResNet', 'Sentence Embeddings', 'Embedding Cache',
    'Cross-Encoder', 'Reranking', 'Feature Engineering',
  ],
  'Cloud & DevOps': [
    'Cloud', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Firebase',
    'CI/CD', 'DevOps', 'Infrastructure as Code', 'Monitoring',
    'Observability', 'Prometheus', 'Grafana', 'Distributed Tracing',
    'Containerization', 'Container Orchestration',
  ],
  'Systems & Backend': [
    'Microservices', 'gRPC', 'REST API', 'API Gateway', 'Event-Driven',
    'Backend', 'Backend Development', 'Distributed Systems',
    'WebRTC', 'RabbitMQ', 'Redis', 'PostgreSQL', 'MongoDB', 'SQLite',
    'Rust', 'Go', 'Golang', 'C#', '.NET', 'Concurrency',
    'API Development', 'Software Engineering',
  ],
  'IoT & Embedded': [
    'IoT', 'Embedded Systems', 'ESP32', 'FreeRTOS', 'BLE', 'LoRa',
    'MQTT', 'MQTT-SN', 'SPI', 'Raspberry Pi', 'Embedded C', 'C',
    'Hardware Driver', 'Mesh Networking', 'Systems Programming',
    'Real-Time Systems', 'UDP',
  ],
  'Mobile': [
    'Flutter', 'Android', 'Kotlin', 'Dart', 'Jetpack Compose',
    'Mobile Development', 'Cross-Platform Mobile', 'ARCore',
    'Augmented Reality', 'MVVM',
  ],
  'Game Dev & XR': [
    'Unity', 'Game Development', 'VR', 'XR', 'Multiplayer', 'Netcode',
    'Game Design', 'Game Mechanics', 'RTS', 'Simulation', 'Immersive',
    'C#', 'Digital Wellness',
  ],
  'Full Stack & Web': [
    'React', 'TypeScript', 'JavaScript', 'Full-Stack', 'Web Development',
    'Full-Stack Development', 'Frontend', 'Tailwind CSS', 'HTML', 'CSS',
    'PHP', 'Vite', 'Electron',
  ],
};

// Featured project IDs — curated list of showcase projects
const FEATURED_IDS = new Set([
  'carehaven',
  'digital-kopitiam',
  'forest-link-protocol',
  'virtualkopis',
  'ats-tailor',
  'silveragent',
  'online-handwriting-similarity',
  'android-mesh-visualiser',
]);

// ─── Helpers ───

function readYaml<T>(filename: string): T {
  const filepath = path.join(RESUME_INDEX_PATH, filename);
  const content = fs.readFileSync(filepath, 'utf-8');
  return yaml.load(content) as T;
}

function inferDomains(tags: string[]): string[] {
  const domains = new Set<string>();
  const tagsLower = new Set(tags.map((t) => t.toLowerCase()));

  for (const [domain, keywords] of Object.entries(DOMAIN_TAG_MAP)) {
    for (const kw of keywords) {
      if (tagsLower.has(kw.toLowerCase())) {
        domains.add(domain);
        break;
      }
    }
  }

  return Array.from(domains);
}

function flattenTechStack(ts: ProjectYaml['tech_stack']): string[] {
  return [
    ...ts.languages,
    ...ts.frameworks,
    ...ts.infrastructure,
    ...ts.patterns,
    ...ts.tools,
  ].filter(Boolean);
}

function escapeStr(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function toArrayLiteral(arr: string[], indent: string): string {
  if (arr.length === 0) return '[]';
  const items = arr.map((s) => `${indent}  '${escapeStr(s)}',`).join('\n');
  return `[\n${items}\n${indent}]`;
}

// ─── Main ───

function main() {
  console.log(`Reading resume index from: ${RESUME_INDEX_PATH}`);

  // Verify path exists
  if (!fs.existsSync(RESUME_INDEX_PATH)) {
    console.error(`Error: Resume index path does not exist: ${RESUME_INDEX_PATH}`);
    console.error('Set RESUME_INDEX_PATH env var or ensure the default path exists.');
    process.exit(1);
  }

  const summaryData = readYaml<SummaryYaml>('summary.yaml');
  const experienceData = readYaml<ExperienceYaml>('experience.yaml');
  const projectsData = readYaml<{ projects: ProjectYaml[] }>('projects.yaml');
  const skillsData = readYaml<{ categories: SkillCategoryYaml[] }>('skills.yaml');
  const certsData = readYaml<{ certifications: CertYaml[] }>('certifications.yaml');

  // Build domain list from mapping
  const allDomains = Object.keys(DOMAIN_TAG_MAP);

  // Generate TypeScript
  const lines: string[] = [];

  lines.push('// Auto-generated by scripts/sync-resume.ts — do not edit manually');
  lines.push(`// Last synced: ${new Date().toISOString()}`);
  lines.push('');

  // ─── Domains ───
  lines.push(`export const domains = ${JSON.stringify(allDomains)} as const;`);
  lines.push('export type Domain = typeof domains[number];');
  lines.push('');

  // ─── Bio ───
  lines.push('export const bio = {');
  lines.push(`  name: 'Po Haoting',`);
  lines.push(`  roles: ['ML Research Assistant', 'Systems Engineer', 'Cloud Architect', 'Full Stack Developer'],`);
  lines.push(`  summary: '${escapeStr(summaryData.summary)}',`);
  lines.push(`  email: 'pohaoting@gmail.com',`);
  lines.push(`  github: 'https://github.com/hoshinoht',`);
  lines.push(`  linkedin: 'https://www.linkedin.com/in/po-haoting/',`);
  lines.push('};');
  lines.push('');

  // ─── Experience interface + data ───
  lines.push('export interface Experience {');
  lines.push('  id: string;');
  lines.push('  company: string;');
  lines.push('  title: string;');
  lines.push('  period: string;');
  lines.push("  type: 'research' | 'internship';");
  lines.push('  skills: string[];');
  lines.push('  bullets: string[];');
  lines.push('  domains: Domain[];');
  lines.push('}');
  lines.push('');
  lines.push('export const experiences: Experience[] = [');

  for (const role of experienceData.roles) {
    const domains = inferDomains([...role.ats_tags, ...role.skills_used]);
    lines.push('  {');
    lines.push(`    id: '${role.id}',`);
    lines.push(`    company: '${escapeStr(role.company)}',`);
    lines.push(`    title: '${escapeStr(role.title)}',`);
    lines.push(`    period: '${role.period}',`);
    lines.push(`    type: '${role.type}',`);
    lines.push(`    skills: ${toArrayLiteral(role.skills_used, '    ')},`);
    lines.push(`    bullets: ${toArrayLiteral(role.bullets, '    ')},`);
    lines.push(`    domains: ${toArrayLiteral(domains, '    ')},`);
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');

  // ─── Project interface + data ───
  lines.push('export interface Project {');
  lines.push('  id: string;');
  lines.push('  name: string;');
  lines.push('  summary: string;');
  lines.push('  period: string;');
  lines.push("  type: 'team' | 'solo';");
  lines.push('  repo?: string;');
  lines.push('  responsibilities: string[];');
  lines.push('  impact: string[];');
  lines.push('  tech: string[];');
  lines.push('  featured: boolean;');
  lines.push('  domains: Domain[];');
  lines.push('}');
  lines.push('');
  lines.push('export const projects: Project[] = [');

  for (const proj of projectsData.projects) {
    // Skip the personal-website entry
    if (proj.id === 'personal-website') continue;

    const techList = flattenTechStack(proj.tech_stack);
    const domains = inferDomains([...proj.ats_tags, ...techList]);
    const repoUrl = proj.repo?.startsWith('http')
      ? proj.repo
      : proj.repo
        ? `https://github.com/${proj.repo}`
        : undefined;

    lines.push('  {');
    lines.push(`    id: '${proj.id}',`);
    lines.push(`    name: '${escapeStr(proj.name)}',`);
    lines.push(`    summary: '${escapeStr(proj.summary)}',`);
    lines.push(`    period: '${proj.period}',`);
    lines.push(`    type: '${proj.type}',`);
    if (repoUrl) {
      lines.push(`    repo: '${repoUrl}',`);
    }
    lines.push(`    responsibilities: ${toArrayLiteral(proj.responsibilities, '    ')},`);
    lines.push(`    impact: ${toArrayLiteral(proj.impact.map(String), '    ')},`);
    lines.push(`    tech: ${toArrayLiteral(techList, '    ')},`);
    lines.push(`    featured: ${FEATURED_IDS.has(proj.id)},`);
    lines.push(`    domains: ${toArrayLiteral(domains, '    ')},`);
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');

  // ─── Skills ───
  lines.push('export interface SkillCategory {');
  lines.push('  name: string;');
  lines.push("  skills: { name: string; proficiency: 'advanced' | 'intermediate' | 'familiar' }[];");
  lines.push('}');
  lines.push('');
  lines.push('export const skillCategories: SkillCategory[] = [');

  for (const cat of skillsData.categories) {
    lines.push('  {');
    lines.push(`    name: '${escapeStr(cat.name)}',`);
    lines.push('    skills: [');
    for (const skill of cat.skills) {
      lines.push(`      { name: '${escapeStr(skill.name)}', proficiency: '${skill.proficiency}' },`);
    }
    lines.push('    ],');
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');

  // ─── Education ───
  lines.push('export interface Education {');
  lines.push('  institution: string;');
  lines.push('  degree: string;');
  lines.push('  field: string;');
  lines.push('  period: string;');
  lines.push('}');
  lines.push('');
  lines.push('export const education: Education[] = [');

  for (const edu of experienceData.education) {
    lines.push('  {');
    lines.push(`    institution: '${escapeStr(edu.institution)}',`);
    lines.push(`    degree: '${escapeStr(edu.degree)}',`);
    lines.push(`    field: '${escapeStr(edu.field)}',`);
    lines.push(`    period: '${edu.period}',`);
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');

  // ─── Certifications ───
  lines.push('export interface Certification {');
  lines.push('  name: string;');
  lines.push('  issuer: string;');
  lines.push('}');
  lines.push('');
  lines.push('export const certifications: Certification[] = [');

  for (const cert of certsData.certifications) {
    lines.push(`  { name: '${escapeStr(cert.name)}', issuer: '${escapeStr(cert.issuer)}' },`);
  }

  lines.push('];');
  lines.push('');

  // ─── Section config ───
  lines.push('export const sections = [');
  lines.push("  { id: 'hero', label: 'Home' },");
  lines.push("  { id: 'experience', label: 'Experience' },");
  lines.push("  { id: 'projects', label: 'Projects' },");
  lines.push("  { id: 'skills', label: 'Skills' },");
  lines.push("  { id: 'education', label: 'Education' },");
  lines.push('] as const;');
  lines.push('');

  // ─── Domain-to-skill-category mapping for filter highlighting ───
  const domainToCategoryMap: Record<string, string[]> = {};
  for (const domain of allDomains) {
    const matchingCategories: string[] = [];
    for (const cat of skillsData.categories) {
      const catKeywords = cat.skills.flatMap((s) => [s.name, ...s.ats_keywords]);
      const domainKeywords = DOMAIN_TAG_MAP[domain];
      const hasOverlap = domainKeywords.some((dk) =>
        catKeywords.some((ck) => ck.toLowerCase() === dk.toLowerCase()),
      );
      if (hasOverlap) {
        matchingCategories.push(cat.name);
      }
    }
    domainToCategoryMap[domain] = matchingCategories;
  }

  lines.push(`export const domainToSkillCategories: Record<Domain, string[]> = ${JSON.stringify(domainToCategoryMap, null, 2)};`);
  lines.push('');

  // Write file
  const output = lines.join('\n');
  fs.writeFileSync(OUT_PATH, output, 'utf-8');

  // Stats
  const expCount = experienceData.roles.length;
  const projCount = projectsData.projects.filter((p) => p.id !== 'personal-website').length;
  const skillCount = skillsData.categories.reduce((n, c) => n + c.skills.length, 0);
  const certCount = certsData.certifications.length;
  const eduCount = experienceData.education.length;

  console.log(`\nSynced to ${OUT_PATH}`);
  console.log(`  ${expCount} experiences, ${projCount} projects (${FEATURED_IDS.size} featured)`);
  console.log(`  ${skillCount} skills across ${skillsData.categories.length} categories`);
  console.log(`  ${eduCount} education entries, ${certCount} certifications`);
  console.log(`  ${allDomains.length} interest domains: ${allDomains.join(', ')}`);
}

main();
