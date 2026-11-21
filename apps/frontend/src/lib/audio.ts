// Plays 24 kHz PCM chunks back to back. Each chunk is scheduled to start
// exactly when the previous one ends, so there are no gaps or overlaps.
export class Player {
  readonly ctx: AudioContext;
  readonly analyser: AnalyserNode;
  readonly sources = new Set<AudioBufferSourceNode>();
  private next = 0;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.analyser = ctx.createAnalyser(); // only for the orb animation
    this.analyser.connect(ctx.destination);
  }

  play(b64: string): void {
    const i16 = new Int16Array(fromBase64(b64));
    const f32 = Float32Array.from(i16, (v) => v / 32768);
    const buf = this.ctx.createBuffer(1, f32.length, 24000);
    buf.copyToChannel(f32, 0);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.analyser);
    const at = Math.max(this.ctx.currentTime, this.next);
    src.start(at);
    this.next = at + buf.duration;
    this.sources.add(src);
    src.onended = () => this.sources.delete(src);
  }

  stop(): void {
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        // ignore if already stopped
      }
    }
    this.sources.clear();
    this.next = 0;
  }
}

export function toBase64(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

export function fromBase64(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes.buffer;
}

export function rms(analyser: AnalyserNode | null | undefined): number {
  if (!analyser) return 0;
  const buf = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buf);
  let sum = 0;
  for (const v of buf) sum += v * v;
  return Math.sqrt(sum / buf.length);
}
