/**
 * Sync script — reads the resume v2 YAML index and generates src/data/portfolio.ts
 *
 * Index layout (v2): roles/<id>.yaml, projects/<id>.yaml, skills/<category>.yaml,
 * certifications.yaml, education.yaml, summaries.yaml. See ../resume/CLAUDE.md.
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
  path.resolve(__dirname, '../../resume/index');

const OUT_PATH = path.resolve(__dirname, '../src/data/portfolio.ts');

// ─── YAML type definitions (v2) ───

// YAML parses bare years as numbers and YYYY-MM as strings; accept both.
type PeriodPoint = string | number | Date;

interface PeriodYaml {
  start: PeriodPoint;
  end: PeriodPoint;
}

interface BulletYaml {
  id: string;
  kind: 'responsibility' | 'impact';
  text: string;
  skills?: string[];
  metrics?: string[];
  variants?: Record<string, string>;
}

interface RoleYaml {
  id: string;
  company: string;
  title: string;
  type: string;
  period: PeriodYaml;
  hidden?: boolean;
  skills?: string[];
  keywords?: string[];
  bullets?: BulletYaml[];
}

interface ProjectYaml {
  id: string;
  name: string;
  type?: string | null;
  repo?: string | null;
  period: PeriodYaml;
  summary: string;
  tagline?: string | null;
  tech_stack?: Record<string, string[] | undefined>;
  skills?: string[];
  keywords?: string[];
  bullets?: BulletYaml[];
}

interface SkillYaml {
  id: string;
  name: string;
  proficiency: 'advanced' | 'intermediate' | 'familiar';
  aliases?: string[];
  acronym?: string;
  evidence?: { ref: string; type: string; detail?: string }[];
}

interface SkillCategoryYaml {
  category: string;
  skills: SkillYaml[];
}

interface CertYaml {
  id: string;
  name: string;
  issuer: string;
  skills?: string[];
  keywords?: string[];
  relevance?: string[];
}

interface EducationYaml {
  institution: string;
  degree: string;
  field: string;
  period: PeriodYaml;
}

interface SummariesYaml {
  default: string;
  variants?: Record<string, string>;
  highlights?: string[];
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
    'Ollama', 'Local LLM', 'AI Agents', 'MCP', 'Model Context Protocol',
    'Agent Tooling', 'ONNX', 'ONNX Runtime', 'Vision Transformer', 'ViT',
    'Transformer', 'LoRA', 'Remote Sensing', 'Edge AI', 'Model Quantization',
    'INT8', 'INT8 Quantization', 'LLM Gateway', 'LLM Tool Use', 'Tool Calling',
    'Structured Output', 'LLMs / RAG', 'Large Language Models',
    'Inference', 'Model Serving', 'Knowledge Distillation', 'CNN',
    'Agentic Tooling', 'Coding Agents', 'Agentic Workflows', 'MCP Server',
  ],
  'Cloud & DevOps': [
    'Cloud', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Firebase',
    'CI/CD', 'DevOps', 'Infrastructure as Code', 'Monitoring',
    'Observability', 'Prometheus', 'Grafana', 'Distributed Tracing',
    'Containerization', 'Container Orchestration',
    'Site Reliability', 'Site Reliability Engineering', 'SRE', 'Tailscale',
    'OpenTelemetry', 'Tempo', 'Incident Response', 'GitHub Actions',
    'Docker Compose', 'Distroless Container',
  ],
  'Systems & Backend': [
    'Microservices', 'gRPC', 'REST API', 'API Gateway', 'Event-Driven',
    'Backend', 'Backend Development', 'Distributed Systems',
    'WebRTC', 'RabbitMQ', 'Redis', 'PostgreSQL', 'MongoDB', 'SQLite',
    'Rust', 'Go', 'Golang', 'C#', '.NET', 'Concurrency',
    'API Development', 'Software Engineering', 'Software Development',
    'Tokio', 'Axum', 'SQLx', 'Discord Bot', 'Circuit Breaker', 'OAuth',
    'OAuth 2.0 (PKCE)', 'OAuth 2.0 PKCE', 'Workplan', 'Crash Safety',
    'Crash-Safe', 'Journaling', 'Write-Ahead Log', 'FastAPI', 'Textual',
    'CLI', 'CLI Tool Development', 'Rate Limiting', 'Delivery Journal',
    'Rust Rewrite', 'End-to-End Encryption', 'Applied Cryptography',
    'Two-Factor Authentication (2FA)', 'Authenticator App',
  ],
  'IoT & Embedded': [
    'IoT', 'Embedded Systems', 'ESP32', 'FreeRTOS', 'BLE', 'LoRa',
    'MQTT', 'MQTT-SN', 'SPI', 'Raspberry Pi', 'Embedded C', 'C',
    'Hardware Driver', 'Mesh Networking', 'Systems Programming',
    'Real-Time Systems', 'UDP', 'LiDAR',
  ],
  'Mobile': [
    'Flutter', 'Android', 'Kotlin', 'Dart', 'Jetpack Compose',
    'Mobile Development', 'Cross-Platform Mobile', 'ARCore',
    'Augmented Reality', 'MVVM',
  ],
  'Game Dev & XR': [
    'Unity', 'Game Development', 'VR', 'XR', 'Multiplayer', 'Netcode',
    'Game Design', 'Game Mechanics', 'RTS', 'Simulation', 'Immersive',
    'C#', 'Digital Wellness', 'WebGL', 'Three.js',
  ],
  'Full Stack & Web': [
    'React', 'TypeScript', 'JavaScript', 'Full-Stack', 'Web Development',
    'Full-Stack Development', 'Frontend', 'Tailwind CSS', 'HTML', 'CSS',
    'PHP', 'Vite', 'Electron',
    'Svelte', 'SvelteKit', 'PWA', 'Progressive Web App (PWA)', 'Streamlit',
    'WebGL', 'Three.js', 'Next.js',
  ],
};

// Featured project IDs — curated list of showcase projects
const FEATURED_IDS = new Set([
  'aerial-scene-recognition',
  'kanade-v5',
  'kanata',
  'shiori',
  'kyomei',
  'carehaven',
]);

// Skill category display order (the v1 skills.yaml order); unknown categories follow alphabetically.
const CATEGORY_ORDER = [
  'Machine Learning & AI',
  'Programming Languages',
  'Cloud & Infrastructure',
  'Observability & Monitoring',
  'Architecture & Protocols',
  'IoT & Embedded Systems',
  'Databases',
  'Mobile Development',
  'Frontend & Web',
  'Game Development',
  'DevOps & Tooling',
  'Testing & QA',
];

const BIO_ROLES = [
  'Site Reliability Engineer Intern',
  'Student Research Engineer',
  'ML & Systems Engineer',
  'Rust & Go Backend Developer',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Helpers ───

function readYaml<T>(relPath: string): T {
  const filepath = path.join(RESUME_INDEX_PATH, relPath);
  const content = fs.readFileSync(filepath, 'utf-8');
  return yaml.load(content) as T;
}

function readYamlDir<T>(dir: string): T[] {
  const full = path.join(RESUME_INDEX_PATH, dir);
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort()
    .map((f) => readYaml<T>(path.join(dir, f)));
}

/** Normalise a period point to { year, month? } or 'present'. */
function parsePoint(p: PeriodPoint, ctx: string): 'present' | { year: number; month?: number } {
  if (p instanceof Date) return { year: p.getUTCFullYear(), month: p.getUTCMonth() + 1 };
  const s = String(p).trim();
  if (s.toLowerCase() === 'present') return 'present';
  const m = /^(\d{4})(?:-(\d{1,2}))?$/.exec(s);
  if (!m) throw new Error(`${ctx}: unrecognised period value '${s}'`);
  return { year: Number(m[1]), month: m[2] ? Number(m[2]) : undefined };
}

