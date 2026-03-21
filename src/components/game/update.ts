import Matter from 'matter-js';
import type { GameState, Target } from './types';
import {
  SHIP_SIZE, SHIP_SPEED, BULLET_SPEED, BULLET_INTERVAL, HELPER_FIRE_INTERVAL,
  ENEMY_BULLET_SPEED, SPAWN_INTERVAL, BASE_ACTIVE_TARGETS, MAX_ACTIVE_TARGETS,
  HIT_INVINCIBILITY, SHIP_HIT_RADIUS, HELPER_HIT_RADIUS, PALETTE,
} from './constants';

/* ── Pool spawn helpers ── */
export function spawnEnemyBullet(gs: GameState, x: number, y: number, vx: number, vy: number) {
  const b = gs.enemyBullets.get();
  b.x = x; b.y = y; b.vx = vx; b.vy = vy; b.active = true;
}
export function spawnBullet(gs: GameState, x: number, y: number) {
  const b = gs.bullets.get();
  b.x = x; b.y = y; b.active = true;
}
export function spawnParticle(gs: GameState, x: number, y: number, vx: number, vy: number, life: number, color: string, size: number) {
  const p = gs.particles.get();
  p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.color = color; p.size = size; p.active = true;
}

/* ── Boss + enemy bullet patterns ── */
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
      const count = 16 + Math.floor((1 - hpRatio) * 8);
      const offset = now / 300;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + offset;
        spawnEnemyBullet(gs, t.x, t.y, Math.cos(a) * spd * 0.85, Math.sin(a) * spd * 0.85);
      }
    } else if (phase === 1) {
      for (let i = -3; i <= 3; i++) {
        const a = baseAngle + i * 0.12;
        spawnEnemyBullet(gs, t.x, t.y + t.height / 2, Math.cos(a) * spd * 1.15, Math.sin(a) * spd * 1.15);
      }
    } else if (phase === 2) {
      const offset = now / 200;
      for (let arm = 0; arm < 2; arm++) {
        const a = offset + arm * Math.PI;
        spawnEnemyBullet(gs, t.x, t.y, Math.cos(a) * spd, Math.sin(a) * spd);
        spawnEnemyBullet(gs, t.x, t.y, Math.cos(a + 0.3) * spd * 0.8, Math.sin(a + 0.3) * spd * 0.8);
      }
    } else if (phase === 3) {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + now / 500;
        spawnEnemyBullet(gs, t.x, t.y, Math.cos(a) * spd, Math.sin(a) * spd);
      }
      for (let i = -1; i <= 1; i++) {
        const a = baseAngle + i * 0.15;
        spawnEnemyBullet(gs, t.x, t.y, Math.cos(a) * spd * 1.2, Math.sin(a) * spd * 1.2);
      }
    } else {
      for (let i = -4; i <= 4; i++) {
        const a = baseAngle + i * 0.08;
        const s = spd * (0.9 + Math.random() * 0.3);
        spawnEnemyBullet(gs, t.x, t.y + t.height / 2, Math.cos(a) * s, Math.sin(a) * s);
      }
    }

    if (hpRatio < 0.5) {
      const extra = Math.floor((1 - hpRatio) * 6);
      for (let i = 0; i < extra; i++) {
        const a = Math.random() * Math.PI * 2;
        spawnEnemyBullet(gs, t.x, t.y, Math.cos(a) * spd * 0.7, Math.sin(a) * spd * 0.7);
      }
    }
  } else if (t.maxHp >= 16) {
    const count = 3 + (Math.random() < 0.4 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const a = baseAngle + (i - (count - 1) / 2) * 0.18;
      spawnEnemyBullet(gs, t.x, t.y + t.height / 2, Math.cos(a) * spd, Math.sin(a) * spd);
    }
  } else if (t.maxHp >= 10) {
    for (let i = -1; i <= 1; i += 2) {
      const a = baseAngle + i * 0.1;
      spawnEnemyBullet(gs, t.x, t.y + t.height / 2, Math.cos(a) * spd * 0.95, Math.sin(a) * spd * 0.95);
    }
  } else {
    spawnEnemyBullet(gs, t.x, t.y + t.height / 2, (tdx / dist) * spd, (tdy / dist) * spd);
  }
}

/* ── Main update ── */
export function update(gs: GameState, dt: number, W: number, H: number, engine: Matter.Engine, now: number): 'dead' | null {
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

  // Move bullets
  gs.bullets.filter(b => { b.y -= BULLET_SPEED * dt; return b.y > -20; });

  // Spawn targets — wave at once, cap ramps with helpers
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

  // Move targets (boss stays near top)
  gs.targets = gs.targets.filter(t => {
    if (t.maxHp >= 40) {
      const targetY = 80;
      if (t.y < targetY) t.y += t.speed * dt;
      else t.y += (targetY - t.y) * 2 * dt;
    } else {
      t.y += t.speed * dt;
      if (t.y > H + 10) {
        gs.lives--;
        gs.screenShakeUntil = now + 200;
        if (gs.lives <= 0) { gs.deathX = gs.ship.x; gs.deathY = gs.ship.y; }
        return false;
      }
    }
    return true;
  });
  if (gs.lives <= 0) return 'dead';

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
        if (gs.lives <= 0) { gs.deathX = gs.ship.x; gs.deathY = gs.ship.y; }
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
