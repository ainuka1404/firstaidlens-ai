// Web Speech API Voice Copilot for Audio Guidance

class VoiceCopilot {
  private isVoiceEnabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onStateChangeCallback: ((speaking: boolean) => void) | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initVoices();
  }

  private getSynth(): SpeechSynthesis | null {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis;
    }
    return null;
  }

  private initVoices() {
    const synth = this.getSynth();
    if (!synth) return;

    const load = () => {
      try {
        const v = synth.getVoices();
        if (v && v.length > 0) {
          this.cachedVoices = v;
        }
      } catch {
        // Ignore
      }
    };

    load();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  public setEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public getEnabled(): boolean {
    return this.isVoiceEnabled;
  }

  public setListener(cb: (speaking: boolean) => void) {
    this.onStateChangeCallback = cb;
  }

  public speak(text: string, language: 'id' | 'en' = 'id') {
    const synth = this.getSynth();
    if (!synth || !this.isVoiceEnabled || !text) {
      return;
    }

    try {
      // Fix Chrome / Safari paused speech synthesis bug
      if (synth.paused) {
        synth.resume();
      }
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const targetLang = language === 'id' ? 'id-ID' : 'en-US';
      utterance.lang = targetLang;
      utterance.rate = language === 'id' ? 0.95 : 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Search available voices
      const voices = this.cachedVoices.length > 0 ? this.cachedVoices : synth.getVoices();
      if (voices && voices.length > 0) {
        this.cachedVoices = voices;
        const matchedVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().replace('_', '-') === targetLang.toLowerCase() ||
            v.lang.toLowerCase().startsWith(language.toLowerCase())
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onstart = () => {
        if (this.onStateChangeCallback) this.onStateChangeCallback(true);
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      };

      utterance.onerror = (e) => {
        // Cancel or interruption is normal during rapid navigation
        this.currentUtterance = null;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      };

      // Unstick Chrome speech queue if it froze
      if (synth.speaking) {
        synth.cancel();
      }

      // Small delay prevents browser speech cancel race conditions
      setTimeout(() => {
        try {
          synth.speak(utterance);
          // Resume again in case browser auto-suspended
          if (synth.paused) {
            synth.resume();
          }
        } catch (err) {
          console.warn('Speech synthesis speak execution failed:', err);
        }
      }, 30);
    } catch (err) {
      console.warn('Speech synthesis initialization error:', err);
    }
  }

  public stop() {
    const synth = this.getSynth();
    if (synth) {
      try {
        synth.cancel();
      } catch {
        // Ignore
      }
      this.currentUtterance = null;
      if (this.onStateChangeCallback) this.onStateChangeCallback(false);
    }
  }

  public isSpeaking(): boolean {
    const synth = this.getSynth();
    return synth ? synth.speaking : false;
  }
}

export const voiceCopilot = new VoiceCopilot();

