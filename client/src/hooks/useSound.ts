import { useCallback, useRef } from 'react';

// Define sound types
type SoundType = 
  | 'correct' 
  | 'incorrect' 
  | 'level-up' 
  | 'achievement' 
  | 'purchase' 
  | 'streak' 
  | 'notification' 
  | 'button-click' 
  | 'whoosh' 
  | 'sparkle' 
  | 'coin'
  | 'welcome';

interface SoundConfig {
  volume?: number;
  playbackRate?: number;
  loop?: boolean;
}

// Since we don't have actual sound files, we'll create synthetic sounds using Web Audio API
export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Create synthetic sound
  const createSyntheticSound = useCallback((
    frequency: number, 
    duration: number, 
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ) => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [getAudioContext]);

  // Create complex sound sequences
  const createSequence = useCallback((notes: Array<{frequency: number, duration: number, delay?: number}>, volume: number = 0.3) => {
    notes.forEach((note, index) => {
      setTimeout(() => {
        createSyntheticSound(note.frequency, note.duration, 'sine', volume);
      }, (note.delay || 0) + (index * 50));
    });
  }, [createSyntheticSound]);

  // Play sound based on type
  const playSound = useCallback((soundType: SoundType, config: SoundConfig = {}) => {
    const { volume = 0.3, playbackRate = 1 } = config;
    
    try {
      switch (soundType) {
        case 'correct':
          // Happy ascending notes
          createSequence([
            { frequency: 523.25, duration: 0.15 }, // C5
            { frequency: 659.25, duration: 0.15 }, // E5
            { frequency: 783.99, duration: 0.25 }  // G5
          ], volume);
          break;
          
        case 'incorrect':
          // Descending notes, more gentle
          createSequence([
            { frequency: 392.00, duration: 0.2 }, // G4
            { frequency: 329.63, duration: 0.3 }  // E4
          ], volume * 0.7);
          break;
          
        case 'level-up':
          // Triumphant ascending scale
          createSequence([
            { frequency: 261.63, duration: 0.1 }, // C4
            { frequency: 329.63, duration: 0.1 }, // E4
            { frequency: 392.00, duration: 0.1 }, // G4
            { frequency: 523.25, duration: 0.1 }, // C5
            { frequency: 659.25, duration: 0.2 }, // E5
            { frequency: 783.99, duration: 0.3 }  // G5
          ], volume);
          break;
          
        case 'achievement':
          // Fanfare-like sequence
          createSequence([
            { frequency: 523.25, duration: 0.2 }, // C5
            { frequency: 659.25, duration: 0.2, delay: 100 }, // E5
            { frequency: 783.99, duration: 0.15, delay: 200 }, // G5
            { frequency: 1046.50, duration: 0.4, delay: 300 }  // C6
          ], volume);
          break;
          
        case 'purchase':
          // Cash register-like sound
          createSequence([
            { frequency: 1174.66, duration: 0.1 }, // D6
            { frequency: 987.77, duration: 0.15 }, // B5
            { frequency: 1318.51, duration: 0.2 }  // E6
          ], volume);
          break;
          
        case 'streak':
          // Rhythmic fire-like sound
          createSequence([
            { frequency: 880.00, duration: 0.1 }, // A5
            { frequency: 1174.66, duration: 0.1, delay: 80 }, // D6
            { frequency: 1396.91, duration: 0.15, delay: 160 } // F6
          ], volume);
          break;
          
        case 'notification':
          // Gentle chime
          createSyntheticSound(800, 0.3, 'sine', volume * 0.5);
          setTimeout(() => {
            createSyntheticSound(1000, 0.4, 'sine', volume * 0.4);
          }, 150);
          break;
          
        case 'button-click':
          // Quick click sound
          createSyntheticSound(800, 0.1, 'square', volume * 0.3);
          break;
          
        case 'whoosh':
          // Sweeping sound using white noise
          const ctx = getAudioContext();
          const bufferSize = ctx.sampleRate * 0.3;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
          }
          
          const source = ctx.createBufferSource();
          const gainNode = ctx.createGain();
          source.buffer = buffer;
          source.connect(gainNode);
          gainNode.connect(ctx.destination);
          gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
          source.start();
          break;
          
        case 'sparkle':
          // High pitched twinkling
          createSequence([
            { frequency: 1760.00, duration: 0.1 }, // A6
            { frequency: 2093.00, duration: 0.1, delay: 50 }, // C7
            { frequency: 2637.02, duration: 0.1, delay: 100 } // E7
          ], volume * 0.4);
          break;
          
        case 'coin':
          // Metallic coin sound
          createSequence([
            { frequency: 1318.51, duration: 0.05 }, // E6
            { frequency: 1174.66, duration: 0.1 }, // D6
            { frequency: 1046.50, duration: 0.15 } // C6
          ], volume);
          break;
          
        case 'welcome':
          // Warm welcome melody
          createSequence([
            { frequency: 523.25, duration: 0.2 }, // C5
            { frequency: 587.33, duration: 0.2, delay: 200 }, // D5
            { frequency: 659.25, duration: 0.2, delay: 400 }, // E5
            { frequency: 783.99, duration: 0.4, delay: 600 }  // G5
          ], volume);
          break;
          
        default:
          console.warn(`Unknown sound type: ${soundType}`);
      }
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, [createSyntheticSound, createSequence, getAudioContext]);

  // Batch play sounds for celebrations
  const playCelebrationSound = useCallback(() => {
    playSound('achievement');
    setTimeout(() => playSound('sparkle'), 300);
    setTimeout(() => playSound('correct'), 600);
  }, [playSound]);

  const playLevelUpSound = useCallback(() => {
    playSound('level-up');
    setTimeout(() => playSound('achievement'), 800);
  }, [playSound]);

  const playPurchaseSound = useCallback(() => {
    playSound('coin');
    setTimeout(() => playSound('purchase'), 200);
  }, [playSound]);

  return {
    playSound,
    playCelebrationSound,
    playLevelUpSound,
    playPurchaseSound
  };
};

export default useSound;