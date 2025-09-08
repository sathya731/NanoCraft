// Simple sound effects utility
export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;

  private constructor() {
    // Initialize audio context on first user interaction
    this.initAudioContext();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Audio not supported in this browser');
    }
  }

  private createBeep(frequency: number, duration: number, volume: number = 0.1): void {
    if (!this.audioContext) return;

    // Resume audio context if suspended (required for user interaction)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  public playDragSound(): void {
    // Subtle pickup sound - quick high note
    this.createBeep(800, 0.1, 0.05);
  }

  public playCombineSound(): void {
    // Magical combination sound - ascending notes
    this.createBeep(400, 0.15, 0.08);
    setTimeout(() => this.createBeep(600, 0.15, 0.08), 50);
    setTimeout(() => this.createBeep(800, 0.2, 0.08), 100);
  }

  public playDropSound(): void {
    // Drop sound - quick low note
    this.createBeep(300, 0.1, 0.05);
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();
