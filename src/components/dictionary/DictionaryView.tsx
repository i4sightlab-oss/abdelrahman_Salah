import { Bookmark, Compass, Filter, Layers, LayoutGrid, RotateCw, Search, Sparkles, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { normalizeArabic } from '../../services/speechService';
import { GradeLevel, WordCategory, WordItem } from '../../types';
import { FlashcardMode } from './FlashcardMode';
import { VocabularyCard } from './VocabularyCard';

interface DictionaryViewProps {
  words: WordItem[];
  activeGrade: GradeLevel;
  onGradeChange: (grade: GradeLevel) => void;
  favoriteWordIds: string[];
  masteredWordIds: string[];
  onToggleFavorite: (id: string) => void;
  onToggleMastered: (id: string) => void;
  isSlowAudio?: boolean;
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  words,
  activeGrade,
  onGradeChange,
  favoriteWordIds,
  masteredWordIds,
  onToggleFavorite,
  onToggleMastered,
  isSlowAudio = false,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'flashcards'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'learning'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('Current'); // 'Current', 'All', or specific grade

  // Unique categories
  const categories: string[] = useMemo(() => {
    const set = new Set<string>();
    words.forEach((w) => set.add(w.category));
    set.add('spellingbee2026/2027');
    const rest = Array.from(set).filter((c) => c !== 'spellingbee2026/2027');
    return ['All', 'spellingbee2026/2027', ...rest];
  }, [words]);

  // Filtered words
  const filteredWords = useMemo(() => {
    const qRaw = searchQuery.trim().toLowerCase();
    const qArNorm = normalizeArabic(searchQuery);

    return words.filter((w) => {
      // 1. Grade filter
      if (gradeFilter === 'Current') {
        if (w.grade !== activeGrade) return false;
      } else if (gradeFilter !== 'All') {
        if (w.grade !== gradeFilter) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'All' && w.category !== selectedCategory) {
        return false;
      }

      // 3. Favorites / Learning filter
      if (filterMode === 'favorites' && !favoriteWordIds.includes(w.id)) {
        return false;
      }
      if (filterMode === 'learning' && masteredWordIds.includes(w.id)) {
        return false;
      }

      // 4. Search query in English & Arabic
      if (qRaw) {
        const matchesEnWord = w.word.toLowerCase().includes(qRaw);
        const matchesEnDef = w.definitionEn.toLowerCase().includes(qRaw);
        const matchesArWord = normalizeArabic(w.arabic).includes(qArNorm);
        const matchesArDef = normalizeArabic(w.definitionAr).includes(qArNorm);

        if (!matchesEnWord && !matchesEnDef && !matchesArWord && !matchesArDef) {
          return false;
        }
      }

      return true;
    });
  }, [words, searchQuery, selectedCategory, filterMode, gradeFilter, activeGrade, favoriteWordIds, masteredWordIds]);

  return (
    <div className="space-y-4 pb-20">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 p-5 sm:p-6 text-white shadow-md">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Egyptian Primary Connect Curriculum</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Explore English & Arabic Words!
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 font-arabic mt-1 leading-relaxed">
            قاموس تفاعلي مصور مع نطق صوتي أصلي باللغتين الإنجليزية والعربية لكل تلاميذ المرحلة الابتدائية.
          </p>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'flashcards' ? 'grid' : 'flashcards')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-blue-900 font-extrabold text-xs shadow-md hover:bg-amber-100 transition tap-active"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>
                {viewMode === 'flashcards'
                  ? 'Exit Flashcards / العودة للشبكة'
                  : '⚡ Study with Flashcards (بطاقات التكرار)'}
              </span>
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-6 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute right-12 top-2 text-6xl opacity-20 pointer-events-none select-none">
          📖
        </div>
      </div>

      {/* Search Input Bar (Supports English & Arabic) */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search in English or Arabic (e.g. pyramid, هرم)..."
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border-2 border-amber-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 shadow-xs transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Row: Grade Tabs + Quick Mode (All, Favorites, To Learn) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Grade Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setGradeFilter('Current')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition tap-active ${
              gradeFilter === 'Current'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            My Grade ({activeGrade})
          </button>
          <button
            onClick={() => setGradeFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition tap-active ${
              gradeFilter === 'All'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Grades (P1-P6)
          </button>
          {(['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] as GradeLevel[]).map((g) => (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition tap-active ${
                gradeFilter === g
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Learning Status Filter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
              filterMode === 'all'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({words.length})
          </button>
          <button
            onClick={() => setFilterMode('favorites')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition ${
              filterMode === 'favorites'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({favoriteWordIds.length})</span>
          </button>
          <button
            onClick={() => setFilterMode('learning')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
              filterMode === 'learning'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            To Master
          </button>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isBee = cat === 'spellingbee2026/2027';
          const isSelected = selectedCategory === cat;
          const label = isBee ? '🐝 Spelling Bee 2026/2027' : cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition tap-active border ${
                isSelected
                  ? isBee
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs ring-2 ring-amber-300'
                    : 'bg-amber-400 text-amber-950 border-amber-500 shadow-2xs'
                  : isBee
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 font-extrabold'
                    : 'bg-white text-slate-600 border-amber-100 hover:bg-amber-50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Official Spelling Bee 2026/2027 Header Banner */}
      {selectedCategory === 'spellingbee2026/2027' && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-3xl p-4 sm:p-5 text-amber-950 shadow-md border-2 border-amber-400 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center text-3xl shrink-0 border border-amber-200">
              🐝
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-black bg-amber-950 text-amber-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                  Official 2026–2027 Word List
                </span>
                <span className="text-xs font-black text-amber-900">
                  Primary 1 to Primary 6
                </span>
              </div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                Al-Azhar National Spelling Bee Competition 2026–2027
              </h3>
              <p className="text-xs font-medium text-amber-950 mt-1 max-w-xl">
                Master authentic competition words with Egyptian audio pronunciation, full Arabic tashkeel, child-friendly definitions, and interactive flashcard drilling!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            <button
              onClick={() => setViewMode(viewMode === 'flashcards' ? 'grid' : 'flashcards')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black shadow-xs transition tap-active ${
                viewMode === 'flashcards'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-amber-950 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              {viewMode === 'flashcards' ? 'View Grid 📋' : 'Flip Cards 🃏'}
            </button>
            <button
              onClick={() => setGradeFilter('All')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black shadow-xs transition tap-active ${
                gradeFilter === 'All'
                  ? 'bg-amber-950 text-amber-100'
                  : 'bg-amber-900/90 text-white hover:bg-amber-950'
              }`}
            >
              All Grades (P1–P6)
            </button>
          </div>
        </div>
      )}

      {/* Results Header with View Mode Switcher */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong>{filteredWords.length}</strong> vocabulary cards
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 font-bold hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        {/* View Switcher: Grid vs Flashcards */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition tap-active ${
              viewMode === 'grid'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid / شبكة</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('flashcards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition tap-active ${
              viewMode === 'flashcards'
                ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                : 'text-blue-700 hover:bg-blue-50 font-bold'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flashcards / بطاقات</span>
          </button>
        </div>
      </div>

      {/* Main View Area: Flashcards or Grid */}
      {viewMode === 'flashcards' ? (
        <FlashcardMode
          words={filteredWords.length > 0 ? filteredWords : words}
          favoriteWordIds={favoriteWordIds}
          masteredWordIds={masteredWordIds}
          onToggleFavorite={onToggleFavorite}
          onToggleMastered={onToggleMastered}
          onExit={() => setViewMode('grid')}
          isSlowAudio={isSlowAudio}
        />
      ) : filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredWords.map((word) => (
            <VocabularyCard
              key={word.id}
              word={word}
              isFavorite={favoriteWordIds.includes(word.id)}
              isMastered={masteredWordIds.includes(word.id)}
              onToggleFavorite={onToggleFavorite}
              onToggleMastered={onToggleMastered}
              isSlowAudio={isSlowAudio}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 bg-white rounded-3xl border-2 border-dashed border-amber-200">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-3xl">
            🔍
          </div>
          <h3 className="text-base font-extrabold text-slate-800">
            No words matched your search
          </h3>
          <p className="text-xs text-slate-500 font-arabic mt-1 mb-4">
            لم نجد نتائج مطابقة، جرب البحث بكلمة أخرى أو قم بمسح الفلاتر.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setFilterMode('all');
              setGradeFilter('All');
            }}
            className="px-4 py-2 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition"
          >
            Reset Filters / عرض كل الكلمات
          </button>
        </div>
      )}
    </div>
  );
};
