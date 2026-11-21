import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from '@google/genai';
import { getToken, lookup } from '@/lib/api';
import { Player, rms, toBase64 } from '@/lib/audio';
import type { DemoId, ForModel, ForScreen, TranscriptEntry, VoiceState } from '@/types';

interface ActiveCall {
  id: string;
  demoId: DemoId;
  session?: Session;
  stream?: MediaStream;
  micCtx: AudioContext;
  micAnalyser?: AnalyserNode;
  player: Player;
}

export interface VoiceSessionResult {
  state: VoiceState;
  level: number;
  transcript: TranscriptEntry[];
  screen: ForScreen | null;
  lastStatus?: string;
  start: () => Promise<void>;
  stop: () => void;
  error?: string;
}

export function useVoiceSession(demoId: DemoId | null): VoiceSessionResult {
  const [state, setState] = useState<VoiceState>('idle');
  const [level, setLevel] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [screen, setScreen] = useState<ForScreen | null>(null);
  const [lastStatus, setLastStatus] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const callRef = useRef<ActiveCall | null>(null);
  const stateRef = useRef<VoiceState>('idle');
  const thinkingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const updateState = useCallback((next: VoiceState) => {
    if (stateRef.current === next) return;
    stateRef.current = next;
    setState(next);
  }, []);

  const appendTranscript = useCallback((role: 'user' | 'agent', text: string) => {
    setTranscript((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role) {
        return [...prev.slice(0, -1), { role, text: last.text + text }];
      }
      return [...prev, { role, text }];
    });
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const c = callRef.current;
    if (c) {
      callRef.current = null;
      try {
        c.session?.close();
      } catch {
        // ignore close errors
      }
      c.stream?.getTracks().forEach((t) => t.stop());
      c.player.stop();
      void c.micCtx.close().catch(() => {});
      void c.player.ctx.close().catch(() => {});
    }
    thinkingRef.current = false;
    setLevel(0);
    updateState('idle');
  }, [updateState]);

  const startAnimateLoop = useCallback(() => {
    const tick = () => {
      const c = callRef.current;
      if (!c) {
        setLevel(0);
        return;
      }
      const speaking = c.player.sources.size > 0;
      const mic = rms(c.micAnalyser);
      const out = rms(c.player.analyser);
      setLevel(Math.min(1, Math.max(mic, out) * 4));
      updateState(thinkingRef.current ? 'thinking' : speaking ? 'speaking' : 'listening');
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [updateState]);

  const runTool = useCallback(
    async (c: ActiveCall, name: string, args: Record<string, unknown> | undefined): Promise<ForModel | { error: string }> => {
      try {
        if (name === 'lookup_answer') {
          const query = typeof args?.query === 'string' ? args.query : '';
          const res = await lookup({ query, callId: c.id, demo: c.demoId });
          if (callRef.current !== c) return res.forModel;
          if ('status' in res.forModel) {
            setLastStatus(res.forModel.status);
          }
          if (res.forScreen.cards.length || res.forScreen.actions.length) {
            setScreen(res.forScreen);
          }
          return res.forModel;
        }
        return { error: `unknown tool ${name}` };
      } catch {
        // Tell the model the lookup failed, so it says so instead of guessing.
        return { error: 'lookup unavailable, tell the visitor to try again or call the sales office' };
      }
    },
    [],
  );

  const start = useCallback(async () => {
    if (!demoId || callRef.current) return;
    setError(undefined);
    updateState('connecting');

    // AudioContexts must be created inside a user click, or the browser keeps them suspended.
    const micCtx = new AudioContext({ sampleRate: 16000 }); // Live wants 16 kHz in
    const player = new Player(new AudioContext({ sampleRate: 24000 })); // and sends 24 kHz out
    const c: ActiveCall = { id: crypto.randomUUID(), demoId, micCtx, player };
    callRef.current = c;

    try {
      // 1. Short-lived token from our server. The API key never reaches the browser.
      const { token, model } = await getToken(demoId);
      if (callRef.current !== c) return;

      // 2. Open the Live session straight from the browser with that token.
      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } });
      c.session = await ai.live.connect({
        model,
        config: { responseModalities: [Modality.AUDIO] }, // the rest is locked in the token
        callbacks: {
          onopen: () => {
            if (callRef.current === c) updateState('listening');
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (callRef.current !== c) return;
            const sc = msg.serverContent;
            if (sc?.interrupted) c.player.stop(); // the visitor talked over the agent: drop queued audio
            for (const part of sc?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) c.player.play(part.inlineData.data);
            }
            if (sc?.inputTranscription?.text) appendTranscript('user', sc.inputTranscription.text);
            if (sc?.outputTranscription?.text) appendTranscript('agent', sc.outputTranscription.text);

            if (msg.toolCall?.functionCalls?.length) {
              thinkingRef.current = true;
              updateState('thinking');
              const functionResponses = [];
              for (const fc of msg.toolCall.functionCalls) {
                const fcName = fc.name ?? '';
                const response = await runTool(c, fcName, fc.args as Record<string, unknown> | undefined);
                functionResponses.push({ id: fc.id, name: fcName, response });
              }
              thinkingRef.current = false;
              if (callRef.current === c) {
                c.session?.sendToolResponse({ functionResponses });
              }
            }
          },
          onerror: (e: ErrorEvent) => {
            if (callRef.current === c) {
              setError(e.message || 'Live session error');
            }
          },
          onclose: () => {
            if (callRef.current === c) stop();
          },
        },
      });
      if (callRef.current !== c) return;

      // 3. Mic → worklet → 100 ms PCM chunks → Live.
      c.stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      if (callRef.current !== c) {
        c.stream.getTracks().forEach((t) => t.stop());
        return;
      }
      await micCtx.audioWorklet.addModule('/mic-worklet.js');
      if (callRef.current !== c) return;

      const mic = new AudioWorkletNode(micCtx, 'mic');
      const micSource = micCtx.createMediaStreamSource(c.stream);
      micSource.connect(mic);
      c.micAnalyser = micCtx.createAnalyser(); // only for the orb animation
      micSource.connect(c.micAnalyser);
      startAnimateLoop();

      mic.port.onmessage = (e: MessageEvent<Int16Array>) => {
        if (callRef.current !== c) return;
        try {
          c.session?.sendRealtimeInput({
            audio: { data: toBase64(e.data.buffer as ArrayBuffer), mimeType: 'audio/pcm;rate=16000' },
          });
        } catch {
          // ignore if session is closing
        }
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start voice session';
      setError(message);
      stop();
    }
  }, [appendTranscript, demoId, runTool, startAnimateLoop, stop, updateState]);

  // Switching demo stops any active call and clears transcript/screen.
  useEffect(() => {
    stop();
    setTranscript([]);
    setScreen(null);
    setLastStatus(undefined);
    setError(undefined);
  }, [demoId, stop]);

  // Clean up everything on unmount.
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    state,
    level,
    transcript,
    screen,
    lastStatus,
    start,
    stop,
    error,
  };
}
