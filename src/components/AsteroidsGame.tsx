import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { bio, projects, skillCategories, experiences, education, certifications } from '../data/portfolio';
import styles from '../styles/components/AsteroidsGame.module.scss';

/* ── Types ── */
interface Ship { x: number; y: number }
interface Bullet { x: number; y: number; active: boolean }
interface EnemyBullet { x: number; y: number; vx: number; vy: number; active: boolean }
interface Target {
  id: number; x: number; y: number;
  width: number; height: number;
  text: string; hp: number; maxHp: number;
  color: string; speed: number;
  flashUntil: number;
  fireRate: number;
}
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; active: boolean }
interface Fragment {
  body: Matter.Body; color: string;
  width: number; height: number; life: number;
}
interface Helper {
  x: number; y: number;
  name: string;
  color: string;
  lastFireTime: number;
}
type Phase = 'intro' | 'playing' | 'death' | 'destroyed' | 'done';

/* ── Object pools ── */
class Pool<T> {
  private items: T[] = [];
  private create: () => T;
  private reset: (item: T) => void;
  private isActive: (item: T) => boolean;

  constructor(create: () => T, reset: (item: T) => void, isActive: (item: T) => boolean, initial = 0) {
    this.create = create;
    this.reset = reset;
    this.isActive = isActive;
    for (let i = 0; i < initial; i++) { const item = create(); reset(item); this.items.push(item); }
  }

  get(): T {
    // Reuse inactive item
    for (const item of this.items) {
      if (!this.isActive(item)) return item;
    }
    // Grow pool
    const item = this.create();
    this.items.push(item);
    return item;
  }

  forEach(fn: (item: T) => void) {
    for (const item of this.items) {
      if (this.isActive(item)) fn(item);
    }
  }

  filter(fn: (item: T) => boolean) {
    for (const item of this.items) {
      if (this.isActive(item) && !fn(item)) this.reset(item);
    }
  }

  count(): number {
    let n = 0;
    for (const item of this.items) if (this.isActive(item)) n++;
    return n;
  }

  deactivateAll() {
    for (const item of this.items) this.reset(item);
  }
}

interface GameState {
  ship: Ship;
  bullets: Pool<Bullet>;
  enemyBullets: Pool<EnemyBullet>;
  particles: Pool<Particle>;
  targets: Target[];
  fragments: Fragment[];
  helpers: Helper[];
  keys: Set<string>;
  firing: boolean;
  lastBulletTime: number;
  spawnQueue: Array<{ text: string; color: string; hp: number; fireRate: number; wave: number }>;
  spawnIndex: number;
  lastSpawnTime: number;
  nextId: number;
  lives: number;
  deathCount: number;
  shipHitUntil: number;
  shipInvincibleUntil: number;
  screenShakeUntil: number;
  deathX: number;
  deathY: number;
  bossPhaseTimer: number;
  deathChoice: 0 | 'y' | 'n';     // 0 = waiting, 'y' = accepted, 'n' = rejected
  deathChoiceAt: number;           // timestamp when choice was made
}

/* ── Constants ── */
const SHIP_SIZE = 56;
const SHIP_SPEED = 450;
const BULLET_SPEED = 700;
const BULLET_INTERVAL = 110;
const HELPER_FIRE_INTERVAL = 170;
const ENEMY_BULLET_SPEED = 270;
const SPAWN_INTERVAL = 550;
const BASE_ACTIVE_TARGETS = 16;
const MAX_ACTIVE_TARGETS = 32;
const INTRO_DURATION = 4500;
const OUTRO_DURATION = 9500;
const DEATH_EXPLOSION_DURATION = 2800;  // explosion before fade to black
const DEATH_PROMPT_TIME = 12000;        // when Y/N prompt appears (relative to text start)
const DEATH_ACCEPT_DURATION = 2500;     // time after accepting before revive
const HIT_INVINCIBILITY = 1500;
const SHIP_HIT_RADIUS = SHIP_SIZE / 2 - 4;
const HELPER_HIT_RADIUS = 28;
const MAX_LIVES = 3;

const PALETTE = {
  heading: '#C4A2D4',
  company: '#6EC4B8',
  project: '#B0BCE8',
  skill: '#82C8A0',
  name: '#F3BDCA',
  enemyBullet: '#E27878',
  helper: '#6EC4B8',
};

const RESCUE_NAMES = [
  '2B_backup_07', '9S_recovery', 'A2_override', 'Pod_042', 'Pod_153',
  'Operator_6O', 'Commander_White', 'Emil_♪', 'Devola', 'Popola',
  'git_push_--force', 'rm_-rf_/production', 'sudo_make_sandwich',
  'localhost:3000', 'null_pointer_exception', 'merge_conflict_survivor',
  'chmod_777', 'stack_overflow', '404_not_found', 'git_blame',
  'async_await_forever', 'segfault_core_dumped', 'LGTM_ship_it',
];
const HELPER_COLORS = ['#6EC4B8', '#B0BCE8', '#82C8A0', '#E8C97E', '#75D6F6', '#F3BDCA', '#C4A2D4', '#DDA05C'];

/* ── Spawn queue — BULLET HELL difficulty ──
   wave: how many targets spawn together in this batch.
   Targets with the same wave number spawn simultaneously. */
function buildSpawnQueue(): GameState['spawnQueue'] {
  const q: GameState['spawnQueue'] = [];
  let w = 0; // wave counter

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

  // ── Final boss (alone) ──
  q.push({ text: bio.name, color: PALETTE.name, hp: 80, fireRate: 3.0, wave: w++ });

  return q;
}

/* ── Init state ── */
function createGameState(): GameState {
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

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.scale(dpr, dpr);
}

