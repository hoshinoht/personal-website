/** Web Audio API synthesized sound effects. No audio files needed. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!ctx) {
    try { ctx = new AudioContext(); } catch { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function osc(type: OscillatorType, freq: number, freqEnd: number, duration: number, gain: number) {
  const ac = getCtx();
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), ac.currentTime + duration);
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  o.connect(g).connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + duration);
}

function noise(duration: number, gain: number) {
  const ac = getCtx();
  if (!ac) return;
  const len = ac.sampleRate * duration;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  const g = ac.createGain();
  src.buffer = buf;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  src.connect(g).connect(ac.destination);
  src.start();
  src.stop(ac.currentTime + duration);
}

export const audio = {
  laser()    { osc('square', 800, 200, 0.05, 0.12); },
  hit()      { noise(0.06, 0.08); osc('square', 200, 100, 0.06, 0.08); },
  destroy()  { osc('triangle', 400, 100, 0.1, 0.15); },
  explosion(){ osc('sine', 60, 30, 0.5, 0.2); noise(0.15, 0.15); },
  bossWarn() { osc('sine', 200, 400, 0.3, 0.08); },
  select()   { osc('triangle', 600, 600, 0.06, 0.1); },
};
