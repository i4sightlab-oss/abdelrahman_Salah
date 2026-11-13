import confetti from 'canvas-confetti';
import { Award, BookOpen, CheckCircle, HelpCircle, Pause, Play, Sparkles, Volume2 } from 'lucide-react';
import React, { useState } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { speechService } from '../../services/speechService';
import { GradeLevel, ReadingPassage, WordItem } from '../../types';
import { WordDetailModal } from '../dictionary/WordDetailModal';

interface ReadingPassagesViewProps {
  passages: ReadingPassage[];
  allWords: WordItem[];
  activeGrade: GradeLevel;
  favoriteWordIds: string[];
  masteredWordIds: string[];
  completedPassageIds: string[];
  onToggleFavorite: (id: string) => void;
  onToggleMastered: (id: string) => void;
  onCompletePassage: (id: string) => void;
  isSlowAudio?: boolean;
}

export const ReadingPassagesView: React.FC<ReadingPassagesViewProps> = ({
  passages,
  allWords,
  activeGrade,
  favoriteWordIds,
  masteredWordIds,
  completedPassageIds,
  onToggleFavorite,
  onToggleMastered,
  onCompletePassage,
  isSlowAudio = false,
}) => {
  // Find default passage or matching grade
  const [selectedPassageId, setSelectedPassageId] = useState<string>(() => {
    const matched = passages.find((p) => p.grade === activeGrade);
    return matched ? matched.id : passages[0]?.id || '';
  });

  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);
  const [isPlayingStory, setIsPlayingStory] = useState(false);
  const [currentParagraphIdx, setCurrentParagraphIdx] = useState<number | null>(null);

  // Comprehension quiz states
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const activePassage = passages.find((p) => p.id === selectedPassageId) || passages[0];

  // Map words by clean lowercase English for instant lookup
  const wordsMap = React.useMemo(() => {
    const map = new Map<string, WordItem>();
    allWords.forEach((w) => {
      map.set(w.word.toLowerCase(), w);
      // Also map singular/plural variants if simple
      map.set(w.word.toLowerCase() + 's', w);
    });
    return map;
  }, [allWords]);

  // Handle clicking any word in the story
  const handleWordClick = async (rawWord: string) => {
    // Strip punctuation
    const clean = rawWord.replace(/^[.,/#!$%^&*;:{}=\-_`~()'"?]+|[.,/#!$%^&*;:{}=\-_`~()'"?]+$/g, '').toLowerCase();
    if (!clean) return;

    soundEffects.playPop();

    // Look up in dictionary
    const foundWord = wordsMap.get(clean);

    if (foundWord) {
      setSelectedWord(foundWord);
      await speechService.speakEnglish(foundWord.word, isSlowAudio);
    } else {
      // Speak the tapped word directly even if not a core dictionary entry!
      await speechService.speakEnglish(clean, isSlowAudio);
    }
  };

  // Play whole passage or stop
  const togglePlayPassage = async () => {
    if (isPlayingStory) {
      speechService.stop();
      setIsPlayingStory(false);
      setCurrentParagraphIdx(null);
      return;
    }

    if (!activePassage) return;

    setIsPlayingStory(true);
    for (let i = 0; i < activePassage.paragraphs.length; i++) {
      if (!isPlayingStory && i > 0) break; // Check if stopped
      setCurrentParagraphIdx(i);
      await speechService.speakEnglish(activePassage.paragraphs[i], isSlowAudio);
    }
    setIsPlayingStory(false);
    setCurrentParagraphIdx(null);
  };

  // Check Quiz
  const handleAnswerSelect = (questionId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    soundEffects.playPop();
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleCheckAnswers = () => {
    if (!activePassage) return;
    soundEffects.playFlip();

    const questions = activePassage.comprehensionQuestions;
    let correctCount = 0;
    questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    setQuizSubmitted(true);

    if (correctCount === questions.length) {
      soundEffects.playFanfare();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti silent fallback
      }
      onCompletePassage(activePassage.id);
    } else {
      soundEffects.playSuccess();
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Passage Selector Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {passages.map((p) => {
          const isSelected = p.id === activePassage?.id;
          const isCompleted = completedPassageIds.includes(p.id);

          return (
            <button
              key={p.id}
              onClick={() => {
                soundEffects.playFlip();
                setSelectedPassageId(p.id);
                resetQuiz();
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl whitespace-nowrap text-xs font-bold transition tap-active border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50'
              }`}
            >
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950">
                {p.grade}
              </span>
              <span>{p.titleEn}</span>
              {isCompleted && (
                <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {activePassage && (
        <>
          {/* Main Story Container */}
          <div className="rounded-3xl bg-white border-2 border-amber-200 p-5 sm:p-7 shadow-xs">
            {/* Header: Titles & Listen Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
                    {activePassage.readingLevel}
                  </span>
                  <span className="text-xs text-slate-500">{activePassage.category}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {activePassage.titleEn}
                </h2>
                <h3 className="font-arabic font-extrabold text-base sm:text-lg text-emerald-800 mt-0.5">
                  {activePassage.titleAr}
                </h3>
              </div>

              {/* Story Audio Play/Pause Button */}
              <button
                onClick={togglePlayPassage}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition tap-active border shrink-0 ${
                  isPlayingStory
                    ? 'bg-amber-500 text-white border-amber-500 animate-pulse'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
              >
                {isPlayingStory ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-blue-700" />
                    <span>Listen to Story (صوت)</span>
                  </>
                )}
              </button>
            </div>

            {/* Clickable Word Helper Tip */}
            <div className="bg-amber-50 rounded-2xl p-2.5 my-4 border border-amber-200/60 flex items-center gap-2 text-xs text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <p>
                <strong>Interactive Reading: </strong>
                Tap on <span className="bg-amber-200 px-1 py-0.5 rounded-md font-bold text-amber-950">any word</span> below to hear its pronunciation and see its Egyptian dictionary card!
              </p>
            </div>

            {/* Story Paragraphs with Clickable Words */}
            <div className="space-y-4 text-base sm:text-lg text-slate-800 leading-relaxed">
              {activePassage.paragraphs.map((para, pIdx) => {
                const words = para.split(' ');
                const isCurrentSpeaking = currentParagraphIdx === pIdx;

                return (
                  <p
                    key={pIdx}
                    className={`p-3 rounded-2xl transition-colors duration-300 ${
                      isCurrentSpeaking
                        ? 'bg-blue-50/80 border border-blue-200 ring-2 ring-blue-100'
                        : 'bg-transparent'
                    }`}
                  >
                    {words.map((w, wIdx) => {
                      const clean = w.replace(/^[.,/#!$%^&*;:{}=\-_`~()'"?]+|[.,/#!$%^&*;:{}=\-_`~()'"?]+$/g, '').toLowerCase();
                      const isVocab = wordsMap.has(clean);

                      return (
                        <span
                          key={wIdx}
                          onClick={() => handleWordClick(w)}
                          className={`inline-block mr-1.5 px-1 py-0.5 rounded-lg cursor-pointer transition tap-active ${
                            isVocab
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold underline decoration-amber-400 decoration-2 underline-offset-4'
                              : 'hover:bg-blue-100 hover:text-blue-900'
                          }`}
                        >
                          {w}
                        </span>
                      );
                    })}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Reading Comprehension Quiz Section */}
          <div className="rounded-3xl bg-white border-2 border-indigo-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Comprehension Check / أسئلة الفهم
                </h3>
                <p className="text-xs text-slate-500 font-arabic">
                  اختر الإجابة الصحيحة بناءً على ما قرأته في القصة
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {activePassage.comprehensionQuestions.map((q, qIdx) => {
                const selected = quizAnswers[q.id];

                return (
                  <div key={q.id} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
                    <p className="font-bold text-sm text-slate-900 mb-0.5">
                      {qIdx + 1}. {q.questionEn}
                    </p>
                    <p className="font-arabic text-xs font-semibold text-slate-600 mb-3" dir="rtl">
                      {q.questionAr}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((option, optIdx) => {
                        const isChosen = selected === optIdx;
                        let optionStyle = 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50/50';

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            optionStyle = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';
                          } else if (isChosen && optIdx !== q.correctIndex) {
                            optionStyle = 'bg-rose-100 text-rose-900 border-rose-300 line-through';
                          }
                        } else if (isChosen) {
                          optionStyle = 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleAnswerSelect(q.id, optIdx)}
                            className={`p-2.5 rounded-xl border text-xs text-left transition tap-active flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{option}</span>
                            {quizSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Check Answers Button */}
            <div className="mt-5 flex items-center justify-between">
              {quizSubmitted ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <Award className="w-4 h-4" />
                    <span>Great Reading Job! (+25 XP)</span>
                  </div>
                  <button
                    onClick={resetQuiz}
                    className="text-xs text-slate-600 font-bold hover:underline"
                  >
                    Try Again / إعادة المحاولة
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCheckAnswers}
                  disabled={Object.keys(quizAnswers).length < activePassage.comprehensionQuestions.length}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-xs transition tap-active"
                >
                  Check Answers / تحقق من الإجابات
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Word Detail Popover Modal when clicking any vocabulary word */}
      <WordDetailModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        isFavorite={selectedWord ? favoriteWordIds.includes(selectedWord.id) : false}
        isMastered={selectedWord ? masteredWordIds.includes(selectedWord.id) : false}
        onToggleFavorite={onToggleFavorite}
        onToggleMastered={onToggleMastered}
        isSlowAudio={isSlowAudio}
      />
    </div>
  );
};