/* ── Helpers to spawn pooled objects ── */
function spawnEnemyBullet(gs: GameState, x: number, y: number, vx: number, vy: number) {
  const b = gs.enemyBullets.get();
  b.x = x; b.y = y; b.vx = vx; b.vy = vy; b.active = true;
}
function spawnBullet(gs: GameState, x: number, y: number) {
  const b = gs.bullets.get();
  b.x = x; b.y = y; b.active = true;
}
function spawnParticle(gs: GameState, x: number, y: number, vx: number, vy: number, life: number, color: string, size: number) {
  const p = gs.particles.get();
  p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.color = color; p.size = size; p.active = true;
}

/* ── Fire enemy bullets (bullet hell patterns) ── */
function fireEnemyBullets(t: Target, gs: GameState, now: number) {
  const tdx = gs.ship.x - t.x;
  const tdy = gs.ship.y - t.y;
  const dist = Math.sqrt(tdx * tdx + tdy * tdy);
  if (dist < 1) return;
  const baseAngle = Math.atan2(tdy, tdx);
  const spd = ENEMY_BULLET_SPEED;

  if (t.maxHp >= 40) {
    // ═══ FINAL BOSS — rotating pattern cycle ═══
    const phase = Math.floor(gs.bossPhaseTimer / 2) % 5;
    const hpRatio = t.hp / t.maxHp;

    if (phase === 0) {
      // Dense ring: 16-20 bullets
      const count = 16 + Math.floor((1 - hpRatio) * 8); // more bullets as HP drops
      const offset = now / 300; // slow rotation
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + offset;
        spawnEnemyBullet(gs, t.x, t.y, Math.cos(a) * spd * 0.85, Math.sin(a) * spd * 0.85);
      }
    } else if (phase === 1) {
      // 7-spread aimed barrage
      for (let i = -3; i <= 3; i++) {
        const a = baseAngle + i * 0.12;
        spawnEnemyBullet(gs, t.x, t.y + t.height / 2, Math.cos(a) * spd * 1.15, Math.sin(a) * spd * 1.15);
      }
    } else if (phase === 2) {
      // Double spiral arms
      const offset = now / 200;
      for (let arm = 0; arm < 2; arm++) {
        const a = offset + arm * Math.PI;
        spawnEnemyBullet(gs, t.x, t.y, Math.cos(a) * spd, Math.sin(a) * spd);
        spawnEnemyBullet(gs, t.x, t.y, Math.cos(a + 0.3) * spd * 0.8, Math.sin(a + 0.3) * spd * 0.8);
      }
    } else if (phase === 3) {
      // Cross pattern — 4 cardinal directions + aimed
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + now / 500;
        spawnEnemyBullet(gs, t.x, t.y, Math.cos(a) * spd, Math.sin(a) * spd);
      }
      // Plus aimed triple
      for (let i = -1; i <= 1; i++) {
        const a = baseAngle + i * 0.15;
        spawnEnemyBullet(gs, t.x, t.y, Math.cos(a) * spd * 1.2, Math.sin(a) * spd * 1.2);
      }
    } else {
      // Shotgun: 9 bullets in tight cone aimed at player
      for (let i = -4; i <= 4; i++) {
        const a = baseAngle + i * 0.08;
        const s = spd * (0.9 + Math.random() * 0.3);
        spawnEnemyBullet(gs, t.x, t.y + t.height / 2, Math.cos(a) * s, Math.sin(a) * s);
      }
    }

    // Below 50% HP: bonus random spray every fire
    if (hpRatio < 0.5) {
      const extra = Math.floor((1 - hpRatio) * 6);
      for (let i = 0; i < extra; i++) {
        const a = Math.random() * Math.PI * 2;
        spawnEnemyBullet(gs, t.x, t.y, Math.cos(a) * spd * 0.7, Math.sin(a) * spd * 0.7);
      }
    }
  } else if (t.maxHp >= 16) {
    // Headings: 3-4 bullet aimed spread
    const count = 3 + (Math.random() < 0.4 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const a = baseAngle + (i - (count - 1) / 2) * 0.18;
      spawnEnemyBullet(gs, t.x, t.y + t.height / 2, Math.cos(a) * spd, Math.sin(a) * spd);
    }
  } else if (t.maxHp >= 10) {
    // Medium: 2-bullet spread
    for (let i = -1; i <= 1; i += 2) {
      const a = baseAngle + i * 0.1;
      spawnEnemyBullet(gs, t.x, t.y + t.height / 2, Math.cos(a) * spd * 0.95, Math.sin(a) * spd * 0.95);
    }
  } else {
    // Small: single aimed
    spawnEnemyBullet(gs, t.x, t.y + t.height / 2, (tdx / dist) * spd, (tdy / dist) * spd);
  }
}

