import type { GameState } from './types';
import {
  SHIP_SIZE, PALETTE, HELPER_HIT_RADIUS, MAX_LIVES,
  INTRO_DURATION, OUTRO_DURATION, DEATH_EXPLOSION_DURATION, DEATH_PROMPT_TIME,
  DEATH_ACCEPT_DURATION, RESCUE_NAMES, HELPER_COLORS,
} from './constants';

export { INTRO_DURATION, OUTRO_DURATION, DEATH_EXPLOSION_DURATION, DEATH_PROMPT_TIME, DEATH_ACCEPT_DURATION };

/* ── Background ── */
export function renderBackground(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.018)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}

/* ── Playing phase ── */
export function renderGame(ctx: CanvasRenderingContext2D, gs: GameState, W: number, H: number, shipImg: HTMLImageElement | null, playingElapsed: number) {
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
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = h.color;
    ctx.beginPath(); ctx.arc(h.x, h.y, HELPER_HIT_RADIUS, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = h.color;
    ctx.beginPath(); ctx.arc(h.x, h.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = h.color; ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.3 + Math.sin(now / 400) * 0.15;
    ctx.beginPath(); ctx.arc(h.x, h.y, HELPER_HIT_RADIUS, 0, Math.PI * 2); ctx.stroke();
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

  const currentMaxLives = Math.min(MAX_LIVES + Math.floor(gs.deathCount / 2), 12);
  for (let i = 0; i < currentMaxLives; i++) {
    ctx.fillStyle = i < gs.lives ? '#F3BDCA' : '#393C43';
    ctx.beginPath(); ctx.arc(26 + i * 18, 56, 5, 0, Math.PI * 2); ctx.fill();
  }

  if (gs.helpers.length > 0) {
    ctx.fillStyle = PALETTE.helper; ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`ALLIES  ${gs.helpers.length}`, 24, 76);
  }

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

/* ── Intro ── */
export function renderIntro(ctx: CanvasRenderingContext2D, W: number, H: number, elapsed: number) {
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

/* ── Death sequence ── */
export function renderDeath(ctx: CanvasRenderingContext2D, gs: GameState, W: number, H: number, elapsed: number) {
  // Phase 1: explosion
  if (elapsed < DEATH_EXPLOSION_DURATION) {
    const t = elapsed / DEATH_EXPLOSION_DURATION;

    const shakeIntensity = 16 * (1 - t);
    ctx.save();
    ctx.translate((Math.random() - 0.5) * shakeIntensity * 2, (Math.random() - 0.5) * shakeIntensity * 2);

    ctx.globalAlpha = 1 - t * 0.7;
    for (const tgt of gs.targets) {
      ctx.save(); ctx.translate(tgt.x, tgt.y);
      ctx.fillStyle = tgt.color; ctx.fillRect(-tgt.width / 2, -tgt.height / 2, tgt.width, tgt.height);
      ctx.globalAlpha = (1 - t * 0.7) * 0.8;
      ctx.fillStyle = '#0a0a0c'; ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(tgt.text, 0, 0, tgt.width - 16); ctx.restore();
    }
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = PALETTE.enemyBullet;
    gs.enemyBullets.forEach(eb => {
      ctx.save(); ctx.translate(eb.x, eb.y); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-4, -4, 8, 8); ctx.restore();
    });
    ctx.globalAlpha = 1;

    const ringRadius = t * Math.max(W, H) * 0.6;
    ctx.strokeStyle = `rgba(226, 120, 120, ${(1 - t) * 0.8})`;
    ctx.lineWidth = 4 + (1 - t) * 8;
    ctx.beginPath(); ctx.arc(gs.deathX, gs.deathY, ringRadius, 0, Math.PI * 2); ctx.stroke();

    if (t < 0.3) {
      const flashAlpha = (1 - t / 0.3) * 0.6;
      const grad = ctx.createRadialGradient(gs.deathX, gs.deathY, 0, gs.deathX, gs.deathY, 120 + t * 200);
      grad.addColorStop(0, `rgba(255, 200, 200, ${flashAlpha})`);
      grad.addColorStop(1, 'rgba(255, 200, 200, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    gs.particles.forEach(p => {
      ctx.globalAlpha = Math.min(p.life * 2, 1); ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    for (const f of gs.fragments) {
      const pos = f.body.position;
      ctx.save(); ctx.translate(pos.x, pos.y); ctx.rotate(f.body.angle);
      ctx.globalAlpha = f.life; ctx.fillStyle = f.color;
      ctx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height); ctx.restore();
    }
    ctx.globalAlpha = 1;

    ctx.restore();
    ctx.fillStyle = `rgba(10, 10, 12, ${t * 0.8})`;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  // Phase 2: text
  const textElapsed = elapsed - DEATH_EXPLOSION_DURATION;

  ctx.fillStyle = '#0a0a0c'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.012)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

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

  // Scrolling rescue names
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

  // Y/N prompt — waits for input
  if (textElapsed >= DEATH_PROMPT_TIME && gs.deathChoice === 0) {
    const promptAge = textElapsed - DEATH_PROMPT_TIME;
    const promptText = 'Accept offer of rescue?  [ Y / N ]';
    const chars = Math.min(Math.floor(promptAge / 35), promptText.length);
    ctx.font = '16px "JetBrains Mono", monospace'; ctx.fillStyle = '#F3F5FC';
    ctx.fillText(promptText.substring(0, chars), W / 2, H / 2 + 14);
    if (chars >= promptText.length && Math.floor(textElapsed / 500) % 2 === 0) {
      ctx.fillStyle = '#C4A2D4';
      ctx.fillText('_', W / 2 + ctx.measureText(promptText).width / 2 + 8, H / 2 + 14);
    }
  }

  // After choice
  if (gs.deathChoice !== 0 && gs.deathChoiceAt > 0) {
    const choiceElapsed = performance.now() - gs.deathChoiceAt;

    if (gs.deathChoice === 'y') {
      const line1 = '[SYSTEM] External support accepted.';
      const chars1 = Math.min(Math.floor(choiceElapsed / 30), line1.length);
      ctx.font = '16px "JetBrains Mono", monospace'; ctx.fillStyle = '#6EC4B8';
      ctx.fillText(line1.substring(0, chars1), W / 2, H / 2 + 14);
    } else {
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

    if (choiceElapsed > DEATH_ACCEPT_DURATION - 800) {
      const a = Math.min((choiceElapsed - (DEATH_ACCEPT_DURATION - 800)) / 600, 1);
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`; ctx.fillRect(0, 0, W, H);
    }
  }
}

/* ── Outro (victory) ── */
export function renderOutro(ctx: CanvasRenderingContext2D, gs: GameState, W: number, H: number, elapsed: number) {
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
