import { bio, projects, skillCategories, experiences, education, certifications } from '../../data/portfolio';
import { PALETTE } from './constants';
import { Pool, type Bullet, type EnemyBullet, type Particle, type GameState } from './types';
import { MAX_LIVES } from './constants';

export function buildSpawnQueue(): GameState['spawnQueue'] {
  const q: GameState['spawnQueue'] = [];
  let w = 0;

  // ── Experience ──
  q.push({ text: '[ EXPERIENCE ]', color: PALETTE.heading, hp: 35, fireRate: 1.8, wave: w++ });
  for (const e of experiences) {
    const wv = w++;
    q.push({ text: e.title, color: PALETTE.company, hp: 20, fireRate: 0.9, wave: wv });
    q.push({ text: e.company, color: PALETTE.company, hp: 15, fireRate: 0.6, wave: wv });
    const sw = w++;
    for (const s of e.skills.slice(0, 3)) {
      q.push({ text: s, color: PALETTE.skill, hp: 10, fireRate: 0.4, wave: sw });
    }
  }

  // ── Projects (ALL) ──
  q.push({ text: '[ PROJECTS ]', color: PALETTE.heading, hp: 35, fireRate: 1.8, wave: w++ });
  for (const p of projects) {
    q.push({ text: p.name, color: PALETTE.project, hp: p.featured ? 25 : 18, fireRate: p.featured ? 0.7 : 0.5, wave: w });
    for (const t of p.tech.slice(0, 4)) {
      q.push({ text: t, color: PALETTE.skill, hp: 10, fireRate: 0.35, wave: w });
    }
    w++;
  }

  // ── Skills (ALL) ──
  q.push({ text: '[ SKILLS ]', color: PALETTE.heading, hp: 35, fireRate: 1.8, wave: w++ });
  for (const cat of skillCategories) {
    const cw = w++;
    q.push({ text: cat.name, color: PALETTE.company, hp: 18, fireRate: 0.6, wave: cw });
    for (const s of cat.skills) {
      q.push({ text: s.name, color: PALETTE.skill, hp: 12, fireRate: 0.5, wave: cw });
    }
  }

  // ── Education + Certs ──
  q.push({ text: '[ EDUCATION ]', color: PALETTE.heading, hp: 35, fireRate: 1.8, wave: w++ });
  for (const e of education) {
    const ew = w++;
    q.push({ text: e.institution, color: PALETTE.company, hp: 18, fireRate: 0.6, wave: ew });
    q.push({ text: `${e.degree} — ${e.field}`, color: PALETTE.project, hp: 14, fireRate: 0.5, wave: ew });
  }
  const certWave = w++;
  q.push({ text: '[ CERTIFICATIONS ]', color: PALETTE.heading, hp: 35, fireRate: 1.8, wave: certWave });
  for (const c of certifications) {
    q.push({ text: c.name, color: PALETTE.project, hp: 16, fireRate: 0.6, wave: certWave });
  }
  const issuerWave = w++;
  for (const c of certifications) {
    q.push({ text: c.issuer, color: PALETTE.company, hp: 10, fireRate: 0.4, wave: issuerWave });
  }

  // ── Final boss ──
  q.push({ text: bio.name, color: PALETTE.name, hp: 80, fireRate: 3.0, wave: w++ });

  return q;
}

export function createGameState(): GameState {
  return {
    ship: { x: 0, y: 0 },
    bullets: new Pool<Bullet>(
      () => ({ x: 0, y: 0, active: false }),
      b => { b.active = false; },
      b => b.active,
      200,
    ),
    enemyBullets: new Pool<EnemyBullet>(
      () => ({ x: 0, y: 0, vx: 0, vy: 0, active: false }),
      b => { b.active = false; },
      b => b.active,
      500,
    ),
    particles: new Pool<Particle>(
      () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '', size: 0, active: false }),
      p => { p.active = false; p.life = 0; },
      p => p.active,
      400,
    ),
    targets: [], fragments: [], helpers: [],
    keys: new Set(), firing: false,
    lastBulletTime: 0,
    spawnQueue: buildSpawnQueue(),
    spawnIndex: 0, lastSpawnTime: 0, nextId: 0,
    lives: MAX_LIVES, deathCount: 0,
    shipHitUntil: 0, shipInvincibleUntil: 0, screenShakeUntil: 0,
    deathX: 0, deathY: 0,
    bossPhaseTimer: 0, deathChoice: 0, deathChoiceAt: 0,
  };
}
