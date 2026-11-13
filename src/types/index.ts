export type GradeLevel = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';

export type WordCategory =
  | 'School & Classroom'
  | 'Ancient Egypt & Heritage'
  | 'Animals & Nature'
  | 'Food & Egyptian Dishes'
  | 'Family & Friends'
  | 'Jobs & Community'
  | 'Places & Cities'
  | 'Feelings & Actions'
  | 'Science & Wonders'
  | 'Daily Routine & Time'
  | 'spellingbee2026/2027';

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition';

export interface WordItem {
  id: string;
  word: string; // English word
  phonetic: string; // e.g. /ˈpɪrəmɪd/
  partOfSpeech: PartOfSpeech;
  grade: GradeLevel;
  category: WordCategory;
  arabic: string; // Arabic with tashkeel, e.g. "هَرَمٌ"
  arabicPlural?: string; // e.g. "أَهْرَامَات"
  definitionEn: string;
  definitionAr: string;
  exampleEn: string;
  exampleAr: string;
  pronunciationTip?: string; // Egyptian student helpful tip
  iconName: string; // Semantic icon or visual badge identifier
  colorTheme?: string; // CSS color accent
  isCustom?: boolean;
}

export interface IrregularVerb {
  id: string;
  base: string; // V1 (Infinitive / Present)
  pastSimple: string; // V2
  pastParticiple: string; // V3
  arabic: string; // Meaning in Arabic with tashkeel
  grade: GradeLevel;
  exampleBase: string;
  examplePast: string;
}

export interface ReadingComprehensionQuestion {
  id: string;
  questionEn: string;
  questionAr: string;
  options: string[];
  correctIndex: number;
}

export interface ReadingPassage {
  id: string;
  titleEn: string;
  titleAr: string;
  grade: GradeLevel;
  category: WordCategory;
  readingLevel: string; // e.g. "Beginner", "Intermediate"
  summary: string;
  paragraphs: string[];
  vocabularyIds: string[]; // Key words highlighted in the story
  comprehensionQuestions: ReadingComprehensionQuestion[];
  isCustom?: boolean;
}

export interface DailyReflection {
  id: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  emoji: string;
  moodLabelEn: string;
  moodLabelAr: string;
  noteText?: string;
  voiceMemoUrl?: string; // base64 data URL for offline voice playback
  voiceDurationSeconds?: number;
}

export interface StudentProgress {
  xp: number;
  stars: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeGrade: GradeLevel;
  masteredWordIds: string[];
  learningWordIds: string[];
  favoriteWordIds: string[];
  completedPassageIds: string[];
  unlockedBadgeIds: string[];
  gameHighScores: {
    wordMatch: number;
    spellingBee: number;
    pictureQuiz: number;
    verbsDrill: number;
  };
  reflections: DailyReflection[];
}

export interface Badge {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  requirement: string;
  isUnlocked: boolean;
}

export type ActiveTab = 'dictionary' | 'reading' | 'games' | 'verbs' | 'progress' | 'teacher';