function formatPoint(p: PeriodPoint, ctx: string): string {
  const v = parsePoint(p, ctx);
  if (v === 'present') return 'Present';
  return v.month ? `${MONTHS[v.month - 1]} ${v.year}` : String(v.year);
}

/** 'Oct 2025 – Apr 2026' (EN DASH), 'Present', or bare year '2017'. */
function formatPeriod(period: PeriodYaml, ctx: string): string {
  return `${formatPoint(period.start, ctx)} – ${formatPoint(period.end, ctx)}`;
}

/** Sortable key for a period point: year*100 + month; present sorts after everything. */
function pointKey(p: PeriodPoint, ctx: string): number {
  const v = parsePoint(p, ctx);
  if (v === 'present') return Number.MAX_SAFE_INTEGER;
  return v.year * 100 + (v.month ?? 0);
}

/** Start descending; ties broken by end descending (present-ending first). */
function byPeriodDesc(a: { period: PeriodYaml; id: string }, b: { period: PeriodYaml; id: string }): number {
  return (
    pointKey(b.period.start, b.id) - pointKey(a.period.start, a.id) ||
    pointKey(b.period.end, b.id) - pointKey(a.period.end, a.id)
  );
}

function dedupe(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

// Keywords that collide when lowercased (LoRA fine-tuning vs LoRa radio) match case-sensitively.
const CASE_SENSITIVE_KEYWORDS = new Set(['LoRA', 'LoRa']);

function inferDomains(tags: string[]): string[] {
  const domains = new Set<string>();
  const tagsExact = new Set(tags);
  const tagsLower = new Set(tags.map((t) => t.toLowerCase()));

  for (const [domain, keywords] of Object.entries(DOMAIN_TAG_MAP)) {
    for (const kw of keywords) {
      const hit = CASE_SENSITIVE_KEYWORDS.has(kw) ? tagsExact.has(kw) : tagsLower.has(kw.toLowerCase());
      if (hit) {
        domains.add(domain);
        break;
      }
    }
  }

  return Array.from(domains);
}

const TECH_STACK_KEYS = ['languages', 'frameworks', 'infrastructure', 'patterns', 'tools'];

function flattenTechStack(ts: ProjectYaml['tech_stack']): string[] {
  if (!ts) return [];
  return dedupe(TECH_STACK_KEYS.flatMap((k) => ts[k] ?? []).map(String));
}

/** Only real GitHub slugs/URLs produce a link; local or annotated values produce none. */
function repoUrl(repo: string | null | undefined): string | undefined {
  if (!repo) return undefined;
  const r = repo.trim();
  if (/^https?:\/\/\S+$/.test(r)) return r;
  if (/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/.test(r)) return `https://github.com/${r}`;
  return undefined;
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

  const summaries = readYaml<SummariesYaml>('summaries.yaml');
  const educationData = readYaml<{ education: EducationYaml[] }>('education.yaml').education ?? [];
  const certsData = readYaml<{ certifications: CertYaml[] }>('certifications.yaml').certifications ?? [];
  const roles = readYamlDir<RoleYaml>('roles').sort(byPeriodDesc);
  const allProjects = readYamlDir<ProjectYaml>('projects');
  const projects = allProjects.filter((p) => p.id !== 'personal-website').sort(byPeriodDesc);

  const orderIndex = (name: string) => {
    const i = CATEGORY_ORDER.indexOf(name);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  const skillCats = readYamlDir<SkillCategoryYaml>('skills').sort(
    (a, b) => orderIndex(a.category) - orderIndex(b.category) || a.category.localeCompare(b.category),
  );

  // ─── Skill taxonomy ───
  const skillById = new Map<string, SkillYaml>();
  for (const cat of skillCats) {
    for (const skill of cat.skills ?? []) {
      if (skillById.has(skill.id)) console.warn(`Warning: duplicate skill id '${skill.id}'`);
      skillById.set(skill.id, skill);
    }
  }

  const resolveSkills = (ids: string[] | undefined, ctx: string): SkillYaml[] => {
    const out: SkillYaml[] = [];
    for (const id of ids ?? []) {
      const s = skillById.get(id);
      if (!s) {
        console.warn(`Warning: ${ctx} references unknown skill id '${id}'`);
        continue;
      }
      out.push(s);
    }
    return out;
  };

  const skillTerms = (s: SkillYaml): string[] => [s.name, ...(s.aliases ?? []), ...(s.acronym ? [s.acronym] : [])];

  /** Item skills followed by any extra skills cited only in its bullets. */
  const itemSkills = (item: { id: string; skills?: string[]; bullets?: BulletYaml[] }): SkillYaml[] => {
    const own = resolveSkills(item.skills, item.id);
    const fromBullets = (item.bullets ?? []).flatMap((b) => resolveSkills(b.skills, b.id));
    const seen = new Set<string>();
    return [...own, ...fromBullets].filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));
  };

  /** keywords ∪ name/aliases/acronym of every referenced skill. */
  const atsTagsFor = (item: { id: string; keywords?: string[]; skills?: string[]; bullets?: BulletYaml[] }) =>
    dedupe([...(item.keywords ?? []), ...itemSkills(item).flatMap(skillTerms)]);

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
  lines.push(`  roles: [${BIO_ROLES.map((r) => `'${escapeStr(r)}'`).join(', ')}],`);
  lines.push(`  summary: '${escapeStr(summaries.default)}',`);
  lines.push(`  email: 'pohaoting@gmail.com',`);
  lines.push(`  github: 'https://github.com/hoshinoht',`);
  lines.push(`  linkedin: 'https://www.linkedin.com/in/po-haoting/',`);
  lines.push('};');
  lines.push('');
  lines.push(`export const bioHighlights: string[] = ${toArrayLiteral(summaries.highlights ?? [], '')};`);
  lines.push('');

  // ─── Experience interface + data ───
  lines.push('export interface Experience {');
  lines.push('  id: string;');
  lines.push('  company: string;');
  lines.push('  title: string;');
  lines.push('  period: string;');
  lines.push("  type: 'research' | 'internship' | 'fulltime';");
  lines.push('  skills: string[];');
  lines.push('  bullets: string[];');
  lines.push('  domains: Domain[];');
  lines.push('  atsTags: string[];');
  lines.push('}');
  lines.push('');
  lines.push('export const experiences: Experience[] = [');

  const domainReport: { id: string; kind: string; domains: string[] }[] = [];

  // All roles are included, even `hidden: true` ones: hidden is a resume-selection concern.
  for (const role of roles) {
    const skills = itemSkills(role).map((s) => s.name);
    const atsTags = atsTagsFor(role);
    const domains = inferDomains([...atsTags, ...skills]);
    domainReport.push({ id: role.id, kind: 'role', domains });
    lines.push('  {');
    lines.push(`    id: '${role.id}',`);
    lines.push(`    company: '${escapeStr(role.company)}',`);
    lines.push(`    title: '${escapeStr(role.title)}',`);
    lines.push(`    period: '${formatPeriod(role.period, role.id)}',`);
    lines.push(`    type: '${role.type}',`);
    lines.push(`    skills: ${toArrayLiteral(skills, '    ')},`);
    lines.push(`    bullets: ${toArrayLiteral((role.bullets ?? []).map((b) => b.text), '    ')},`);
    lines.push(`    domains: ${toArrayLiteral(domains, '    ')},`);
    lines.push(`    atsTags: ${toArrayLiteral(atsTags, '    ')},`);
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
  lines.push('  atsTags: string[];');
  lines.push('}');
  lines.push('');
  lines.push('export const projects: Project[] = [');

  for (const proj of projects) {
    const techList = flattenTechStack(proj.tech_stack);
    const atsTags = atsTagsFor(proj);
    const domains = inferDomains([...atsTags, ...techList]);
    domainReport.push({ id: proj.id, kind: 'project', domains });
    const repo = repoUrl(proj.repo);
    const bullets = proj.bullets ?? [];
    const type = proj.type === 'team' ? 'team' : 'solo';
    if (proj.type && proj.type !== 'team' && proj.type !== 'solo') {
      console.warn(`Warning: project '${proj.id}' has type '${proj.type}', emitting 'solo'`);
    }

    lines.push('  {');
    lines.push(`    id: '${proj.id}',`);
    lines.push(`    name: '${escapeStr(proj.name)}',`);
    lines.push(`    summary: '${escapeStr(proj.summary)}',`);
    lines.push(`    period: '${formatPeriod(proj.period, proj.id)}',`);
    lines.push(`    type: '${type}',`);
    if (repo) {
      lines.push(`    repo: '${escapeStr(repo)}',`);
    }
    lines.push(`    responsibilities: ${toArrayLiteral(bullets.filter((b) => b.kind === 'responsibility').map((b) => b.text), '    ')},`);
    lines.push(`    impact: ${toArrayLiteral(bullets.filter((b) => b.kind === 'impact').map((b) => String(b.text)), '    ')},`);
    lines.push(`    tech: ${toArrayLiteral(techList, '    ')},`);
    lines.push(`    featured: ${FEATURED_IDS.has(proj.id)},`);
    lines.push(`    domains: ${toArrayLiteral(domains, '    ')},`);
    lines.push(`    atsTags: ${toArrayLiteral(atsTags, '    ')},`);
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');

  // ─── Skills ───
  lines.push('export interface SkillCategory {');
  lines.push('  name: string;');
  lines.push("  skills: { name: string; proficiency: 'advanced' | 'intermediate' | 'familiar'; atsKeywords: string[] }[];");
  lines.push('}');
  lines.push('');
  lines.push('export const skillCategories: SkillCategory[] = [');

  for (const cat of skillCats) {
    lines.push('  {');
    lines.push(`    name: '${escapeStr(cat.category)}',`);
    lines.push('    skills: [');
    for (const skill of cat.skills ?? []) {
      const kw = dedupe([...(skill.aliases ?? []), ...(skill.acronym ? [skill.acronym] : [])]);
      lines.push(`      { name: '${escapeStr(skill.name)}', proficiency: '${skill.proficiency}', atsKeywords: ${JSON.stringify(kw)} },`);
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

  for (const edu of educationData) {
    lines.push('  {');
    lines.push(`    institution: '${escapeStr(edu.institution)}',`);
    lines.push(`    degree: '${escapeStr(edu.degree)}',`);
    lines.push(`    field: '${escapeStr(edu.field)}',`);
    lines.push(`    period: '${formatPeriod(edu.period, edu.institution)}',`);
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');

  // ─── Certifications ───
  lines.push('export interface Certification {');
  lines.push('  name: string;');
  lines.push('  issuer: string;');
  lines.push('  atsKeywords: string[];');
  lines.push('}');
  lines.push('');
  lines.push('export const certifications: Certification[] = [');

  for (const cert of certsData) {
    const kw = dedupe([...(cert.keywords ?? []), ...resolveSkills(cert.skills, cert.id).map((s) => s.name)]);
    lines.push(`  { name: '${escapeStr(cert.name)}', issuer: '${escapeStr(cert.issuer)}', atsKeywords: ${JSON.stringify(kw)} },`);
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
    for (const cat of skillCats) {
      const catKeywords = (cat.skills ?? []).flatMap(skillTerms);
      const domainKeywords = DOMAIN_TAG_MAP[domain];
      const hasOverlap = domainKeywords.some((dk) =>
        catKeywords.some((ck) => ck.toLowerCase() === dk.toLowerCase()),
      );
      if (hasOverlap) {
        matchingCategories.push(cat.category);
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
  const featuredCount = projects.filter((p) => FEATURED_IDS.has(p.id)).length;
  for (const id of FEATURED_IDS) {
    if (!projects.some((p) => p.id === id)) console.warn(`Warning: featured id '${id}' not found in projects`);
  }
  const skillCount = skillCats.reduce((n, c) => n + (c.skills ?? []).length, 0);

  console.log('\nDomains per item:');
  for (const r of domainReport) {
    console.log(`  ${r.kind.padEnd(7)} ${r.id.padEnd(32)} ${r.domains.join(', ') || '(none)'}`);
  }
  const noDomain = domainReport.filter((r) => r.domains.length === 0);
  if (noDomain.length > 0) {
    console.warn(`Warning: ${noDomain.length} item(s) have no domain: ${noDomain.map((r) => r.id).join(', ')}`);
  }

  console.log(`\nSynced to ${OUT_PATH}`);
  console.log(`  ${roles.length} experiences, ${projects.length} projects (${featuredCount} featured)`);
  console.log(`  ${skillCount} skills across ${skillCats.length} categories`);
  console.log(`  ${educationData.length} education entries, ${certsData.length} certifications`);
  console.log(`  ${allDomains.length} interest domains: ${allDomains.join(', ')}`);
}

main();
