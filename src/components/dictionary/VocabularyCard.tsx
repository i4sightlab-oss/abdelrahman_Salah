import confetti from 'canvas-confetti';
import { Bookmark, CheckCircle, Lightbulb, Star, Volume2 } from 'lucide-react';
import React, { useState } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { speechService } from '../../services/speechService';
import { WordItem } from '../../types';
import { IllustrationBadge } from '../common/IllustrationBadge';

interface VocabularyCardProps {
  word: WordItem;
  isFavorite: boolean;
  isMastered: boolean;
  onToggleFavorite: (wordId: string) => void;
  onToggleMastered: (wordId: string) => void;
  isSlowAudio?: boolean;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  word,
  isFavorite,
  isMastered,
  onToggleFavorite,
  onToggleMastered,
  isSlowAudio = false,
}) => {
  const [isPlayingEn, setIsPlayingEn] = useState(false);
  const [isPlayingAr, setIsPlayingAr] = useState(false);
  const [isPlayingSentence, setIsPlayingSentence] = useState(false);

  const handleSpeakEnglish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    setIsPlayingEn(true);
    await speechService.speakEnglish(word.word, isSlowAudio);
    setIsPlayingEn(false);
  };

  const handleSpeakArabic = async (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    setIsPlayingAr(true);
    await speechService.speakArabic(word.arabic, isSlowAudio);
    setIsPlayingAr(false);
  };

  const handleSpeakSentence = async (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    setIsPlayingSentence(true);
    await speechService.speakEnglish(word.exampleEn, isSlowAudio);
    setIsPlayingSentence(false);
  };

  const handleMasterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMastered) {
      soundEffects.playSuccess();
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
        });
      } catch {
        // Confetti silent fallback
      }
    } else {
      soundEffects.playPop();
    }
    onToggleMastered(word.id);
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    onToggleFavorite(word.id);
  };

  const partOfSpeechColors: Record<string, string> = {
    noun: 'bg-blue-100 text-blue-700 border-blue-200',
    verb: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    adjective: 'bg-amber-100 text-amber-800 border-amber-200',
    adverb: 'bg-purple-100 text-purple-700 border-purple-200',
    preposition: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <div
      className={`group relative rounded-3xl p-4 sm:p-5 transition-all duration-200 border-2 bg-white shadow-xs hover:shadow-md ${
        isMastered
          ? 'border-emerald-300 ring-2 ring-emerald-100/80 bg-gradient-to-b from-emerald-50/40 to-white'
          : 'border-amber-200/90 hover:border-amber-300'
      }`}
    >
      {/* Header Badges: Grade, Category, Part of Speech & Favorite Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-lg bg-amber-500 text-white shadow-2xs">
            {word.grade}
          </span>
          <span
            className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg border ${
              partOfSpeechColors[word.partOfSpeech] || 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {word.partOfSpeech}
          </span>
          {word.category === 'spellingbee2026/2027' ? (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
              🐝 Spelling Bee 2026/2027
            </span>
          ) : (
            <span className="text-[10px] font-medium text-slate-500 truncate max-w-[110px] sm:max-w-none">
              {word.category}
            </span>
          )}
        </div>

        {/* Favorite Bookmark Button */}
        <button
          onClick={handleFavClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-1.5 rounded-xl transition tap-active ${
            isFavorite
              ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
              : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50'
          }`}
        >
          <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Main Content: Illustration + Word + Arabic Translation */}
      <div className="flex items-start gap-3.5 mb-3">
        {/* Child-friendly illustration */}
        <div className="relative shrink-0 p-1 rounded-2xl bg-amber-50/80 border border-amber-200/60 shadow-2xs group-hover:scale-105 transition-transform">
          <IllustrationBadge name={word.iconName} size="md" />
        </div>

        {/* English Word & Arabic Meaning */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight leading-tight capitalize">
              {word.word}
            </h3>
            {/* English audio pronunciation button */}
            <button
              onClick={handleSpeakEnglish}
              aria-label={`Pronounce English word ${word.word}`}
              className={`p-1.5 rounded-xl transition tap-active shadow-2xs border ${
                isPlayingEn
                  ? 'bg-blue-600 text-white border-blue-600 scale-110'
                  : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isPlayingEn ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {/* Phonetic transcription */}
          <div className="text-xs font-mono text-slate-500 mt-0.5">
            {word.phonetic}
          </div>

          {/* Arabic with Tashkeel */}
          <div className="flex items-center gap-2 mt-2" dir="rtl">
            <span className="font-arabic font-extrabold text-lg sm:text-xl text-emerald-800 leading-snug">
              {word.arabic}
            </span>
            {word.arabicPlural && (
              <span className="font-arabic text-xs font-semibold text-emerald-600/90">
                (ج: {word.arabicPlural})
              </span>
            )}
            {/* Arabic audio pronunciation button */}
            <button
              onClick={handleSpeakArabic}
              aria-label={`Pronounce Arabic word ${word.arabic}`}
              className={`p-1 rounded-lg transition tap-active border ${
                isPlayingAr
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Child definition */}
      <div className="bg-slate-50/80 rounded-2xl p-2.5 mb-2.5 text-xs text-slate-700 border border-slate-100">
        <p className="font-medium">{word.definitionEn}</p>
        <p className="font-arabic text-slate-600 mt-1 text-right text-[11px] font-semibold">
          {word.definitionAr}
        </p>
      </div>

      {/* Example Sentence with audio */}
      <div className="bg-amber-50/40 rounded-2xl p-2.5 border border-amber-200/50 mb-3">
        <div className="flex items-start justify-between gap-1.5">
          <p className="text-xs font-semibold text-slate-800 italic leading-relaxed">
            "{word.exampleEn}"
          </p>
          <button
            onClick={handleSpeakSentence}
            aria-label="Listen to example sentence"
            className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition shrink-0"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlayingSentence ? 'text-amber-800 animate-pulse' : ''}`} />
          </button>
        </div>
        <p className="font-arabic text-[11px] font-medium text-amber-950 mt-1 text-right">
          "{word.exampleAr}"
        </p>
      </div>

      {/* Egyptian Pronunciation Tip (if available) */}
      {word.pronunciationTip && (
        <div className="flex items-start gap-1.5 bg-sky-50 rounded-xl p-2 border border-sky-100 mb-3 text-[11px] text-sky-800">
          <Lightbulb className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
          <p>
            <strong className="font-bold">Tip: </strong>
            {word.pronunciationTip}
          </p>
        </div>
      )}

      {/* Footer: Mastery Toggle */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <button
          onClick={handleMasterClick}
          className={`flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl transition tap-active ${
            isMastered
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
          }`}
        >
          {isMastered ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Mastered! / أَتْقَنْتُهَا</span>
            </>
          ) : (
            <>
              <Star className="w-4 h-4 text-amber-500" />
              <span>Mark as Mastered (+10 XP)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
