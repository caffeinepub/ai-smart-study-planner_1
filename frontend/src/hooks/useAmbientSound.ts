import { useEffect, useRef } from 'react';
import type { AmbientSound } from '../components/AdvancedFocusSettings';

/**
 * Builds an AudioContext-based ambient sound generator.
 * Returns a cleanup function that stops and disconnects all nodes.
 */
function createAmbientSound(
  ctx: AudioContext,
  type: Exclude<AmbientSound, 'none'>
): () => void {
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(ctx.destination);

  const sampleRate = ctx.sampleRate;
  // 4-second looping buffer
  const bufferSize = sampleRate * 4;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = noiseBuffer.getChannelData(0);

  // Fixed: use 'whitenoise' to match the updated AmbientSound type
  if (type === 'whitenoise') {
    // Pure white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    source.connect(masterGain);
    source.start();
    return () => {
      try { source.stop(); } catch { /* already stopped */ }
      source.disconnect();
      masterGain.disconnect();
    };

  } else if (type === 'rain') {
    // Rain: pink-ish noise (lowpass filtered white noise) + gentle gain modulation
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Lowpass filter to make it sound like rain (muffled)
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1200;
    lowpass.Q.value = 0.5;

    // Second lowpass for extra softness
    const lowpass2 = ctx.createBiquadFilter();
    lowpass2.type = 'lowpass';
    lowpass2.frequency.value = 800;
    lowpass2.Q.value = 0.3;

    // Highpass to remove very low rumble
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 200;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(lowpass2);
    lowpass2.connect(masterGain);
    masterGain.gain.value = 0.5;
    source.start();

    // Gentle amplitude modulation to simulate rain intensity variation
    let modInterval: ReturnType<typeof setInterval> | null = null;
    let step = 0;
    modInterval = setInterval(() => {
      step += 0.05;
      const mod = 0.45 + 0.1 * Math.sin(step) + 0.05 * (Math.random() - 0.5);
      try {
        masterGain.gain.setTargetAtTime(mod, ctx.currentTime, 0.3);
      } catch { /* context may be closed */ }
    }, 300);

    return () => {
      if (modInterval) clearInterval(modInterval);
      try { source.stop(); } catch { /* already stopped */ }
      source.disconnect();
      highpass.disconnect();
      lowpass.disconnect();
      lowpass2.disconnect();
      masterGain.disconnect();
    };

  } else {
    // cafe: pink noise (approximated) with bandpass to simulate room ambience
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Bandpass to simulate the mid-frequency hum of a cafe
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 600;
    bandpass.Q.value = 0.4;

    // Lowpass to soften high frequencies
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2500;

    source.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(masterGain);
    masterGain.gain.value = 0.4;
    source.start();

    // Subtle random gain variation to simulate conversation bursts
    let modInterval: ReturnType<typeof setInterval> | null = null;
    let phase = 0;
    modInterval = setInterval(() => {
      phase += 0.03;
      const mod = 0.35 + 0.08 * Math.sin(phase * 1.3) + 0.07 * Math.sin(phase * 0.7) + 0.04 * (Math.random() - 0.5);
      try {
        masterGain.gain.setTargetAtTime(Math.max(0.1, mod), ctx.currentTime, 0.5);
      } catch { /* context may be closed */ }
    }, 400);

    return () => {
      if (modInterval) clearInterval(modInterval);
      try { source.stop(); } catch { /* already stopped */ }
      source.disconnect();
      bandpass.disconnect();
      lowpass.disconnect();
      masterGain.disconnect();
    };
  }
}

/**
 * Hook that manages ambient sound playback using the Web Audio API.
 * Automatically starts/stops/switches audio based on the selected sound.
 * Cleans up on unmount.
 */
export function useAmbientSound(selectedSound: AmbientSound): void {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Stop any currently playing sound
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (selectedSound === 'none') {
      // Close the AudioContext to free resources
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    // Create or resume AudioContext
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext();
      }

      const ctx = audioCtxRef.current;

      const startSound = () => {
        try {
          cleanupRef.current = createAmbientSound(ctx, selectedSound);
        } catch (err) {
          console.warn('[useAmbientSound] Failed to create ambient sound:', err);
        }
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(startSound).catch((err) => {
          console.warn('[useAmbientSound] Failed to resume AudioContext:', err);
        });
      } else {
        startSound();
      }
    } catch (err) {
      console.warn('[useAmbientSound] AudioContext not available:', err);
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [selectedSound]);

  // Cleanup on unmount — close the AudioContext entirely
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);
}
