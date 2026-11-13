import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Volume2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { speechService } from '../../services/speechService';
import { WordItem } from '../../types';

interface WordMatchGameProps {
  words: WordItem[];
  onBack: () => void;
  onGameComplete: (score: number) => void;
  isSlowAudio?: boolean;
}

interface Tile {
  id: string;
  wordId: string;
  text: string;
  type: 'en' | 'ar';
}

export const WordMatchGame: React.FC<WordMatchGameProps> = ({
  words,
  onBack,
  onGameComplete,
  isSlowAudio = false,
}) => {
  const [tilesEn, setTilesEn] = useState<Tile[]>([]);
  const [tilesAr, setTilesAr] = useState<Tile[]>([]);
  const [selectedEn, setSelectedEn] = useState<Tile | null>(null);
  const [selectedAr, setSelectedAr] = useState<Tile | null>(null);
  const [matchedWordIds, setMatchedWordIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ enId: string; arId: string } | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  // Initialize a round with 5 randomized pairs
  const startRound = () => {
    setSelectedEn(null);
    setSelectedAr(null);
    setWrongPair(null);

    // Pick 5 random words
    const shuffledWords = [...words].sort(() => 0.5 - Math.random()).slice(0, 5);

    const enList: Tile[] = shuffledWords.map((w) => ({
      id: `en-${w.id}`,
      wordId: w.id,
      text: w.word,
      type: 'en',
    }));

    const arList: Tile[] = shuffledWords.map((w) => ({
      id: `ar-${w.id}`,
      wordId: w.id,
      text: w.arabic,
      type: 'ar',
    }));

    // Shuffle arrays independently
    setTilesEn(enList.sort(() => 0.5 - Math.random()));
    setTilesAr(arList.sort(() => 0.5 - Math.random()));
    setMatchedWordIds([]);
  };

  useEffect(() => {
    startRound();
  }, [round, words]);

  const handleTileClick = async (tile: Tile) => {
    soundEffects.playPop();

    if (tile.type === 'en') {
      await speechService.speakEnglish(tile.text, isSlowAudio);
      setSelectedEn(tile);

      if (selectedAr) {
        checkMatch(tile, selectedAr);
      }
    } else {
      await speechService.speakArabic(tile.text, isSlowAudio);
      setSelectedAr(tile);

      if (selectedEn) {
        checkMatch(selectedEn, tile);
      }
    }
  };

  const checkMatch = (enTile: Tile, arTile: Tile) => {
    if (enTile.wordId === arTile.wordId) {
      // Correct Match!
      soundEffects.playSuccess();
      const updated = [...matchedWordIds, enTile.wordId];
      setMatchedWordIds(updated);
      setSelectedEn(null);
      setSelectedAr(null);
      setScore((s) => s + 10);

      // Check if round completed
      if (updated.length === tilesEn.length) {
        soundEffects.playFanfare();
        try {
          confetti({
            particleCount: 40,
            spread: 55,
            origin: { y: 0.6 },
          });
        } catch {}

        if (round < 3) {
          setTimeout(() => {
            setRound((r) => r + 1);
          }, 1000);
        } else {
          setIsGameOver(true);
          onGameComplete(score + 10);
        }
      }
    } else {
      // Wrong Match
      soundEffects.playTryAgain();
      setWrongPair({ enId: enTile.id, arId: arTile.id });
      setTimeout(() => {
        setSelectedEn(null);
        setSelectedAr(null);
        setWrongPair(null);
      }, 700);
    }
  };

  const restartGame = () => {
    setScore(0);
    setRound(1);
    setIsGameOver(false);
    startRound();
  };

  return (
    <div className="rounded-3xl bg-white border-2 border-amber-200 p-5 sm:p-7 shadow-sm">
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
            Round {round} / 3
          </span>
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 text-xs font-extrabold">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Score: {score}</span>
          </div>
        </div>
      </div>

      {!isGameOver ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Word Match / مطابقة الكلمات
            </h2>
            <p className="text-xs text-slate-500 font-arabic mt-1">
              المس الكلمة بالإنجليزية ثم المس معناها بالعربية لتطابقهما معاً!
            </p>
          </div>

          {/* Dual Column Matching Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-xl mx-auto">
            {/* English Column */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase text-center tracking-wider">
                English
              </p>
              {tilesEn.map((tile) => {
                const isMatched = matchedWordIds.includes(tile.wordId);
                const isSelected = selectedEn?.id === tile.id;
                const isWrong = wrongPair?.enId === tile.id;

                let style = 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-blue-50 hover:border-blue-300';
                if (isMatched) {
                  style = 'bg-emerald-50 text-emerald-800 border-emerald-300 opacity-40 pointer-events-none';
                } else if (isWrong) {
                  style = 'bg-rose-100 text-rose-800 border-rose-300 animate-wiggle';
                } else if (isSelected) {
                  style = 'bg-blue-600 text-white border-blue-600 shadow-md scale-102';
                }

                return (
                  <button
                    key={tile.id}
                    onClick={() => handleTileClick(tile)}
                    disabled={isMatched}
                    className={`w-full py-3.5 px-3 rounded-2xl border-2 text-sm sm:text-base font-extrabold capitalize transition-all tap-active flex items-center justify-between ${style}`}
                  >
                    <span>{tile.text}</span>
                    <Volume2 className="w-4 h-4 opacity-70 shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Arabic Column */}
            <div className="space-y-3" dir="rtl">
              <p className="text-xs font-bold text-slate-400 uppercase text-center tracking-wider font-arabic">
                العربية
              </p>
              {tilesAr.map((tile) => {
                const isMatched = matchedWordIds.includes(tile.wordId);
                const isSelected = selectedAr?.id === tile.id;
                const isWrong = wrongPair?.arId === tile.id;

                let style = 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300';
                if (isMatched) {
                  style = 'bg-emerald-50 text-emerald-800 border-emerald-300 opacity-40 pointer-events-none';
                } else if (isWrong) {
                  style = 'bg-rose-100 text-rose-800 border-rose-300 animate-wiggle';
                } else if (isSelected) {
                  style = 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102';
                }

                return (
                  <button
                    key={tile.id}
                    onClick={() => handleTileClick(tile)}
                    disabled={isMatched}
                    className={`w-full py-3.5 px-3 rounded-2xl border-2 text-sm sm:text-base font-arabic font-extrabold transition-all tap-active flex items-center justify-between ${style}`}
                  >
                    <span>{tile.text}</span>
                    <Volume2 className="w-4 h-4 opacity-70 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Game Over Celebratory Screen */
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-amber-100 text-amber-500 flex items-center justify-center text-4xl shadow-inner animate-bounce">
            🏆
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Awesome Job, Star Explorer!
          </h2>
          <p className="text-sm font-arabic text-emerald-700 font-bold mt-1 mb-2">
            أحسنت! أتممت جولات مطابقة الكلمات بنجاح باهر!
          </p>
          <p className="text-lg font-extrabold text-amber-700 bg-amber-50 inline-block px-4 py-1.5 rounded-2xl border border-amber-200 mb-6">
            Final Score: {score} Stars
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={restartGame}
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
