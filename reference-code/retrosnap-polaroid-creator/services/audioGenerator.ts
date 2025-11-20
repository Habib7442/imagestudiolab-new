
import { MusicTrack } from "../types";

class AudioGenerator {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private intervalId: number | null = null;
  // Add destination node to capture audio stream
  private destinationNode: MediaStreamAudioDestinationNode | null = null;

  private scales = {
    happy: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // C Major Pentatonic
    sad: [220.00, 246.94, 261.63, 293.66, 329.63, 440.00], // A Minor
    chill: [261.63, 311.13, 349.23, 392.00, 466.16], // Eb Major 7th vibe
    energetic: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25] // C Major Scale
  };

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Initialize the destination node for stream capturing
      this.destinationNode = this.ctx.createMediaStreamDestination();
    }
  }

  // Method required by App.tsx to get the audio stream for video export
  public getAudioStream(): MediaStream | null {
    if (!this.ctx) this.init();
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  public async playGenerated(track: MusicTrack) {
    this.stop();
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
    }

    this.isPlaying = true;
    const scale = this.scales[track.mood] || this.scales.chill;
    const beatTime = 60 / track.tempo;

    // Create a simple loop
    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      
      // Play a random note from the scale
      const noteFreq = scale[Math.floor(Math.random() * scale.length)];
      const duration = track.mood === 'energetic' ? 0.2 : 1.5;
      
      this.playTone(noteFreq, duration, track.mood);
      
      // Occasionally play a harmony
      if (Math.random() > 0.6) {
         const harmonyFreq = scale[Math.floor(Math.random() * scale.length)] * 0.5;
         this.playTone(harmonyFreq, duration * 2, track.mood, 0.3);
      }

    }, beatTime * 1000);
  }

  private playTone(freq: number, duration: number, mood: string, volume: number = 0.5) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Sound design based on mood
    if (mood === 'happy' || mood === 'energetic') {
        osc.type = 'triangle';
    } else if (mood === 'sad') {
        osc.type = 'sine';
    } else {
        osc.type = 'sine'; // chill
    }

    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    // Envelope
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination); // Output to speakers

    // Also connect to the destination node for recording
    if (this.destinationNode) {
        gain.connect(this.destinationNode);
    }

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
    
    // Cleanup logic roughly
    setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
    }, duration * 1000 + 100);
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Kill all active sounds if we were tracking them strictly, 
    // but mostly we just stop scheduling new ones.
    if (this.ctx) {
        this.ctx.suspend();
    }
  }
  
  public playUpload(url: string) {
      // For uploads, we rely on an HTMLAudioElement in the UI, 
      // but if we wanted to route through Web Audio we could.
      // This placeholder is just for consistency.
  }
}

export const audioGenerator = new AudioGenerator();
