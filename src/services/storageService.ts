import { DEFAULT_BADGES, DEFAULT_IRREGULAR_VERBS, DEFAULT_READING_PASSAGES, DEFAULT_WORDS } from '../data/defaultCurriculum';
import { Badge, DailyReflection, GradeLevel, IrregularVerb, ReadingPassage, StudentProgress, WordItem } from '../types';

const STORAGE_KEYS = {
  WORDS: 'nilekids_words_v1',
  PASSAGES: 'nilekids_passages_v1',
  VERBS: 'nilekids_verbs_v1',
  PROGRESS: 'nilekids_progress_v1',
  TEACHER_PIN: 'nilekids_teacher_pin_v1',
  SLOW_AUDIO: 'nilekids_slow_audio_v1',
};

const INITIAL_PROGRESS: StudentProgress = {
  xp: 15,
  stars: 3,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  activeGrade: 'P4',
  masteredWordIds: [],
  learningWordIds: ['w-pyramid', 'w-pharaoh', 'w-nile'],
  favoriteWordIds: ['w-pyramid', 'w-koshari'],
  completedPassageIds: [],
  unlockedBadgeIds: ['b-first-word'],
  gameHighScores: {
    wordMatch: 0,
    spellingBee: 0,
    pictureQuiz: 0,
    verbsDrill: 0,
  },
  reflections: [],
};

