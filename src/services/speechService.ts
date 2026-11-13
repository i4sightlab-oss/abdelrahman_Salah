/**
 * Browser-native Web Speech Synthesis API wrapper.
 * Provides English and Arabic pronunciation completely offline, with slow/normal rate controls.
 */
class SpeechService {
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;
  private currentListener: ((speaking: boolean) => void) | null = null;
  private speechRate: number = 0.9; // Default slightly measured for children

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
  }

  public setRate(rate: number) {
    this.speechRate = Math.max(0.5, Math.min(1.5, rate));
  }

  public getRate(): number {
    return this.speechRate;
  }

  public onSpeakingChange(cb: (speaking: boolean) => void) {
    this.currentListener = cb;
  }

  private setSpeaking(val: boolean) {
    this.isSpeaking = val;
    if (this.currentListener) {
      this.currentListener(val);
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.setSpeaking(false);
    }
  }

  /**
   * Speak English text with pronunciation optimization for young language learners
   */
  public speakEnglish(text: string, slowMode: boolean = false): Promise<void> {
    return this.speak(text, 'en-US', slowMode ? 0.72 : this.speechRate);
  }

  /**
   * Speak Arabic text with Tashkeel preservation
   */
  public speakArabic(text: string, slowMode: boolean = false): Promise<void> {
    return this.speak(text, 'ar-EG', slowMode ? 0.75 : this.speechRate);
  }

  private speak(text: string, langPrefix: string, rate: number): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      this.stop();

      // Ensure voices are populated
      if (this.voices.length === 0) {
        this.voices = window.speechSynthesis.getVoices();
      }

      const cleanText = text.trim();
      if (!cleanText) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.pitch = 1.05; // Slightly cheerful child-friendly pitch

      // Find best matching voice
      const targetLang = langPrefix.toLowerCase();
      let selectedVoice = this.voices.find(v => v.lang.toLowerCase().replace('_', '-') === targetLang);

      if (!selectedVoice) {
        // Fallback to broader language code
        const baseLang = targetLang.split('-')[0];
        selectedVoice = this.voices.find(v => v.lang.toLowerCase().startsWith(baseLang));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.lang = langPrefix;

      utterance.onstart = () => {
        this.setSpeaking(true);
      };

      utterance.onend = () => {
        this.setSpeaking(false);
        resolve();
      };

      utterance.onerror = () => {
        this.setSpeaking(false);
        resolve();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        this.setSpeaking(false);
        resolve();
      }
    });
  }
}

/**
 * Normalizes Arabic text by removing tashkeel / harakat and unifying alefs and taa marbuta
 * for flexible search matching.
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove diacritics / tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alefs (أ, إ, آ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Taa Marbuta (ة -> ه)
    .replace(/ة/g, 'ه')
    // Normalize Yaa (ى -> ي)
    .replace(/ى/g, 'ي')
    .trim()
    .toLowerCase();
}

export const speechService = new SpeechService();
