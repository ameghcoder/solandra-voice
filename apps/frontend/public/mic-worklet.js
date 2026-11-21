// Runs on the audio thread. Gets 128-sample float frames from the mic (at the
// AudioContext's 16 kHz rate), converts to 16-bit PCM, and posts 100 ms chunks.
class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buf = new Int16Array(1600); // 100 ms at 16 kHz
    this.n = 0;
  }

  process(inputs) {
    const ch = inputs[0][0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) {
      const s = Math.max(-1, Math.min(1, ch[i]));
      this.buf[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.n === this.buf.length) {
        this.port.postMessage(this.buf.slice(0)); // copy, the buffer is reused
        this.n = 0;
      }
    }
    return true;
  }
}

registerProcessor('mic', MicProcessor);