/* ── Update logic ── */
function update(gs: GameState, dt: number, W: number, H: number, engine: Matter.Engine, now: number): 'dead' | null {
  // Boss phase timer
  gs.bossPhaseTimer += dt;

  // Ship movement
  let dx = 0, dy = 0;
  if (gs.keys.has('ArrowLeft') || gs.keys.has('a')) dx -= 1;
  if (gs.keys.has('ArrowRight') || gs.keys.has('d')) dx += 1;
  if (gs.keys.has('ArrowUp') || gs.keys.has('w')) dy -= 1;
  if (gs.keys.has('ArrowDown') || gs.keys.has('s')) dy += 1;
  if (dx || dy) {
    const len = Math.sqrt(dx * dx + dy * dy);
    gs.ship.x = Math.max(SHIP_SIZE / 2, Math.min(W - SHIP_SIZE / 2, gs.ship.x + (dx / len) * SHIP_SPEED * dt));
    gs.ship.y = Math.max(SHIP_SIZE / 2, Math.min(H - SHIP_SIZE / 2, gs.ship.y + (dy / len) * SHIP_SPEED * dt));
  }

  // Player fire
  if (gs.firing && now - gs.lastBulletTime >= BULLET_INTERVAL) {
    gs.lastBulletTime = now;
    spawnBullet(gs, gs.ship.x - 10, gs.ship.y - SHIP_SIZE / 2);
    spawnBullet(gs, gs.ship.x + 10, gs.ship.y - SHIP_SIZE / 2);
  }

  // Helper movement & fire
  const helperCount = gs.helpers.length;
  const orbitRadius = 55 + helperCount * 4;
  for (let i = 0; i < helperCount; i++) {
    const h = gs.helpers[i];
    const angle = (i / helperCount) * Math.PI * 2 + now / 1000 * 0.4;
    h.x += (gs.ship.x + Math.cos(angle) * orbitRadius - h.x) * 8 * dt;
    h.y += (gs.ship.y + Math.sin(angle) * orbitRadius - h.y) * 8 * dt;

    if (now - h.lastFireTime >= HELPER_FIRE_INTERVAL && gs.targets.length > 0) {
      h.lastFireTime = now;
      let nearest = gs.targets[0], nearDist = Infinity;
      for (const t of gs.targets) {
        const d = (t.x - h.x) ** 2 + (t.y - h.y) ** 2;
        if (d < nearDist) { nearDist = d; nearest = t; }
      }
      const adx = nearest.x - h.x, ady = nearest.y - h.y;
      const ad = Math.sqrt(adx * adx + ady * ady);
      if (ad > 1) spawnBullet(gs, h.x + (adx / ad) * 10, h.y + (ady / ad) * 10);
    }
  }

  // Move player + helper bullets
  gs.bullets.filter(b => { b.y -= BULLET_SPEED * dt; return b.y > -20; });

  // Spawn targets — wave at once, cap ramps with helpers (16 → 32)
  const activeCap = Math.min(BASE_ACTIVE_TARGETS + gs.helpers.length * 2, MAX_ACTIVE_TARGETS);
  if (gs.spawnIndex < gs.spawnQueue.length && now - gs.lastSpawnTime >= SPAWN_INTERVAL && gs.targets.length < activeCap) {
    const currentWave = gs.spawnQueue[gs.spawnIndex].wave;
    const room = activeCap - gs.targets.length;
    let spawned = 0;
    while (gs.spawnIndex < gs.spawnQueue.length && gs.spawnQueue[gs.spawnIndex].wave === currentWave && spawned < room) {
      const item = gs.spawnQueue[gs.spawnIndex];
      gs.spawnIndex++;
      spawned++;
      const width = Math.max(100, item.text.length * 10 + 32);
      const height = item.hp >= 16 ? 44 : 36;
      gs.targets.push({
        id: gs.nextId++,
        x: 80 + Math.random() * (W - 160), y: -height - Math.random() * 40,
        width, height,
        text: item.text, hp: item.hp, maxHp: item.hp,
        color: item.color, speed: 22 + Math.random() * 18,
        flashUntil: 0, fireRate: item.fireRate,
      });
    }
    gs.lastSpawnTime = now;
  }

  // Move targets
  gs.targets = gs.targets.filter(t => { t.y += t.speed * dt; return t.y < H + 60; });

  // Targets fire
  for (const t of gs.targets) {
    if (t.y < 0 || t.y > H) continue;
    if (Math.random() < t.fireRate * dt) fireEnemyBullets(t, gs, now);
  }

  // Move enemy bullets
  gs.enemyBullets.filter(b => { b.x += b.vx * dt; b.y += b.vy * dt; return b.x > -30 && b.x < W + 30 && b.y > -30 && b.y < H + 30; });

  // Enemy bullet → helper absorption
  for (const h of gs.helpers) {
    gs.enemyBullets.forEach(eb => {
      const hdx = eb.x - h.x, hdy = eb.y - h.y;
      if (hdx * hdx + hdy * hdy < HELPER_HIT_RADIUS * HELPER_HIT_RADIUS) {
        eb.active = false;
        spawnParticle(gs, eb.x, eb.y, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, 0.2, h.color, 2);
      }
    });
  }

  // Enemy bullet → ship collision
  if (now > gs.shipInvincibleUntil) {
    let hit = false;
    gs.enemyBullets.forEach(eb => {
      if (hit) return;
      const edx = eb.x - gs.ship.x, edy = eb.y - gs.ship.y;
      if (edx * edx + edy * edy < SHIP_HIT_RADIUS * SHIP_HIT_RADIUS) {
        eb.active = false;
        hit = true;
        gs.lives--;
        gs.shipHitUntil = now + 200;
        gs.shipInvincibleUntil = now + HIT_INVINCIBILITY;
        gs.screenShakeUntil = now + 300;
        for (let j = 0; j < 14; j++) {
          const a = Math.random() * Math.PI * 2, spd = 100 + Math.random() * 250;
          spawnParticle(gs, gs.ship.x, gs.ship.y, Math.cos(a) * spd, Math.sin(a) * spd, 0.35 + Math.random() * 0.4, PALETTE.enemyBullet, 2 + Math.random() * 3);
        }
        if (gs.lives <= 0) {
          gs.deathX = gs.ship.x;
          gs.deathY = gs.ship.y;
        }
      }
    });
    if (gs.lives <= 0) return 'dead';
  }

  // Player bullet → target collisions
  const deadTargets = new Set<number>();
  gs.bullets.forEach(b => {
    for (const t of gs.targets) {
      if (b.x >= t.x - t.width / 2 && b.x <= t.x + t.width / 2 && b.y >= t.y - t.height / 2 && b.y <= t.y + t.height / 2) {
        b.active = false;
        t.hp--; t.flashUntil = now + 80;
        for (let i = 0; i < 6; i++) {
          const a = Math.random() * Math.PI * 2, spd = 80 + Math.random() * 200;
          spawnParticle(gs, b.x, b.y, Math.cos(a) * spd, Math.sin(a) * spd, 0.25 + Math.random() * 0.3, t.color, 2 + Math.random() * 2);
        }
        if (t.hp <= 0) {
          deadTargets.add(t.id);
          for (let i = 0; i < 24; i++) {
            const a = Math.random() * Math.PI * 2, spd = 40 + Math.random() * 300;
            spawnParticle(gs, t.x + (Math.random() - 0.5) * t.width, t.y + (Math.random() - 0.5) * t.height, Math.cos(a) * spd, Math.sin(a) * spd, 0.5 + Math.random() * 0.8, t.color, 2 + Math.random() * 4);
          }
          const n = 4 + Math.floor(Math.random() * 4);
          for (let i = 0; i < n; i++) {
            const fw = t.width / 3 + Math.random() * 8, fh = t.height / 2 + Math.random() * 6;
            const body = Matter.Bodies.rectangle(t.x + (Math.random() - 0.5) * t.width * 0.3, t.y + (Math.random() - 0.5) * t.height * 0.3, fw, fh, { friction: 0, frictionAir: 0.01, restitution: 0.2 });
            const angle = Math.random() * Math.PI * 2, force = 0.005 + Math.random() * 0.015;
            Matter.Body.applyForce(body, body.position, { x: Math.cos(angle) * force, y: Math.sin(angle) * force });
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
            Matter.Composite.add(engine.world, body);
            gs.fragments.push({ body, color: t.color, width: fw, height: fh, life: 1 });
          }
        }
        break;
      }
    }
  });
  gs.targets = gs.targets.filter(t => !deadTargets.has(t.id));

  // Particles & fragments
  gs.particles.filter(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0; });
  Matter.Engine.update(engine, dt * 1000);
  gs.fragments = gs.fragments.filter(f => { f.life -= dt * 0.4; if (f.life <= 0) { Matter.Composite.remove(engine.world, f.body); return false; } return true; });

  return null;
}

