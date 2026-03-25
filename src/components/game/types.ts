import type Matter from 'matter-js';

export interface Ship { x: number; y: number }
export interface Bullet { x: number; y: number; prevX: number; prevY: number; active: boolean }
export interface EnemyBullet { x: number; y: number; vx: number; vy: number; prevX: number; prevY: number; active: boolean }
export type MovePattern = 'straight' | 'weave' | 'dive';
export interface Target {
  id: number; x: number; y: number;
  width: number; height: number;
  text: string; hp: number; maxHp: number;
  color: string; speed: number;
  flashUntil: number;
  fireRate: number;
  movePattern: MovePattern;
}
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; active: boolean }
export interface Fragment {
  body: Matter.Body; color: string;
  width: number; height: number; life: number;
}
export interface Helper {
  x: number; y: number;
  name: string;
  color: string;
  lastFireTime: number;
}
export type Phase = 'intro' | 'playing' | 'death' | 'destroyed' | 'done';

/* ── Object pool ── */
export class Pool<T> {
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
    for (const item of this.items) {
      if (!this.isActive(item)) return item;
    }
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

export interface GameState {
  ship: Ship;
  mouseX: number;
  mouseY: number;
  mouseActive: boolean;
  bullets: Pool<Bullet>;
  enemyBullets: Pool<EnemyBullet>;
  particles: Pool<Particle>;
  targets: Target[];
  fragments: Fragment[];
  helpers: Helper[];
  keys: Set<string>;
  firing: boolean;
  lastBulletTime: number;
  spawnQueue: Array<{ text: string; color: string; hp: number; fireRate: number; wave: number; movePattern: MovePattern }>;
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
  bossCharging: boolean;
  bossChargeStart: number;
  deathChoice: 0 | 'y' | 'n';
  deathChoiceAt: number;
}
