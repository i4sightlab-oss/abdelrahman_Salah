import confetti from 'canvas-confetti';
import { ArrowLeft, Check, Delete, HelpCircle, RotateCcw, Trophy, Volume2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { speechService } from '../../services/speechService';
import { WordItem } from '../../types';
import { IllustrationBadge } from '../common/IllustrationBadge';

interface SpellingBeeGameProps {
  words: WordItem[];
  onBack: () => void;
  onGameComplete: (score: number) => void;
  isSlowAudio?: boolean;
}

export const SpellingBeeGame: React.FC<SpellingBeeGameProps> = ({
  words,
  onBack,
  onGameComplete,
  isSlowAudio = false,
}) => {
  const [gameWords, setGameWords] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [scrambledLetters, setScrambledLetters] = useState<{ id: number; char: string; used: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [isWordCorrect, setIsWordCorrect] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const hasBeeWords = words.some((w) => w.category === 'spellingbee2026/2027');
  const [useBeeWords, setUseBeeWords] = useState(hasBeeWords);

  // Pick 5 single-word vocab items (filter out items with spaces or hyphens)
  useEffect(() => {
    let pool = words;
    if (useBeeWords) {
      const beeWords = words.filter((w) => w.category === 'spellingbee2026/2027');
      if (beeWords.length > 0) {
        pool = beeWords;
      }
    }
    const singleWords = pool.filter((w) => !w.word.includes(' ') && !w.word.includes('-'));
    const chosen = [...singleWords].sort(() => 0.5 - Math.random()).slice(0, 5);
    setGameWords(chosen);
    setCurrentIndex(0);
    setScore(0);
    setIsGameOver(false);
  }, [words, useBeeWords]);

  const currentWord = gameWords[currentIndex];

  // Prepare scrambled letters when current word changes
  useEffect(() => {
    if (!currentWord) return;

    setSelectedLetters([]);
    setIsWordCorrect(false);

    const chars = currentWord.word.toUpperCase().split('');
    const lettersWithId = chars.map((char, id) => ({ id, char, used: false }));
    // Shuffle
    const shuffled = [...lettersWithId].sort(() => 0.5 - Math.random());
    setScrambledLetters(shuffled);

    // Speak word on load
    speechService.speakEnglish(currentWord.word, isSlowAudio);
  }, [currentWord, currentIndex, isSlowAudio]);

  const handleLetterClick = (item: { id: number; char: string; used: boolean }) => {
    if (item.used || isWordCorrect) return;
    soundEffects.playPop();

    // Mark as used
    setScrambledLetters((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, used: true } : l))
    );

    const updated = [...selectedLetters, item.char];
    setSelectedLetters(updated);

    // Check if fully spelled
    const targetWord = currentWord.word.toUpperCase();
    if (updated.length === targetWord.length) {
      if (updated.join('') === targetWord) {
        // Correct!
        soundEffects.playSuccess();
        setIsWordCorrect(true);
        setScore((s) => s + 10);

        try {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.6 },
          });
        } catch {}

        setTimeout(() => {
          if (currentIndex + 1 < gameWords.length) {
            setCurrentIndex((idx) => idx + 1);
          } else {
            soundEffects.playFanfare();
            setIsGameOver(true);
            onGameComplete(score + 10);
          }
        }, 1200);
      } else {
        // Incorrect
        soundEffects.playTryAgain();
      }
    }
  };

  const handleRemoveLetter = () => {
    if (selectedLetters.length === 0 || isWordCorrect) return;
    soundEffects.playPop();

    const lastChar = selectedLetters[selectedLetters.length - 1];
    setSelectedLetters((prev) => prev.slice(0, -1));

    // Free the letter back in scrambled pool
    const foundIdx = scrambledLetters.findIndex((l) => l.used && l.char === lastChar);
    if (foundIdx !== -1) {
      const updated = [...scrambledLetters];
      updated[foundIdx].used = false;
      setScrambledLetters(updated);
    }
  };

  const handleGiveHint = () => {
    if (!currentWord || isWordCorrect) return;
    soundEffects.playFlip();

    const target = currentWord.word.toUpperCase().split('');
    const nextIdx = selectedLetters.length;
    if (nextIdx >= target.length) return;

    const neededChar = target[nextIdx];

    // Find in scrambled letters
    const available = scrambledLetters.find((l) => !l.used && l.char === neededChar);
    if (available) {
      handleLetterClick(available);
    }
  };

  const handlePlayAudio = () => {
    if (currentWord) {
      soundEffects.playPop();
      speechService.speakEnglish(currentWord.word, isSlowAudio);
    }
  };

  return (
    <div className="rounded-3xl bg-white border-2 border-amber-200 p-5 sm:p-7 shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-amber-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl transition tap-active"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">
            Word {currentIndex + 1} / {gameWords.length || 5}
          </span>
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 text-xs font-extrabold">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Score: {score}</span>
          </div>
        </div>
      </div>

      {!isGameOver && currentWord ? (
        <div className="max-w-md mx-auto text-center space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Spelling Bee / بناء الكلمة
            </h2>
            <p className="text-xs text-slate-500 font-arabic mt-1">
              استمع للنطق ورتّب الحروف المبعثرة لتهجئة الكلمة الصحيحة!
            </p>

            {hasBeeWords && (
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseBeeWords(!useBeeWords)}
                  className={`px-3 py-1 rounded-full text-[11px] font-black transition tap-active border ${
                    useBeeWords
                      ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-2xs'
                      : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {useBeeWords
                    ? '🐝 Official 2026/2027 Mode: Active'
                    : 'Switch to 🐝 2026/2027 Mode'}
                </button>
              </div>
            )}
          </div>

          {/* Visual Illustration & Audio Trigger */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-3xl bg-amber-50 border-2 border-amber-200 shadow-2xs mb-2">
              <IllustrationBadge name={currentWord.iconName} size="lg" />
            </div>

            <button
              onClick={handlePlayAudio}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-2xl shadow-xs transition tap-active"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen Again (صوت)</span>
            </button>

            {/* Arabic Clue */}
            <div className="mt-2 font-arabic font-black text-xl text-emerald-800" dir="rtl">
              {currentWord.arabic}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentWord.definitionEn}</p>
            {currentWord.category === 'spellingbee2026/2027' && (
              <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                🐝 Official 2026/2027 Competition Word ({currentWord.grade})
              </span>
            )}
          </div>

          {/* Target Word Slots */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 min-h-[56px] flex-wrap">
            {currentWord.word.split('').map((_, idx) => {
              const char = selectedLetters[idx];
              const isFilled = char !== undefined;

              return (
                <div
                  key={idx}
                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-2xl border-2 flex items-center justify-center text-lg sm:text-xl font-black transition-all shadow-2xs ${
                    isWordCorrect
                      ? 'bg-emerald-500 text-white border-emerald-600 scale-105'
                      : isFilled
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-slate-100 border-slate-300 border-dashed text-transparent'
                  }`}
                >
                  {char || ''}
                </div>
              );
            })}
          </div>

          {/* Scrambled Bubble Tiles */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {scrambledLetters.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLetterClick(item)}
                disabled={item.used || isWordCorrect}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border-2 font-black text-lg transition-all tap-active flex items-center justify-center shadow-xs ${
                  item.used
                    ? 'opacity-20 bg-slate-200 border-slate-300 pointer-events-none'
                    : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200 hover:scale-105'
                }`}
              >
                {item.char}
              </button>
            ))}
          </div>

          {/* Action Buttons: Delete last / Hint */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={handleRemoveLetter}
              disabled={selectedLetters.length === 0 || isWordCorrect}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition tap-active"
            >
              <Delete className="w-4 h-4" />
              <span>Delete / حذف</span>
            </button>

            <button
              onClick={handleGiveHint}
              disabled={isWordCorrect}
              className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs px-3.5 py-2 rounded-xl transition tap-active"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Hint (تلميح)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Completed Screen */
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl shadow-inner animate-bounce">
            🌟
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Spelling Champion!
          </h2>
          <p className="text-sm font-arabic text-emerald-700 font-bold mt-1 mb-2">
            ممتاز جداً! أتقنت تهجئة كل الكلمات بمهارة فائقة!
          </p>
          <p className="text-lg font-extrabold text-amber-700 bg-amber-50 inline-block px-4 py-1.5 rounded-2xl border border-amber-200 mb-6">
            Score: {score} XP
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                const singleWords = words.filter((w) => !w.word.includes(' '));
                setGameWords([...singleWords].sort(() => 0.5 - Math.random()).slice(0, 5));
                setCurrentIndex(0);
                setScore(0);
                setIsGameOver(false);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition tap-active"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Words / كلمات جديدة</span>
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition tap-active"
            >
              Back to Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