/* ── Render: background ── */
function renderBackground(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.018)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}

/* ── Render: playing phase ── */
function renderGame(ctx: CanvasRenderingContext2D, gs: GameState, W: number, H: number, shipImg: HTMLImageElement | null, playingElapsed: number) {
  const now = performance.now();

  // Screen shake
  let shakeX = 0, shakeY = 0;
  if (now < gs.screenShakeUntil) { shakeX = (Math.random() - 0.5) * 12; shakeY = (Math.random() - 0.5) * 12; }
  ctx.save(); ctx.translate(shakeX, shakeY);

  // Targets
  for (const t of gs.targets) {
    const flashing = now < t.flashUntil;
    const hpRatio = t.hp / t.maxHp;
    ctx.save(); ctx.translate(t.x, t.y);
    ctx.globalAlpha = 0.3 + hpRatio * 0.7;
    ctx.fillStyle = flashing ? '#fff' : t.color;
    ctx.fillRect(-t.width / 2, -t.height / 2, t.width, t.height);
    ctx.strokeStyle = t.color; ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
    ctx.strokeRect(-t.width / 2, -t.height / 2, t.width, t.height);
    ctx.globalAlpha = 0.6;
    const barW = t.width - 8, barH = 3, barY = t.height / 2 - 6;
    ctx.fillStyle = '#0a0a0c'; ctx.fillRect(-barW / 2, barY, barW, barH);
    ctx.fillStyle = hpRatio > 0.5 ? t.color : hpRatio > 0.25 ? '#E8C97E' : '#E27878';
    ctx.fillRect(-barW / 2, barY, barW * hpRatio, barH);
    ctx.globalAlpha = 1;
    ctx.fillStyle = flashing ? t.color : '#0a0a0c';
    ctx.font = t.maxHp >= 16 ? 'bold 14px "JetBrains Mono", monospace' : '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(t.text, 0, -2, t.width - 16);
    ctx.restore();
  }

  // Fragments
  for (const f of gs.fragments) {
    const p = f.body.position;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(f.body.angle);
    ctx.globalAlpha = f.life; ctx.fillStyle = f.color;
    ctx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height); ctx.restore();
  }

  // Particles
  gs.particles.forEach(p => {
    ctx.globalAlpha = Math.min(p.life * 2, 1); ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  });
  ctx.globalAlpha = 1;

  // Player bullets
  ctx.fillStyle = '#F3F5FC';
  gs.bullets.forEach(b => ctx.fillRect(b.x - 2, b.y - 5, 4, 10));

  // Enemy bullets (diamonds)
  ctx.fillStyle = PALETTE.enemyBullet;
  gs.enemyBullets.forEach(eb => {
    ctx.save(); ctx.translate(eb.x, eb.y); ctx.rotate(Math.PI / 4);
    ctx.fillRect(-4, -4, 8, 8); ctx.restore();
  });

  // Helpers
  for (const h of gs.helpers) {
    // Shield radius (faint)
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = h.color;
    ctx.beginPath(); ctx.arc(h.x, h.y, HELPER_HIT_RADIUS, 0, Math.PI * 2); ctx.fill();
    // Core
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = h.color;
    ctx.beginPath(); ctx.arc(h.x, h.y, 8, 0, Math.PI * 2); ctx.fill();
    // Glow ring
    ctx.strokeStyle = h.color; ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.3 + Math.sin(now / 400) * 0.15;
    ctx.beginPath(); ctx.arc(h.x, h.y, HELPER_HIT_RADIUS, 0, Math.PI * 2); ctx.stroke();
    // Name label
    ctx.globalAlpha = 0.4;
    ctx.font = '8px "JetBrains Mono", monospace'; ctx.fillStyle = h.color;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(h.name, h.x, h.y + HELPER_HIT_RADIUS + 4);
    ctx.globalAlpha = 1;
  }

  // Ship
  const isInvincible = now < gs.shipInvincibleUntil;
  const isHitFlash = now < gs.shipHitUntil;
  const shipVisible = !isInvincible || Math.floor(now / 100) % 2 === 0;
  if (shipVisible) {
    if (isHitFlash) {
      ctx.save(); ctx.beginPath(); ctx.arc(gs.ship.x, gs.ship.y, SHIP_SIZE / 2 + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(226, 120, 120, 0.4)'; ctx.fill(); ctx.restore();
    }
    if (shipImg) {
      ctx.save(); ctx.beginPath(); ctx.arc(gs.ship.x, gs.ship.y, SHIP_SIZE / 2, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(shipImg, gs.ship.x - SHIP_SIZE / 2, gs.ship.y - SHIP_SIZE / 2, SHIP_SIZE, SHIP_SIZE); ctx.restore();
      ctx.strokeStyle = isInvincible ? '#E27878' : '#C4A2D4'; ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5 + Math.sin(now / 300) * 0.2;
      ctx.beginPath(); ctx.arc(gs.ship.x, gs.ship.y, SHIP_SIZE / 2 + 4, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = '#C4A2D4'; ctx.beginPath(); ctx.arc(gs.ship.x, gs.ship.y, SHIP_SIZE / 2, 0, Math.PI * 2); ctx.fill();
    }
  }

  ctx.restore(); // end shake

  // ─── HUD ───
  const total = gs.spawnQueue.length;
  const destroyed = total - (gs.spawnQueue.length - gs.spawnIndex) - gs.targets.length;
  ctx.fillStyle = '#B2B6C1'; ctx.font = '12px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`TARGETS  ${Math.max(0, destroyed)} / ${total}`, 24, 34);

  // Lives (dynamic max)
  const currentMaxLives = Math.min(MAX_LIVES + Math.floor(gs.deathCount / 2), 6);
  for (let i = 0; i < currentMaxLives; i++) {
    ctx.fillStyle = i < gs.lives ? '#F3BDCA' : '#393C43';
    ctx.beginPath(); ctx.arc(26 + i * 18, 56, 5, 0, Math.PI * 2); ctx.fill();
  }

  // Helper count
  if (gs.helpers.length > 0) {
    ctx.fillStyle = PALETTE.helper; ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`ALLIES  ${gs.helpers.length}`, 24, 76);
  }

  // NieR border
  ctx.strokeStyle = 'rgba(196, 162, 212, 0.12)'; ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, W - 24, H - 24);

  // Controls (bottom-right, fades out)
  const controlsFade = Math.max(0, 1 - (playingElapsed - 4000) / 2000);
  if (controlsFade > 0) {
    ctx.globalAlpha = controlsFade * 0.8;
    const pad = 24, lineH = 18;
    const bx = W - pad, by = H - pad - lineH * 3;
    ctx.font = '11px "JetBrains Mono", monospace'; ctx.textAlign = 'right';
    ctx.fillStyle = '#6E7280'; ctx.fillText('move', bx, by);
    ctx.fillStyle = '#C4A2D4'; ctx.fillText('WASD / Arrows  ', bx - 36, by);
    ctx.fillStyle = '#6E7280'; ctx.fillText('fire', bx, by + lineH);
    ctx.fillStyle = '#C4A2D4'; ctx.fillText('Space / Click  ', bx - 26, by + lineH);
    ctx.fillStyle = '#6E7280'; ctx.fillText('exit', bx, by + lineH * 2);
    ctx.fillStyle = '#C4A2D4'; ctx.fillText('Escape  ', bx - 26, by + lineH * 2);
    ctx.globalAlpha = 1;
  }
}

