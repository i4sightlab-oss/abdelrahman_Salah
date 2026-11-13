import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy, Volume2, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { speechService } from '../../services/speechService';
import { WordItem } from '../../types';
import { IllustrationBadge } from '../common/IllustrationBadge';

interface PictureQuizGameProps {
  words: WordItem[];
  onBack: () => void;
  onGameComplete: (score: number) => void;
  isSlowAudio?: boolean;
}

interface QuizRound {
  target: WordItem;
  options: WordItem[];
}

export const PictureQuizGame: React.FC<PictureQuizGameProps> = ({
  words,
  onBack,
  onGameComplete,
  isSlowAudio = false,
}) => {
  const [rounds, setRounds] = useState<QuizRound[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Generate 5 rounds with 4 options each
  useEffect(() => {
    if (words.length < 4) return;

    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const generated: QuizRound[] = [];

    const numRounds = Math.min(5, shuffled.length);
    for (let i = 0; i < numRounds; i++) {
      const target = shuffled[i];
      // Pick 3 distractors
      const distractors = words
        .filter((w) => w.id !== target.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [target, ...distractors].sort(() => 0.5 - Math.random());
      generated.push({ target, options });
    }

    setRounds(generated);
    setCurrentRoundIdx(0);
    setScore(0);
    setIsGameOver(false);
  }, [words]);

  const currentRound = rounds[currentRoundIdx];

  const handleSelectOption = async (option: WordItem) => {
    if (isAnswerChecked || !currentRound) return;

    soundEffects.playPop();
    setSelectedWordId(option.id);
    setIsAnswerChecked(true);

    const isCorrect = option.id === currentRound.target.id;
    if (isCorrect) {
      soundEffects.playSuccess();
      setScore((s) => s + 10);
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.7 },
        });
      } catch {}
    } else {
      soundEffects.playTryAgain();
    }

    // Pronounce the selected word
    await speechService.speakEnglish(option.word, isSlowAudio);

    // Advance after delay
    setTimeout(() => {
      if (currentRoundIdx + 1 < rounds.length) {
        setCurrentRoundIdx((idx) => idx + 1);
        setSelectedWordId(null);
        setIsAnswerChecked(false);
      } else {
        soundEffects.playFanfare();
        setIsGameOver(true);
        onGameComplete(score + (isCorrect ? 10 : 0));
      }
    }, 1400);
  };

  const handleTargetAudio = () => {
    if (currentRound) {
      soundEffects.playPop();
      speechService.speakEnglish(currentRound.target.word, isSlowAudio);
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
            Question {currentRoundIdx + 1} / {rounds.length || 5}
          </span>
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 text-xs font-extrabold">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Score: {score}</span>
          </div>
        </div>
      </div>

      {!isGameOver && currentRound ? (
        <div className="max-w-lg mx-auto text-center space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Picture Quiz / خَمِّنِ الْكَلِمَةَ
            </h2>
            <p className="text-xs text-slate-500 font-arabic mt-1">
              انظر إلى الصورة والوصف، ثم اختر الكلمة الإنجليزية المطابقة!
            </p>
          </div>

          {/* Central Target Display */}
          <div className="bg-amber-50/70 border-2 border-amber-200 rounded-3xl p-5 flex flex-col items-center">
            <div className="p-3 rounded-2xl bg-white border border-amber-200 shadow-2xs mb-3">
              <IllustrationBadge name={currentRound.target.iconName} size="lg" />
            </div>

            <div className="font-arabic font-black text-2xl text-emerald-800" dir="rtl">
              {currentRound.target.arabic}
            </div>

            <p className="text-xs font-medium text-slate-600 mt-1 max-w-sm">
              "{currentRound.target.definitionEn}"
            </p>

            <button
              onClick={handleTargetAudio}
              className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition tap-active"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Hear Audio Clue (اسمع تلميحاً)</span>
            </button>
          </div>

          {/* 4 Choice Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentRound.options.map((opt) => {
              const isSelected = selectedWordId === opt.id;
              const isTarget = opt.id === currentRound.target.id;

              let style = 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-blue-50 hover:border-blue-300';

              if (isAnswerChecked) {
                if (isTarget) {
                  style = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black ring-2 ring-emerald-300';
                } else if (isSelected && !isTarget) {
                  style = 'bg-rose-100 text-rose-900 border-rose-300 line-through';
                } else {
                  style = 'opacity-40 bg-slate-50 text-slate-500 border-slate-200';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswerChecked}
                  className={`p-4 rounded-2xl border-2 text-left transition-all tap-active flex items-center justify-between ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <IllustrationBadge name={opt.iconName} size="sm" />
                    <div>
                      <div className="font-extrabold text-base capitalize leading-tight">
                        {opt.word}
                      </div>
                      <div className="font-arabic text-xs font-semibold text-slate-500 mt-0.5" dir="rtl">
                        {opt.arabic}
                      </div>
                    </div>
                  </div>

                  {isAnswerChecked && isTarget && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerChecked && isSelected && !isTarget && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Game Over Screen */
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-amber-100 text-amber-500 flex items-center justify-center text-4xl shadow-inner animate-bounce">
            🎯
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Quiz Completed!
          </h2>
          <p className="text-sm font-arabic text-emerald-700 font-bold mt-1 mb-2">
            رائع جداً! استطعت تخمين الكلمات المصورة ببراعة!
          </p>
          <p className="text-lg font-extrabold text-amber-700 bg-amber-50 inline-block px-4 py-1.5 rounded-2xl border border-amber-200 mb-6">
            Score: {score} XP
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                const shuffled = [...words].sort(() => 0.5 - Math.random());
                const generated: QuizRound[] = [];
                for (let i = 0; i < Math.min(5, shuffled.length); i++) {
                  const target = shuffled[i];
                  const distractors = words.filter((w) => w.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
                  generated.push({ target, options: [target, ...distractors].sort(() => 0.5 - Math.random()) });
                }
                setRounds(generated);
                setCurrentRoundIdx(0);
                setScore(0);
                setIsGameOver(false);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition tap-active"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again / العب ثانية</span>
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
