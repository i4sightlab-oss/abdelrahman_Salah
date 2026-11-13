import { Bookmark, CheckCircle, Star, Volume2, X } from 'lucide-react';
import React, { useState } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { speechService } from '../../services/speechService';
import { WordItem } from '../../types';
import { IllustrationBadge } from '../common/IllustrationBadge';

interface WordDetailModalProps {
  word: WordItem | null;
  onClose: () => void;
  isFavorite: boolean;
  isMastered: boolean;
  onToggleFavorite: (wordId: string) => void;
  onToggleMastered: (wordId: string) => void;
  isSlowAudio?: boolean;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  onClose,
  isFavorite,
  isMastered,
  onToggleFavorite,
  onToggleMastered,
  isSlowAudio = false,
}) => {
  if (!word) return null;

  const [isPlayingEn, setIsPlayingEn] = useState(false);
  const [isPlayingAr, setIsPlayingAr] = useState(false);

  const handleSpeakEnglish = async () => {
    soundEffects.playPop();
    setIsPlayingEn(true);
    await speechService.speakEnglish(word.word, isSlowAudio);
    setIsPlayingEn(false);
  };

  const handleSpeakArabic = async () => {
    soundEffects.playPop();
    setIsPlayingAr(true);
    await speechService.speakArabic(word.arabic, isSlowAudio);
    setIsPlayingAr(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-2 border-amber-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition tap-active"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Illustration & Badges */}
        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <div className="p-3 rounded-3xl bg-gradient-to-tr from-amber-100 via-yellow-50 to-amber-200 border-2 border-amber-300 shadow-md mb-3">
            <IllustrationBadge name={word.iconName} size="lg" />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase px-2 py-0.5 rounded-lg bg-amber-500 text-white">
              {word.grade}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
              {word.partOfSpeech}
            </span>
            {word.category === 'spellingbee2026/2027' ? (
              <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                🐝 Spelling Bee 2026/2027
              </span>
            ) : (
              <span className="text-xs text-slate-500">{word.category}</span>
            )}
          </div>

          {/* English Word & Audio */}
          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-3xl font-black text-slate-900 capitalize">
              {word.word}
            </h2>
            <button
              onClick={handleSpeakEnglish}
              aria-label="Speak English"
              className={`p-2 rounded-2xl border transition shadow-xs tap-active ${
                isPlayingEn
                  ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                  : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm font-mono text-slate-500 mt-0.5">{word.phonetic}</p>

          {/* Arabic with Tashkeel & Audio */}
          <div className="flex items-center gap-2 mt-3" dir="rtl">
            <span className="font-arabic font-black text-2xl text-emerald-800">
              {word.arabic}
            </span>
            {word.arabicPlural && (
              <span className="font-arabic text-sm font-bold text-emerald-600">
                (ج: {word.arabicPlural})
              </span>
            )}
            <button
              onClick={handleSpeakArabic}
              aria-label="Speak Arabic"
              className={`p-1.5 rounded-xl border transition shadow-xs tap-active ${
                isPlayingAr
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Child Definition */}
        <div className="bg-slate-50 rounded-2xl p-3.5 mb-3 border border-slate-200">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            Meaning / المعنى
          </p>
          <p className="text-sm font-semibold text-slate-800">{word.definitionEn}</p>
          <p className="font-arabic text-xs font-semibold text-slate-700 mt-1.5 text-right">
            {word.definitionAr}
          </p>
        </div>

        {/* Example Sentence */}
        <div className="bg-amber-50 rounded-2xl p-3.5 mb-4 border border-amber-200">
          <p className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">
            Example / مثال
          </p>
          <p className="text-xs font-bold text-slate-800 italic">
            "{word.exampleEn}"
          </p>
          <p className="font-arabic text-xs font-semibold text-amber-950 mt-1.5 text-right">
            "{word.exampleAr}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              soundEffects.playPop();
              onToggleFavorite(word.id);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl font-bold text-xs border transition tap-active ${
              isFavorite
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isFavorite ? 'Bookmarked' : 'Add to Favorites'}</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playSuccess();
              onToggleMastered(word.id);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl font-bold text-xs border transition tap-active ${
              isMastered
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isMastered ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Mastered!</span>
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                <span>Mark Mastered (+10 XP)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
