import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle,
  Lightbulb,
  Repeat,
  RotateCw,
  Shuffle,
  Sparkles,
  Star,
  Volume2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { speechService } from '../../services/speechService';
import { WordItem } from '../../types';
import { IllustrationBadge } from '../common/IllustrationBadge';

interface FlashcardModeProps {
  words: WordItem[];
  favoriteWordIds: string[];
  masteredWordIds: string[];
  onToggleFavorite: (id: string) => void;
  onToggleMastered: (id: string) => void;
  onExit: () => void;
  isSlowAudio?: boolean;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  words,
  favoriteWordIds,
  masteredWordIds,
  onToggleFavorite,
  onToggleMastered,
  onExit,
  isSlowAudio = false,
}) => {
  const [deck, setDeck] = useState<WordItem[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyDirection, setStudyDirection] = useState<'en-to-ar' | 'ar-to-en'>('en-to-ar');
  const [autoSpeak, setAutoSpeak] = useState(true);

  // Sync deck when input words list changes
  useEffect(() => {
    setDeck(words);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [words]);

  const currentWord = deck[currentIndex];

  // Auto pronounce front card on index change if autoSpeak is on
  useEffect(() => {
    if (!currentWord || !autoSpeak) return;

    if (studyDirection === 'en-to-ar') {
      speechService.speakEnglish(currentWord.word, isSlowAudio);
    } else {
      speechService.speakArabic(currentWord.arabic, isSlowAudio);
    }
  }, [currentIndex, currentWord, studyDirection, autoSpeak, isSlowAudio]);

  // Flip card handler with sound effect and automatic revealed pronunciation
  const handleFlip = async () => {
    if (!currentWord) return;
    soundEffects.playFlip();
    const willBeFlipped = !isFlipped;
    setIsFlipped(willBeFlipped);

    // Audio trigger on flip
    if (autoSpeak) {
      if (studyDirection === 'en-to-ar') {
        if (willBeFlipped) {
          // Revealed Arabic side
          await speechService.speakArabic(currentWord.arabic, isSlowAudio);
        } else {
          // Flipped back to English
          await speechService.speakEnglish(currentWord.word, isSlowAudio);
        }
      } else {
        if (willBeFlipped) {
          // Revealed English side
          await speechService.speakEnglish(currentWord.word, isSlowAudio);
        } else {
          // Flipped back to Arabic
          await speechService.speakArabic(currentWord.arabic, isSlowAudio);
        }
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      soundEffects.playPop();
      setIsFlipped(false);
      setCurrentIndex((idx) => idx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      soundEffects.playPop();
      setIsFlipped(false);
      setCurrentIndex((idx) => idx - 1);
    }
  };

  const handleShuffle = () => {
    soundEffects.playFlip();
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMasterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentWord) return;

    const isMastered = masteredWordIds.includes(currentWord.id);
    if (!isMastered) {
      soundEffects.playSuccess();
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.7 },
        });
      } catch {}
    } else {
      soundEffects.playPop();
    }
    onToggleMastered(currentWord.id);
  };

  const handleSpeakEn = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    if (currentWord) speechService.speakEnglish(currentWord.word, isSlowAudio);
  };

  const handleSpeakAr = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    if (currentWord) speechService.speakArabic(currentWord.arabic, isSlowAudio);
  };

  const handleSpeakExample = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    if (currentWord) speechService.speakEnglish(currentWord.exampleEn, isSlowAudio);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!currentWord) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed border-amber-200">
        <p className="text-sm font-bold text-slate-600">No cards in this selection to study.</p>
        <button
          onClick={onExit}
          className="mt-3 px-4 py-2 rounded-2xl bg-blue-600 text-white font-bold text-xs"
        >
          Back to Grid View
        </button>
      </div>
    );
  }

  const isFavorite = favoriteWordIds.includes(currentWord.id);
  const isMastered = masteredWordIds.includes(currentWord.id);

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-12">
      {/* Top Header & Study Controls */}
      <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition tap-active"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Grid View / شبكة</span>
        </button>

        {/* Direction Switcher */}
        <button
          onClick={() => {
            soundEffects.playPop();
            setStudyDirection((prev) => (prev === 'en-to-ar' ? 'ar-to-en' : 'en-to-ar'));
            setIsFlipped(false);
          }}
          className="flex items-center gap-1 text-xs font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl border border-blue-200 transition tap-active"
          title="Toggle Front/Back Language Mode"
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>{studyDirection === 'en-to-ar' ? 'English ➔ Arabic' : 'العربية ➔ English'}</span>
        </button>

        {/* Shuffle Button */}
        <button
          onClick={handleShuffle}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition tap-active"
          title="Shuffle Cards"
        >
          <Shuffle className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>
            Card <strong className="text-slate-800">{currentIndex + 1}</strong> of{' '}
            <strong className="text-slate-800">{deck.length}</strong>
          </span>
          <span className="text-[11px] text-amber-700 font-semibold">
            {Math.round(((currentIndex + 1) / deck.length) * 100)}% Completed
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
          />
        </div>
      </div>

      {/* The 3D Interactive Flip Card */}
      <div
        className="perspective-1000 w-full cursor-pointer select-none"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label="Interactive flashcard. Tap to flip."
      >
        <div
          className={`relative w-full h-[390px] sm:h-[420px] rounded-3xl transition-transform duration-500 transform-style-3d shadow-md hover:shadow-xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ==================== FRONT OF CARD ==================== */}
          <div className="absolute inset-0 backface-hidden w-full h-full rounded-3xl p-6 bg-gradient-to-b from-white via-amber-50/20 to-white border-2 border-amber-300 flex flex-col justify-between">
            {/* Front Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded-lg bg-amber-500 text-white shadow-2xs">
                  {currentWord.grade}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
                  {currentWord.partOfSpeech}
                </span>
                {currentWord.category === 'spellingbee2026/2027' ? (
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                    🐝 Spelling Bee 2026/2027
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">{currentWord.category}</span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundEffects.playPop();
                  onToggleFavorite(currentWord.id);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl"
              >
                <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Front Body */}
            {studyDirection === 'en-to-ar' ? (
              // English Front
              <div className="flex flex-col items-center text-center my-auto">
                <div className="p-3.5 rounded-3xl bg-amber-50 border border-amber-200 shadow-xs mb-3">
                  <IllustrationBadge name={currentWord.iconName} size="lg" />
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 capitalize tracking-tight">
                    {currentWord.word}
                  </h3>
                  <button
                    onClick={handleSpeakEn}
                    className="p-2 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition tap-active"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm font-mono text-slate-500 mt-1">{currentWord.phonetic}</p>
                <p className="text-xs font-medium text-slate-500 mt-2 max-w-xs line-clamp-2">
                  {currentWord.definitionEn}
                </p>
              </div>
            ) : (
              // Arabic Front
              <div className="flex flex-col items-center text-center my-auto" dir="rtl">
                <div className="p-3.5 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-xs mb-3">
                  <IllustrationBadge name={currentWord.iconName} size="lg" />
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="font-arabic text-3xl sm:text-4xl font-black text-emerald-800 tracking-tight">
                    {currentWord.arabic}
                  </h3>
                  <button
                    onClick={handleSpeakAr}
                    className="p-2 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition tap-active"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {currentWord.arabicPlural && (
                  <p className="font-arabic text-sm text-emerald-600 font-bold mt-1">
                    (جَمْعٌ: {currentWord.arabicPlural})
                  </p>
                )}
                <p className="font-arabic text-xs font-medium text-slate-600 mt-2 max-w-xs line-clamp-2">
                  {currentWord.definitionAr}
                </p>
              </div>
            )}

            {/* Front Footer Tap Hint */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50/80 py-2 rounded-2xl border border-amber-200/80">
              <RotateCw className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
              <span>Tap card to reveal translation / اضغط للقلب</span>
            </div>
          </div>

          {/* ==================== BACK OF CARD (180deg) ==================== */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full rounded-3xl p-6 bg-gradient-to-b from-white via-emerald-50/25 to-white border-2 border-emerald-400 flex flex-col justify-between">
            {/* Back Header */}
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
                Translation & Meaning / المعنى
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleMasterClick}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition tap-active ${
                    isMastered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isMastered ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                  <span>{isMastered ? 'Mastered!' : 'Mark Mastered'}</span>
                </button>
              </div>
            </div>

            {/* Back Body */}
            {studyDirection === 'en-to-ar' ? (
              // Arabic Revealed Back
              <div className="flex flex-col items-center text-center my-auto" dir="rtl">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-arabic text-3xl sm:text-4xl font-black text-emerald-800">
                    {currentWord.arabic}
                  </h3>
                  <button
                    onClick={handleSpeakAr}
                    className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition tap-active"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {currentWord.arabicPlural && (
                  <span className="font-arabic text-xs font-bold text-emerald-600 mb-2">
                    (ج: {currentWord.arabicPlural})
                  </span>
                )}

                <div className="bg-slate-50/90 rounded-2xl p-2.5 border border-slate-200 w-full text-right mt-2">
                  <p className="font-arabic text-xs font-semibold text-slate-800">
                    {currentWord.definitionAr}
                  </p>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5 text-left" dir="ltr">
                    "{currentWord.definitionEn}"
                  </p>
                </div>

                {/* Example sentence */}
                <div className="bg-emerald-50/50 rounded-2xl p-2.5 border border-emerald-200/60 w-full mt-2 text-left" dir="ltr">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-emerald-950 italic">
                      "{currentWord.exampleEn}"
                    </p>
                    <button
                      onClick={handleSpeakExample}
                      className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-lg shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-arabic text-[11px] font-semibold text-emerald-800 mt-1 text-right" dir="rtl">
                    "{currentWord.exampleAr}"
                  </p>
                </div>

                {currentWord.pronunciationTip && (
                  <div className="flex items-center gap-1.5 bg-sky-50 rounded-xl p-1.5 border border-sky-100 w-full mt-2 text-[11px] text-sky-800 text-left" dir="ltr">
                    <Lightbulb className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="truncate">Tip: {currentWord.pronunciationTip}</span>
                  </div>
                )}
              </div>
            ) : (
              // English Revealed Back
              <div className="flex flex-col items-center text-center my-auto">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 capitalize">
                    {currentWord.word}
                  </h3>
                  <button
                    onClick={handleSpeakEn}
                    className="p-1.5 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition tap-active"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs font-mono text-slate-500 mb-2">{currentWord.phonetic}</p>

                <div className="bg-slate-50/90 rounded-2xl p-2.5 border border-slate-200 w-full text-left">
                  <p className="text-xs font-semibold text-slate-800">
                    {currentWord.definitionEn}
                  </p>
                  <p className="font-arabic text-[11px] text-slate-600 mt-0.5 text-right" dir="rtl">
                    {currentWord.definitionAr}
                  </p>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-2.5 border border-blue-200/60 w-full mt-2 text-left">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-blue-950 italic">
                      "{currentWord.exampleEn}"
                    </p>
                    <button
                      onClick={handleSpeakExample}
                      className="p-1 text-blue-700 hover:bg-blue-100 rounded-lg shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Back Footer Tap Hint */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50/80 py-2 rounded-2xl border border-emerald-200/80">
              <RotateCw className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
              <span>Tap to flip back / اضغط للعودة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls: Previous / Next Card */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 disabled:opacity-40 disabled:pointer-events-none text-slate-800 font-extrabold text-xs shadow-xs transition tap-active"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous / السابق</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === deck.length - 1}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none text-white font-extrabold text-xs shadow-md transition tap-active"
        >
          <span>Next / التالي</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
