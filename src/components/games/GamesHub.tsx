import { Gamepad2, Puzzle, Sparkles, Trophy, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { WordItem } from '../../types';
import { PictureQuizGame } from './PictureQuizGame';
import { SpellingBeeGame } from './SpellingBeeGame';
import { WordMatchGame } from './WordMatchGame';

interface GamesHubProps {
  words: WordItem[];
  highScores: {
    wordMatch: number;
    spellingBee: number;
    pictureQuiz: number;
  };
  onUpdateHighScore: (game: 'wordMatch' | 'spellingBee' | 'pictureQuiz', score: number) => void;
  isSlowAudio?: boolean;
}

type ActiveGame = 'none' | 'wordMatch' | 'spellingBee' | 'pictureQuiz';

export const GamesHub: React.FC<GamesHubProps> = ({
  words,
  highScores,
  onUpdateHighScore,
  isSlowAudio = false,
}) => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('none');

  if (activeGame === 'wordMatch') {
    return (
      <WordMatchGame
        words={words}
        onBack={() => setActiveGame('none')}
        onGameComplete={(score) => onUpdateHighScore('wordMatch', score)}
        isSlowAudio={isSlowAudio}
      />
    );
  }

  if (activeGame === 'spellingBee') {
    return (
      <SpellingBeeGame
        words={words}
        onBack={() => setActiveGame('none')}
        onGameComplete={(score) => onUpdateHighScore('spellingBee', score)}
        isSlowAudio={isSlowAudio}
      />
    );
  }

  if (activeGame === 'pictureQuiz') {
    return (
      <PictureQuizGame
        words={words}
        onBack={() => setActiveGame('none')}
        onGameComplete={(score) => onUpdateHighScore('pictureQuiz', score)}
        isSlowAudio={isSlowAudio}
      />
    );
  }

  const gameList = [
    {
      id: 'wordMatch' as const,
      titleEn: 'Word Match',
      titleAr: 'مطابقة الكلمات',
      descriptionEn: 'Tap English and Arabic card pairs to clear the board before the round ends!',
      descriptionAr: 'طابق بطاقات الكلمات الإنجليزية مع معناها بالعربية بأسرع وقت!',
      icon: '🧩',
      color: 'from-blue-500 to-indigo-600',
      badge: 'Speed & Memory',
      highScore: highScores.wordMatch,
    },
    {
      id: 'spellingBee' as const,
      titleEn: 'Spelling Bee',
      titleAr: 'بناء الكلمة والتهجئة',
      descriptionEn: 'Listen to the audio pronunciation and tap letter bubbles in correct order!',
      descriptionAr: 'استمع للنطق الصوتي ورتّب فقاعات الحروف لتهجئة الكلمة الصحيحة!',
      icon: '🐝',
      color: 'from-amber-400 to-orange-500',
      badge: 'Listening & Spelling',
      highScore: highScores.spellingBee,
    },
    {
      id: 'pictureQuiz' as const,
      titleEn: 'Picture Quiz',
      titleAr: 'خَمِّنِ الصورة',
      descriptionEn: 'Look at the illustrated card and clue, and pick the matching vocabulary word!',
      descriptionAr: 'شاهد الرسم التوضيحي للكلمة واختر الإجابة الصحيحة من بين الخيارات!',
      icon: '🎯',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Visual Quiz',
      highScore: highScores.pictureQuiz,
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-5 sm:p-6 text-white shadow-md">
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold mb-2">
          <Gamepad2 className="w-4 h-4 text-amber-300" />
          <span>Interactive Learning Arena</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Play Games, Win Stars & Level Up!
        </h2>
        <p className="text-xs sm:text-sm text-purple-100 font-arabic mt-1">
          ألعاب تفاعلية ممتعة لتعزيز حصيلتك اللغوية واختبار مهارات الحفظ والتهجئة بالإنجليزية.
        </p>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gameList.map((game) => (
          <div
            key={game.id}
            onClick={() => {
              soundEffects.playPop();
              setActiveGame(game.id);
            }}
            className="group relative rounded-3xl bg-white border-2 border-amber-200/80 p-5 shadow-xs hover:shadow-lg hover:border-amber-400 transition-all cursor-pointer tap-active flex flex-col justify-between"
          >
            <div>
              {/* Header Icon + High Score */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} text-white flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 transition-transform`}>
                  {game.icon}
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Best: {game.highScore}</span>
                </div>
              </div>

              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                {game.badge}
              </span>

              <h3 className="text-lg font-black text-slate-900 mt-2">
                {game.titleEn}
              </h3>
              <h4 className="font-arabic font-extrabold text-sm text-emerald-800">
                {game.titleAr}
              </h4>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {game.descriptionEn}
              </p>
              <p className="font-arabic text-[11px] text-slate-500 mt-1" dir="rtl">
                {game.descriptionAr}
              </p>
            </div>

            {/* Play Button */}
            <div className="mt-5 pt-3 border-t border-slate-100">
              <button className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-xs group-hover:brightness-110 transition flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Play Now / ابدأ اللعب</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
