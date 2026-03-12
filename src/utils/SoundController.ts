// Simple Sound Controller using Web Audio API
export const SoundController = {
    ctx: null as AudioContext | null,
    bgmOscillators: [] as AudioNode[],
    init: () => {
        if (typeof window !== 'undefined') {
            if (!SoundController.ctx) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                SoundController.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (SoundController.ctx?.state === 'suspended') {
                SoundController.ctx.resume().catch(() => { });
            }
        }
    },
    startBGM: () => {
        if (!SoundController.ctx) return;
        SoundController.stopBGM(); // Ensure no overlapping BGM

        const ctx = SoundController.ctx;
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
        }
        const t = ctx.currentTime;

        // Deep Drone Layer 1 (Base - Sawtooth for texture, filtered)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const filter1 = ctx.createBiquadFilter();

        osc1.type = 'sawtooth'; // Sawtooth has more harmonics than sine
        osc1.frequency.setValueAtTime(55, t); // Low A (A1)

        filter1.type = 'lowpass';
        filter1.frequency.setValueAtTime(140, t); // Cut off high frequencies to keep it "deep" but audible
        filter1.Q.value = 1;

        gain1.gain.setValueAtTime(0.2, t); // Louder

        // Layer 2 (Octave Up - Sine for smooth body)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(110, t); // A2
        gain2.gain.setValueAtTime(0.15, t);

        // LFO for filter sweep (Movement)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Slow pulse
        lfoGain.gain.value = 40;

        lfo.connect(lfoGain);
        lfoGain.connect(filter1.frequency);

        // Wiring
        osc1.connect(filter1);
        filter1.connect(gain1);
        gain1.connect(ctx.destination);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(t);
        osc2.start(t);
        lfo.start(t);

        SoundController.bgmOscillators.push(osc1, osc2, gain1, gain2, filter1, lfo, lfoGain);
    },
    stopBGM: () => {
        SoundController.bgmOscillators.forEach(node => {
            if (node instanceof OscillatorNode) {
                try { node.stop(); } catch { /* ignore */ }
            }
            node.disconnect();
        });
        SoundController.bgmOscillators = [];
    },
    engineOscillators: [] as { osc: OscillatorNode, gain: GainNode }[],
    updateEngine: () => {
        return; // Engine sound completely disabled per request
    },
    stopEngine: () => {
        SoundController.engineOscillators.forEach(o => {
            try { o.osc.stop(); } catch { /* ignore */ }
            o.osc.disconnect();
            o.gain.disconnect();
        });
        SoundController.engineOscillators = [];
    },
    gravityOscillator: null as ({ osc: OscillatorNode, gain: GainNode } | null),
    updateGravity: (active: boolean) => {
        if (!SoundController.ctx) return;
        const ctx = SoundController.ctx;
        const t = ctx.currentTime;

        if (active) {
            if (!SoundController.gravityOscillator) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(50, t);
                gain.gain.setValueAtTime(0, t);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t);
                SoundController.gravityOscillator = { osc, gain };
            }
            SoundController.gravityOscillator.gain.gain.setTargetAtTime(0.4, t, 0.1);
            SoundController.gravityOscillator.osc.frequency.setTargetAtTime(40 + Math.random() * 20, t, 0.1);
        } else {
            if (SoundController.gravityOscillator) {
                SoundController.gravityOscillator.gain.gain.setTargetAtTime(0, t, 0.2);
            }
        }
    },
    stopGravity: () => {
        if (SoundController.gravityOscillator) {
            try { SoundController.gravityOscillator.osc.stop(); } catch { /* ignore */ }
            SoundController.gravityOscillator.osc.disconnect();
            SoundController.gravityOscillator.gain.disconnect();
            SoundController.gravityOscillator = null;
        }
    },
    play: (type: 'start' | 'collect' | 'fuel' | 'damage' | 'shield_hit' | 'shield_get' | 'heal' | 'gameover' | 'shoot') => {
        if (!SoundController.ctx) return;
        const ctx = SoundController.ctx;
        const t = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        switch (type) {
            case 'start':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(220, t);
                osc.frequency.exponentialRampToValueAtTime(880, t + 0.5);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
                osc.start(t);
                osc.stop(t + 0.5);
                break;
            case 'collect':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, t);
                osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;
            case 'fuel':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, t);
                osc.frequency.exponentialRampToValueAtTime(660, t + 0.1);
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;
            case 'shield_get':
                osc.type = 'square';
                osc.frequency.setValueAtTime(220, t);
                osc.frequency.linearRampToValueAtTime(440, t + 0.3);
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.linearRampToValueAtTime(0.01, t + 0.3);
                osc.start(t);
                osc.stop(t + 0.3);
                break;
            case 'heal':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, t);
                osc.frequency.linearRampToValueAtTime(554, t + 0.1); // C#
                osc.frequency.linearRampToValueAtTime(659, t + 0.2); // E
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0.01, t + 0.4);
                osc.start(t);
                osc.stop(t + 0.4);
                break;
            case 'damage':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, t);
                osc.frequency.exponentialRampToValueAtTime(20, t + 0.2);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                osc.start(t);
                osc.stop(t + 0.2);
                break;
            case 'shield_hit':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;
            case 'gameover':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(440, t);
                osc.frequency.exponentialRampToValueAtTime(55, t + 2);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 2);
                osc.start(t);
                osc.stop(t + 2);
                break;
            case 'shoot':
                osc.type = 'square';
                osc.frequency.setValueAtTime(1200, t);
                osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
                gain.gain.setValueAtTime(0.005, t); // Reduced volume
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;
        }
    }
};