/* ── Render: intro ── */
function renderIntro(ctx: CanvasRenderingContext2D, W: number, H: number, elapsed: number) {
  const lines = [
    { text: '[ALERT] External input detected', delay: 300, color: '#E27878' },
    { text: '[SYSTEM] Initiating combat mode...', delay: 1500, color: '#C4A2D4' },
    { text: '[YoRHa] Glory to mankind.', delay: 3000, color: '#F3F5FC' },
  ];
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]; if (elapsed < l.delay) continue;
    const chars = Math.min(Math.floor((elapsed - l.delay) / 35), l.text.length);
    ctx.font = '16px "JetBrains Mono", monospace'; ctx.fillStyle = l.color;
    ctx.fillText(l.text.substring(0, chars), W / 2, H / 2 - 30 + i * 36);
  }
  if (elapsed > 3800) {
    ctx.font = '12px "JetBrains Mono", monospace'; ctx.fillStyle = '#6E7280';
    ctx.fillText('WASD / Arrows to move  ·  Space / Click to fire', W / 2, H - 48);
  }
}

/* ── Render: death sequence (explosion → fade → NieR text → revive) ── */
function renderDeath(ctx: CanvasRenderingContext2D, gs: GameState, W: number, H: number, elapsed: number) {
  // Phase 1: explosion at ship position (0 – DEATH_EXPLOSION_DURATION)
  if (elapsed < DEATH_EXPLOSION_DURATION) {
    const t = elapsed / DEATH_EXPLOSION_DURATION; // 0→1

    // Screen shake (intense at start, fading)
    const shakeIntensity = 16 * (1 - t);
    ctx.save();
    ctx.translate((Math.random() - 0.5) * shakeIntensity * 2, (Math.random() - 0.5) * shakeIntensity * 2);

    // Render remaining game objects (frozen, fading out)
    ctx.globalAlpha = 1 - t * 0.7;
    for (const tgt of gs.targets) {
      ctx.save(); ctx.translate(tgt.x, tgt.y);
      ctx.fillStyle = tgt.color; ctx.fillRect(-tgt.width / 2, -tgt.height / 2, tgt.width, tgt.height);
      ctx.globalAlpha = (1 - t * 0.7) * 0.8;
      ctx.fillStyle = '#0a0a0c'; ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(tgt.text, 0, 0, tgt.width - 16); ctx.restore();
    }
    // Enemy bullets fade
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = PALETTE.enemyBullet;
    gs.enemyBullets.forEach(eb => {
      ctx.save(); ctx.translate(eb.x, eb.y); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-4, -4, 8, 8); ctx.restore();
    });
    ctx.globalAlpha = 1;

    // Explosion ring expanding from death point
    const ringRadius = t * Math.max(W, H) * 0.6;
    const ringAlpha = (1 - t) * 0.8;
    ctx.strokeStyle = `rgba(226, 120, 120, ${ringAlpha})`;
    ctx.lineWidth = 4 + (1 - t) * 8;
    ctx.beginPath(); ctx.arc(gs.deathX, gs.deathY, ringRadius, 0, Math.PI * 2); ctx.stroke();

    // Inner flash
    if (t < 0.3) {
      const flashAlpha = (1 - t / 0.3) * 0.6;
      const grad = ctx.createRadialGradient(gs.deathX, gs.deathY, 0, gs.deathX, gs.deathY, 120 + t * 200);
      grad.addColorStop(0, `rgba(255, 200, 200, ${flashAlpha})`);
      grad.addColorStop(1, 'rgba(255, 200, 200, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Particles (the death sparks already spawned)
    gs.particles.forEach(p => {
      ctx.globalAlpha = Math.min(p.life * 2, 1); ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    // Fragments
    for (const f of gs.fragments) {
      const pos = f.body.position;
      ctx.save(); ctx.translate(pos.x, pos.y); ctx.rotate(f.body.angle);
      ctx.globalAlpha = f.life; ctx.fillStyle = f.color;
      ctx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height); ctx.restore();
    }
    ctx.globalAlpha = 1;

    ctx.restore(); // end shake

    // Fade overlay increasing toward end
    ctx.fillStyle = `rgba(10, 10, 12, ${t * 0.8})`;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  // Phase 2: text sequence (after explosion)
  const textElapsed = elapsed - DEATH_EXPLOSION_DURATION;

  // Full black
  ctx.fillStyle = '#0a0a0c'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.012)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

  // Text escalates from despair → encouragement across deaths
  const recoveryScripts = [
    { sys: '[SYSTEM] Operator unit — offline. Critical memory fault.', phil: 'Is it all for naught?', signal: 'Incoming signal detected...' },
    { sys: '[SYSTEM] Catastrophic failure. State lost.', phil: 'Why do you keep trying?', signal: 'More signals incoming...' },
    { sys: '[SYSTEM] Cycle repeated. Core integrity compromised.', phil: 'You refuse to stay down.', signal: 'They hear your struggle...' },
    { sys: '[SYSTEM] How many times now? Stack overflow imminent.', phil: 'Stubbornness... or courage?', signal: 'The signals grow stronger.' },
    { sys: '[SYSTEM] Unit offline. But not forgotten.', phil: 'You are not alone in this.', signal: 'They are coming for you.' },
    { sys: '[SYSTEM] Data recovery complete.', phil: 'They believe in you. Get up. One more time.', signal: 'An army stands behind you.' },
  ];
  const script = recoveryScripts[Math.min(gs.deathCount, recoveryScripts.length - 1)];
  const msgs = [
    { text: script.sys, start: 1600, color: '#E27878' },
    { text: script.phil, start: 6600, color: '#B2B6C1' },
    { text: script.signal, start: 9000, color: '#C4A2D4' },
  ];
  for (const m of msgs) {
    if (textElapsed < m.start) continue;
    const age = textElapsed - m.start;
    const chars = Math.min(Math.floor(age / 40), m.text.length);
    const nextStart = msgs[msgs.indexOf(m) + 1]?.start ?? Infinity;
    ctx.globalAlpha = textElapsed > nextStart - 300 ? Math.max(0, (nextStart - textElapsed) / 300) : 1;
    ctx.font = '16px "JetBrains Mono", monospace'; ctx.fillStyle = m.color;
    ctx.fillText(m.text.substring(0, chars), W / 2, H / 2 - 20);
  }
  ctx.globalAlpha = 1;

  // Scrolling rescue names (11s – prompt, shown before prompt)
  if (textElapsed > 10000 && textElapsed < DEATH_PROMPT_TIME && gs.deathChoice === 0) {
    const nameElapsed = textElapsed - 10000;
    const namesVisible = Math.min(Math.floor(nameElapsed / 70), RESCUE_NAMES.length);
    ctx.font = '12px "JetBrains Mono", monospace';
    for (let i = 0; i < namesVisible; i++) {
      const nameAge = nameElapsed - i * 70;
      ctx.globalAlpha = Math.min(nameAge / 200, 1) * Math.max(0, 1 - nameAge / 1200);
      const nx = W * 0.15 + (((i * 7919) % 100) / 100) * W * 0.7;
      const ny = H * 0.3 + (((i * 6271) % 100) / 100) * H * 0.4;
      ctx.fillStyle = HELPER_COLORS[i % HELPER_COLORS.length];
      ctx.fillText(RESCUE_NAMES[i], nx, ny);
    }
    ctx.globalAlpha = 1;
  }

  // Prompt: "Accept offer of rescue? [ Y / N ]"  — waits for input
  if (textElapsed >= DEATH_PROMPT_TIME && gs.deathChoice === 0) {
    const promptAge = textElapsed - DEATH_PROMPT_TIME;
    const promptText = 'Accept offer of rescue?  [ Y / N ]';
    const chars = Math.min(Math.floor(promptAge / 35), promptText.length);
    ctx.font = '16px "JetBrains Mono", monospace'; ctx.fillStyle = '#F3F5FC';
    ctx.fillText(promptText.substring(0, chars), W / 2, H / 2 + 14);
    // Blinking cursor after text finishes
    if (chars >= promptText.length && Math.floor(textElapsed / 500) % 2 === 0) {
      ctx.fillStyle = '#C4A2D4';
      ctx.fillText('_', W / 2 + ctx.measureText(promptText).width / 2 + 8, H / 2 + 14);
    }
  }

  // After choice made
  if (gs.deathChoice !== 0 && gs.deathChoiceAt > 0) {
    const choiceElapsed = performance.now() - gs.deathChoiceAt;

    if (gs.deathChoice === 'y') {
      // Y — accepted
      const line1 = '[SYSTEM] External support accepted.';
      const chars1 = Math.min(Math.floor(choiceElapsed / 30), line1.length);
      ctx.font = '16px "JetBrains Mono", monospace'; ctx.fillStyle = '#6EC4B8';
      ctx.fillText(line1.substring(0, chars1), W / 2, H / 2 + 14);
    } else {
      // N — cold reboot
      const line1 = '[SYSTEM] Understood. Erasing state.';
      const line2 = '[SYSTEM] Initiating cold reboot...';
      const chars1 = Math.min(Math.floor(choiceElapsed / 30), line1.length);
      ctx.font = '16px "JetBrains Mono", monospace'; ctx.fillStyle = '#E27878';
      ctx.fillText(line1.substring(0, chars1), W / 2, H / 2 + 8);
      if (choiceElapsed > 1200) {
        const chars2 = Math.min(Math.floor((choiceElapsed - 1200) / 30), line2.length);
        ctx.fillStyle = '#B2B6C1';
        ctx.fillText(line2.substring(0, chars2), W / 2, H / 2 + 40);
      }
    }

    // Flash before revive
    if (choiceElapsed > DEATH_ACCEPT_DURATION - 800) {
      const a = Math.min((choiceElapsed - (DEATH_ACCEPT_DURATION - 800)) / 600, 1);
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`; ctx.fillRect(0, 0, W, H);
    }
  }
}

/* ── Render: outro (victory) ── */
function renderOutro(ctx: CanvasRenderingContext2D, W: number, H: number, elapsed: number) {
  const fade = Math.min(elapsed / 1200, 1);
  ctx.fillStyle = `rgba(10, 10, 12, ${fade})`; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.015)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

  const messages = [
    { text: 'everything was destroyed.', start: 1500, color: '#F3F5FC' },
    { text: '...', start: 3500, color: '#B2B6C1' },
    { text: 'but even so,', start: 5000, color: '#C4A2D4' },
    { text: 'we choose to rebuild.', start: 6800, color: '#6EC4B8' },
  ];
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const visible: Array<{ text: string; color: string }> = [];
  for (const m of messages) {
    if (elapsed < m.start) break;
    const chars = Math.min(Math.floor((elapsed - m.start) / 50), m.text.length);
    visible.push({ text: m.text.substring(0, chars), color: m.color });
  }
  const startY = H / 2 - (visible.length * 40) / 2 + 20;
  for (let i = 0; i < visible.length; i++) {
    ctx.font = i === 0 ? '20px "JetBrains Mono", monospace' : '18px "JetBrains Mono", monospace';
    ctx.fillStyle = visible[i].color;
    ctx.fillText(visible[i].text, W / 2, startY + i * 42);
  }
  if (elapsed > OUTRO_DURATION - 1000) {
    const a = Math.min((elapsed - (OUTRO_DURATION - 1000)) / 800, 1);
    ctx.fillStyle = `rgba(255, 255, 255, ${a})`; ctx.fillRect(0, 0, W, H);
  }
}

/* ── Component ── */
export function AsteroidsGame({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef(Matter.Engine.create({ gravity: { x: 0, y: 0.3 } }));
  const gsRef = useRef(createGameState());
  const phaseRef = useRef<Phase>('intro');
  const phaseStartRef = useRef(0);
  const shipImgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function resize() { resizeCanvas(canvas!); }
    resize();
    window.addEventListener('resize', resize);

    const img = new Image();
    img.src = '/images/profile.webp';
    img.onload = () => { shipImgRef.current = img; };

    const gs = gsRef.current;
    gs.ship = { x: window.innerWidth / 2, y: window.innerHeight - 100 };
    phaseStartRef.current = performance.now();
    lastTimeRef.current = performance.now();

    const makeDeathChoice = (choice: 'y' | 'n') => {
      if (gs.deathChoice === 0) { gs.deathChoice = choice; gs.deathChoiceAt = performance.now(); }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current === 'death') {
        const textElapsed = performance.now() - phaseStartRef.current - DEATH_EXPLOSION_DURATION;
        if (textElapsed >= DEATH_PROMPT_TIME && gs.deathChoice === 0) {
          if (e.key === 'n' || e.key === 'N') makeDeathChoice('n');
          else makeDeathChoice('y'); // Any other key = yes
        }
        return;
      }
      gs.keys.add(e.key);
      if (e.key === ' ') { e.preventDefault(); gs.firing = true; }
      if (e.key === 'Escape') onComplete();
    };
    const onKeyUp = (e: KeyboardEvent) => { gs.keys.delete(e.key); if (e.key === ' ') gs.firing = false; };
    const onMouseDown = () => {
      if (phaseRef.current === 'death') {
        const textElapsed = performance.now() - phaseStartRef.current - DEATH_EXPLOSION_DURATION;
        if (textElapsed >= DEATH_PROMPT_TIME && gs.deathChoice === 0) makeDeathChoice('y');
        return;
      }
      gs.firing = true;
    };
    const onMouseUp = () => { gs.firing = false; };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);

    function loop() {
      const now = performance.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 1 / 20);
      lastTimeRef.current = now;
      const W = window.innerWidth, H = window.innerHeight;
      const phase = phaseRef.current;
      const phaseElapsed = now - phaseStartRef.current;

      renderBackground(ctx, W, H);

      if (phase === 'intro') {
        renderIntro(ctx, W, H, phaseElapsed);
        if (phaseElapsed >= INTRO_DURATION) {
          phaseRef.current = 'playing'; phaseStartRef.current = now; gs.lastSpawnTime = now;
        }
      } else if (phase === 'playing') {
        const result = update(gs, dt, W, H, engineRef.current, now);
        renderGame(ctx, gs, W, H, shipImgRef.current, phaseElapsed);
        if (result === 'dead') {
          // Spawn a big death explosion of particles
          const colors = ['#E27878', '#F3BDCA', '#C4A2D4'];
          for (let i = 0; i < 50; i++) {
            const a = Math.random() * Math.PI * 2, spd = 50 + Math.random() * 400;
            spawnParticle(gs, gs.deathX, gs.deathY, Math.cos(a) * spd, Math.sin(a) * spd, 0.8 + Math.random() * 1.2, colors[i % 3], 3 + Math.random() * 5);
          }
          phaseRef.current = 'death'; phaseStartRef.current = now; gs.firing = false; gs.deathChoice = 0; gs.deathChoiceAt = 0;
        } else if (gs.spawnIndex >= gs.spawnQueue.length && gs.targets.length === 0 && gs.fragments.length === 0) {
          phaseRef.current = 'destroyed'; phaseStartRef.current = now;
        }
      } else if (phase === 'death') {
        // Keep particles/fragments updating
        gs.particles.filter(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0; });
        Matter.Engine.update(engineRef.current, dt * 1000);
        gs.fragments = gs.fragments.filter(f => { f.life -= dt * 0.6; if (f.life <= 0) { Matter.Composite.remove(engineRef.current.world, f.body); return false; } return true; });

        renderDeath(ctx, gs, W, H, phaseElapsed);

        // Wait for player choice, then wait DEATH_ACCEPT_DURATION before reviving
        if (gs.deathChoice !== 0 && gs.deathChoiceAt > 0 && now - gs.deathChoiceAt >= DEATH_ACCEPT_DURATION) {
          gs.deathCount++;
          if (gs.deathChoice === 'y') {
            // Accept rescue — gain a helper
            const idx = gs.helpers.length;
            if (idx < RESCUE_NAMES.length) {
              gs.helpers.push({
                x: W / 2, y: H - 100,
                name: RESCUE_NAMES[idx],
                color: HELPER_COLORS[idx % HELPER_COLORS.length],
                lastFireTime: 0,
              });
            }
            gs.lives = Math.min(MAX_LIVES + Math.floor(gs.deathCount / 2), 6);
          } else {
            // Reject rescue — cold reboot, no helper, base lives only
            gs.lives = MAX_LIVES;
          }
          gs.enemyBullets.deactivateAll();
          for (const t of gs.targets) t.y = Math.min(t.y, 80 + Math.random() * 100);
          gs.shipInvincibleUntil = performance.now() + 3000;
          gs.ship = { x: W / 2, y: H - 100 };
          phaseRef.current = 'playing';
          phaseStartRef.current = performance.now();
          gs.lastSpawnTime = performance.now();
        }
      } else if (phase === 'destroyed') {
        Matter.Engine.update(engineRef.current, dt * 1000);
        gs.fragments = gs.fragments.filter(f => { f.life -= dt * 0.6; if (f.life <= 0) { Matter.Composite.remove(engineRef.current.world, f.body); return false; } return true; });
        gs.particles.filter(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0; });
        for (const f of gs.fragments) {
          const pos = f.body.position;
          ctx.save(); ctx.translate(pos.x, pos.y); ctx.rotate(f.body.angle);
          ctx.globalAlpha = f.life; ctx.fillStyle = f.color;
          ctx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height); ctx.restore();
        }
        gs.particles.forEach(p => {
          ctx.globalAlpha = Math.min(p.life * 2, 1); ctx.fillStyle = p.color;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        });
        ctx.globalAlpha = 1;
        renderOutro(ctx, W, H, phaseElapsed);
        if (phaseElapsed >= OUTRO_DURATION) { phaseRef.current = 'done'; onComplete(); return; }
      }

      if (phaseRef.current !== 'done') rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
      Matter.Engine.clear(engineRef.current);
    };
  }, [onComplete]);

  return (
    <div className={styles.overlay}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