class StorageService {
  // --- WORDS ---
  public getWords(): WordItem[] {
    if (typeof window === 'undefined') return DEFAULT_WORDS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORDS);
      if (!data) {
        this.saveWords(DEFAULT_WORDS);
        return DEFAULT_WORDS;
      }
      const words: WordItem[] = JSON.parse(data);
      // Auto-migrate: ensure new spellingbee2026/2027 words are included for existing stored sessions
      const hasSpellingBee = words.some((w) => w.category === 'spellingbee2026/2027');
      if (!hasSpellingBee) {
        const beeWords = DEFAULT_WORDS.filter((w) => w.category === 'spellingbee2026/2027');
        if (beeWords.length > 0) {
          const merged = [...words, ...beeWords];
          this.saveWords(merged);
          return merged;
        }
      }
      return words;
    } catch {
      return DEFAULT_WORDS;
    }
  }

  public saveWords(words: WordItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
    } catch (e) {
      console.error('Failed to save words', e);
    }
  }

  public addWord(word: WordItem): void {
    const words = this.getWords();
    const existingIdx = words.findIndex((w) => w.id === word.id);
    if (existingIdx >= 0) {
      words[existingIdx] = word;
    } else {
      words.unshift(word);
    }
    this.saveWords(words);
  }

  public deleteWord(id: string): void {
    const words = this.getWords().filter((w) => w.id !== id);
    this.saveWords(words);
  }

  // --- PASSAGES ---
  public getPassages(): ReadingPassage[] {
    if (typeof window === 'undefined') return DEFAULT_READING_PASSAGES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PASSAGES);
      if (!data) {
        this.savePassages(DEFAULT_READING_PASSAGES);
        return DEFAULT_READING_PASSAGES;
      }
      const passages: ReadingPassage[] = JSON.parse(data);
      const hasSpellingBeePassage = passages.some((p) => p.category === 'spellingbee2026/2027');
      if (!hasSpellingBeePassage) {
        const beePassages = DEFAULT_READING_PASSAGES.filter((p) => p.category === 'spellingbee2026/2027');
        if (beePassages.length > 0) {
          const merged = [...passages, ...beePassages];
          this.savePassages(merged);
          return merged;
        }
      }
      return passages;
    } catch {
      return DEFAULT_READING_PASSAGES;
    }
  }

  public savePassages(passages: ReadingPassage[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PASSAGES, JSON.stringify(passages));
    } catch (e) {
      console.error('Failed to save passages', e);
    }
  }

  public addPassage(passage: ReadingPassage): void {
    const passages = this.getPassages();
    const existingIdx = passages.findIndex(p => p.id === passage.id);
    if (existingIdx >= 0) {
      passages[existingIdx] = passage;
    } else {
      passages.unshift(passage);
    }
    this.savePassages(passages);
  }

  // --- VERBS ---
  public getVerbs(): IrregularVerb[] {
    if (typeof window === 'undefined') return DEFAULT_IRREGULAR_VERBS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VERBS);
      if (!data) {
        this.saveVerbs(DEFAULT_IRREGULAR_VERBS);
        return DEFAULT_IRREGULAR_VERBS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_IRREGULAR_VERBS;
    }
  }

  public saveVerbs(verbs: IrregularVerb[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.VERBS, JSON.stringify(verbs));
    } catch (e) {
      console.error('Failed to save verbs', e);
    }
  }

  // --- STUDENT PROGRESS & GAMIFICATION ---
  public getProgress(): StudentProgress {
    if (typeof window === 'undefined') return INITIAL_PROGRESS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!data) {
        this.saveProgress(INITIAL_PROGRESS);
        return INITIAL_PROGRESS;
      }
      const progress: StudentProgress = JSON.parse(data);
      progress.reflections = progress.reflections || [];
      // Check and update streak
      return this.checkAndUpdateStreak(progress);
    } catch {
      return INITIAL_PROGRESS;
    }
  }

  private checkAndUpdateStreak(progress: StudentProgress): StudentProgress {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = progress.lastActiveDate;

    if (lastActive === today) {
      return progress;
    }

    const todayDate = new Date(today);
    const lastDate = new Date(lastActive);
    const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let updatedStreak = progress.streakDays;
    let newStars = progress.stars;

    if (diffDays === 1) {
      // Consecutive day!
      updatedStreak += 1;
      newStars += 2; // Daily streak bonus!
    } else if (diffDays > 1) {
      // Missed a day
      updatedStreak = 1;
    }

    const updated: StudentProgress = {
      ...progress,
      streakDays: updatedStreak,
      lastActiveDate: today,
      stars: newStars,
    };

    this.saveProgress(updated);
    return updated;
  }

  public saveProgress(progress: StudentProgress): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  }

  public addXpAndStars(xpToAdd: number, starsToAdd: number = 0): StudentProgress {
    const current = this.getProgress();
    const updated: StudentProgress = {
      ...current,
      xp: current.xp + xpToAdd,
      stars: current.stars + starsToAdd,
    };

    // Check automatic badge unlocking
    this.checkBadges(updated);
    this.saveProgress(updated);
    return updated;
  }

  public toggleFavorite(wordId: string): boolean {
    const current = this.getProgress();
    const isFav = current.favoriteWordIds.includes(wordId);
    let updatedFavs: string[];

    if (isFav) {
      updatedFavs = current.favoriteWordIds.filter(id => id !== wordId);
    } else {
      updatedFavs = [...current.favoriteWordIds, wordId];
    }

    const updated = { ...current, favoriteWordIds: updatedFavs };
    this.saveProgress(updated);
    return !isFav;
  }

  public setWordMastery(wordId: string, status: 'learning' | 'mastered'): StudentProgress {
    const current = this.getProgress();
    let learning = current.learningWordIds.filter(id => id !== wordId);
    let mastered = current.masteredWordIds.filter(id => id !== wordId);

    if (status === 'learning') {
      learning.push(wordId);
    } else {
      mastered.push(wordId);
      current.xp += 10;
      current.stars += 1;
    }

    const updated: StudentProgress = {
      ...current,
      learningWordIds: learning,
      masteredWordIds: mastered,
    };

    this.checkBadges(updated);
    this.saveProgress(updated);
    return updated;
  }

  public recordCompletedPassage(passageId: string): StudentProgress {
    const current = this.getProgress();
    if (!current.completedPassageIds.includes(passageId)) {
      current.completedPassageIds.push(passageId);
      current.xp += 25;
      current.stars += 3;
    }
    this.checkBadges(current);
    this.saveProgress(current);
    return current;
  }

  public recordGameScore(game: keyof StudentProgress['gameHighScores'], score: number): StudentProgress {
    const current = this.getProgress();
    if (score > (current.gameHighScores[game] || 0)) {
      current.gameHighScores[game] = score;
    }
    current.xp += Math.round(score / 2);
    this.checkBadges(current);
    this.saveProgress(current);
    return current;
  }

  public setActiveGrade(grade: GradeLevel): void {
    const current = this.getProgress();
    this.saveProgress({ ...current, activeGrade: grade });
  }

  public saveDailyReflection(reflection: DailyReflection): StudentProgress {
    const current = this.getProgress();
    const existingIdx = (current.reflections || []).findIndex(r => r.date === reflection.date);
    let updatedReflections = [...(current.reflections || [])];
    let isNewToday = false;

    if (existingIdx >= 0) {
      updatedReflections[existingIdx] = reflection;
    } else {
      updatedReflections.unshift(reflection);
      isNewToday = true;
    }

    const updated: StudentProgress = {
      ...current,
      reflections: updatedReflections,
      xp: isNewToday ? current.xp + 15 : current.xp,
      stars: isNewToday ? current.stars + 2 : current.stars,
    };

    this.checkBadges(updated);
    this.saveProgress(updated);
    return updated;
  }

  public getBadges(): Badge[] {
    const progress = this.getProgress();
    return DEFAULT_BADGES.map(b => ({
      ...b,
      isUnlocked: progress.unlockedBadgeIds.includes(b.id),
    }));
  }

  private checkBadges(progress: StudentProgress) {
    const unlocked = new Set(progress.unlockedBadgeIds);

    if (progress.masteredWordIds.length >= 5) {
      unlocked.add('b-pyramid-scholar');
    }
    if (progress.completedPassageIds.length >= 1) {
      unlocked.add('b-story-reader');
    }
    if (progress.gameHighScores.spellingBee >= 30) {
      unlocked.add('b-spelling-bee');
    }
    if (progress.gameHighScores.verbsDrill >= 20) {
      unlocked.add('b-verb-master');
    }
    if (progress.streakDays >= 2) {
      unlocked.add('b-streak-star');
    }
    if (progress.reflections && progress.reflections.length >= 1) {
      unlocked.add('b-daily-reflector');
    }

    progress.unlockedBadgeIds = Array.from(unlocked);
  }

  // --- TEACHER PIN ---
  public getTeacherPin(): string {
    if (typeof window === 'undefined') return '1234';
    return localStorage.getItem(STORAGE_KEYS.TEACHER_PIN) || '1234';
  }

  public setTeacherPin(pin: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TEACHER_PIN, pin);
  }

  // --- AUDIO SPEED PREFERENCE ---
  public getSlowAudio(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.SLOW_AUDIO) === 'true';
  }

  public setSlowAudio(slow: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SLOW_AUDIO, slow ? 'true' : 'false');
  }

  // --- RESET & IMPORT/EXPORT ---
  public resetToDefaults() {
    this.saveWords(DEFAULT_WORDS);
    this.savePassages(DEFAULT_READING_PASSAGES);
    this.saveVerbs(DEFAULT_IRREGULAR_VERBS);
  }

  public exportCurriculumJson(): string {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      words: this.getWords(),
      passages: this.getPassages(),
      verbs: this.getVerbs(),
    };
    return JSON.stringify(payload, null, 2);
  }

  public importCurriculumJson(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.words)) {
        this.saveWords(data.words);
      }
      if (Array.isArray(data.passages)) {
        this.savePassages(data.passages);
      }
      if (Array.isArray(data.verbs)) {
        this.saveVerbs(data.verbs);
      }
      return { success: true, message: `Successfully loaded ${data.words?.length || 0} words and ${data.passages?.length || 0} reading passages!` };
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Invalid JSON file';
      return { success: false, message: errorMsg };
    }
  }
}

export const storageService = new StorageService();
