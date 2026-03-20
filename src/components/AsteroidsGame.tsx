import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import styles from '../styles/components/AsteroidsGame.module.scss';
import type { Phase } from './game/types';
import {
  INTRO_DURATION, DEATH_EXPLOSION_DURATION, DEATH_PROMPT_TIME,
  DEATH_ACCEPT_DURATION, OUTRO_DURATION, MAX_LIVES,
  RESCUE_NAMES, HELPER_COLORS,
} from './game/constants';
import { createGameState } from './game/spawner';
import { update, spawnParticle } from './game/update';
import { renderBackground, renderGame, renderIntro, renderDeath, renderOutro } from './game/render';

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.scale(dpr, dpr);
}

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

    // ─── Input ───
    const makeDeathChoice = (choice: 'y' | 'n') => {
      if (gs.deathChoice === 0) { gs.deathChoice = choice; gs.deathChoiceAt = performance.now(); }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current === 'death') {
        const textElapsed = performance.now() - phaseStartRef.current - DEATH_EXPLOSION_DURATION;
        if (textElapsed >= DEATH_PROMPT_TIME && gs.deathChoice === 0) {
          if (e.key === 'n' || e.key === 'N') makeDeathChoice('n');
          else makeDeathChoice('y');
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

    // ─── Game loop ───
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
        gs.particles.filter(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0; });
        Matter.Engine.update(engineRef.current, dt * 1000);
        gs.fragments = gs.fragments.filter(f => { f.life -= dt * 0.6; if (f.life <= 0) { Matter.Composite.remove(engineRef.current.world, f.body); return false; } return true; });

        renderDeath(ctx, gs, W, H, phaseElapsed);

        if (gs.deathChoice !== 0 && gs.deathChoiceAt > 0 && now - gs.deathChoiceAt >= DEATH_ACCEPT_DURATION) {
          gs.deathCount++;
          if (gs.deathChoice === 'y') {
            const toAdd = gs.deathCount >= 7 ? 2 : 1;
            for (let i = 0; i < toAdd && gs.helpers.length < 12; i++) {
              gs.helpers.push({
                x: W / 2, y: H - 100,
                name: RESCUE_NAMES[Math.floor(Math.random() * RESCUE_NAMES.length)],
                color: HELPER_COLORS[gs.helpers.length % HELPER_COLORS.length],
                lastFireTime: 0,
              });
            }
            gs.lives = Math.min(MAX_LIVES + Math.floor(gs.deathCount / 2), 12);
          } else {
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
        renderOutro(ctx, gs, W, H, phaseElapsed);
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
