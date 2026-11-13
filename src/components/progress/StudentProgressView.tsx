import { Award, Bookmark, CheckCircle, Flame, Lock, Sparkles, Star, Trophy, Volume2 } from 'lucide-react';
import React from 'react';
import { soundEffects } from '../../services/soundEffects';
import { speechService } from '../../services/speechService';
import { Badge, DailyReflection, GradeLevel, StudentProgress, WordItem } from '../../types';
import { DailyReflectionCard } from './DailyReflectionCard';

interface StudentProgressViewProps {
  progress: StudentProgress;
  badges: Badge[];
  allWords: WordItem[];
  activeGrade: GradeLevel;
  onGradeChange: (g: GradeLevel) => void;
  onToggleFavorite: (id: string) => void;
  onSaveReflection: (reflection: DailyReflection) => void;
  isSlowAudio?: boolean;
}

export const StudentProgressView: React.FC<StudentProgressViewProps> = ({
  progress,
  badges,
  allWords,
  activeGrade,
  onGradeChange,
  onToggleFavorite,
  onSaveReflection,
  isSlowAudio = false,
}) => {
  const favoriteWords = allWords.filter((w) => progress.favoriteWordIds.includes(w.id));
  const masteredCount = progress.masteredWordIds.length;
  const gradeWordsCount = allWords.filter((w) => w.grade === activeGrade).length;

  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    speechService.speakEnglish(text, isSlowAudio);
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Profile Header Card */}
      <div className="rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-500 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30">
              🦁
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-2xl font-black tracking-tight">
                  Young Scholar / البطل الصغير
                </h2>
              </div>
              <p className="text-xs text-amber-100 font-arabic font-semibold mt-0.5">
                تعلّم الإنجليزية خطوة بخطوة في المنهج المصري
              </p>
            </div>
          </div>

          {/* Quick Badges in Header */}
          <div className="flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-xs px-3 py-1.5 rounded-2xl border border-white/30 flex items-center gap-1.5 text-xs font-black">
              <Flame className="w-4 h-4 text-yellow-200 fill-yellow-200" />
              <span>{progress.streakDays} Days Streak</span>
            </div>
            <div className="bg-white/20 backdrop-blur-xs px-3 py-1.5 rounded-2xl border border-white/30 flex items-center gap-1.5 text-xs font-black">
              <Star className="w-4 h-4 text-yellow-200 fill-yellow-200" />
              <span>{progress.stars} Stars</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          <div className="bg-black/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-amber-100 font-bold block uppercase tracking-wider">
              Total XP
            </span>
            <span className="text-2xl font-black">{progress.xp}</span>
          </div>

          <div className="bg-black/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-amber-100 font-bold block uppercase tracking-wider">
              Words Mastered
            </span>
            <span className="text-2xl font-black">{masteredCount}</span>
          </div>

          <div className="bg-black/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-amber-100 font-bold block uppercase tracking-wider">
              Stories Read
            </span>
            <span className="text-2xl font-black">{progress.completedPassageIds.length}</span>
          </div>

          <div className="bg-black/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-amber-100 font-bold block uppercase tracking-wider">
              Badges Won
            </span>
            <span className="text-2xl font-black">
              {badges.filter((b) => b.isUnlocked).length} / {badges.length}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Reflection Section */}
      <DailyReflectionCard
        reflections={progress.reflections || []}
        onSaveReflection={onSaveReflection}
      />

      {/* Badges / Achievements Gallery */}
      <div className="rounded-3xl bg-white border-2 border-amber-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Badges & Achievements / أوسمة وإنجازات
            </h3>
            <p className="text-xs text-slate-500 font-arabic">
              اجمع كل الأوسمة من خلال حفظ الكلمات وقراءة القصص وحل الألعاب!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl p-3.5 border-2 transition-all flex items-start gap-3 ${
                b.isUnlocked
                  ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  b.isUnlocked
                    ? 'bg-amber-400 text-amber-950 shadow-2xs'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {b.isUnlocked ? '🏅' : <Lock className="w-5 h-5 text-slate-400" />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                    {b.nameEn}
                  </h4>
                  {b.isUnlocked && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="font-arabic text-[11px] font-bold text-emerald-800 leading-tight mt-0.5">
                  {b.nameAr}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                  {b.descriptionEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved / Bookmarked Words Notebook */}
      <div className="rounded-3xl bg-white border-2 border-rose-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Bookmark className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                My Saved Vocabulary / كَلِمَاتِي الْمَحْفُوظَةُ
              </h3>
              <p className="text-xs text-slate-500">
                {favoriteWords.length} words saved for offline review
              </p>
            </div>
          </div>
        </div>

        {favoriteWords.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {favoriteWords.map((w) => (
              <div
                key={w.id}
                className="rounded-2xl border border-slate-200 p-3 bg-slate-50/60 hover:bg-white transition flex items-center justify-between gap-2 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm capitalize text-slate-900">
                      {w.word}
                    </span>
                    <button
                      onClick={(e) => handleSpeak(w.word, e)}
                      className="p-1 rounded-md text-blue-600 hover:bg-blue-50"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="font-arabic font-bold text-xs text-emerald-800 mt-0.5" dir="rtl">
                    {w.arabic}
                  </div>
                </div>

                <button
                  onClick={() => onToggleFavorite(w.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                  title="Remove from favorites"
                >
                  <Bookmark className="w-4 h-4 fill-rose-500" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">
            <p className="text-xs">
              No saved words yet. Tap the bookmark icon on any dictionary card to add words here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
