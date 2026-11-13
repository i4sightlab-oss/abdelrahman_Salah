import confetti from 'canvas-confetti';
import { CheckCircle2, Dna, HelpCircle, RotateCcw, Search, Sparkles, Trophy, Volume2, XCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { speechService } from '../../services/speechService';
import { GradeLevel, IrregularVerb } from '../../types';

interface IrregularVerbsViewProps {
  verbs: IrregularVerb[];
  activeGrade: GradeLevel;
  onDrillScore: (score: number) => void;
  isSlowAudio?: boolean;
}

export const IrregularVerbsView: React.FC<IrregularVerbsViewProps> = ({
  verbs,
  activeGrade,
  onDrillScore,
  isSlowAudio = false,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'drill'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('All');

  // Drill test state
  const [drillRounds, setDrillRounds] = useState<{
    verb: IrregularVerb;
    question: string;
    correctAnswer: string;
    options: string[];
    formType: 'Past Simple (V2)' | 'Past Participle (V3)';
  }[]>([]);
  const [drillIndex, setDrillIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [drillScore, setDrillScore] = useState(0);
  const [isDrillCompleted, setIsDrillCompleted] = useState(false);

  // Filter verbs for table
  const filteredVerbs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return verbs.filter((v) => {
      if (gradeFilter !== 'All' && v.grade !== gradeFilter) return false;
      if (!q) return true;
      return (
        v.base.toLowerCase().includes(q) ||
        v.pastSimple.toLowerCase().includes(q) ||
        v.pastParticiple.toLowerCase().includes(q) ||
        v.arabic.includes(q)
      );
    });
  }, [verbs, searchQuery, gradeFilter]);

  // Start a new Drill session
  const startDrill = () => {
    soundEffects.playPop();
    const shuffled = [...verbs].sort(() => 0.5 - Math.random()).slice(0, 5);

    const questions = shuffled.map((v) => {
      const askV3 = Math.random() > 0.5;
      const targetForm = askV3 ? v.pastParticiple : v.pastSimple;
      const formName = askV3 ? 'Past Participle (V3)' : 'Past Simple (V2)';

      // Distractors from other verbs
      const otherForms = verbs
        .filter((item) => item.id !== v.id)
        .map((item) => (askV3 ? item.pastParticiple : item.pastSimple));

      const wrongOptions = Array.from(new Set(otherForms))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [targetForm, ...wrongOptions].sort(() => 0.5 - Math.random());

      return {
        verb: v,
        question: `What is the ${formName} of "${v.base}" (${v.arabic})?`,
        correctAnswer: targetForm,
        options,
        formType: formName as 'Past Simple (V2)' | 'Past Participle (V3)',
      };
    });

    setDrillRounds(questions);
    setDrillIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setDrillScore(0);
    setIsDrillCompleted(false);
    setViewMode('drill');
  };

  const handleSelectDrillOption = async (option: string) => {
    if (isAnswerChecked || !currentDrill) return;

    soundEffects.playPop();
    setSelectedOption(option);
    setIsAnswerChecked(true);

    const isCorrect = option === currentDrill.correctAnswer;
    if (isCorrect) {
      soundEffects.playSuccess();
      setDrillScore((s) => s + 10);
    } else {
      soundEffects.playTryAgain();
    }

    await speechService.speakEnglish(option, isSlowAudio);

    setTimeout(() => {
      if (drillIndex + 1 < drillRounds.length) {
        setDrillIndex((idx) => idx + 1);
        setSelectedOption(null);
        setIsAnswerChecked(false);
      } else {
        soundEffects.playFanfare();
        setIsDrillCompleted(true);
        onDrillScore(drillScore + (isCorrect ? 10 : 0));
        try {
          confetti({
            particleCount: 40,
            spread: 55,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    }, 1300);
  };

  const currentDrill = drillRounds[drillIndex];

  const handleSpeakVerb = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    speechService.speakEnglish(text, isSlowAudio);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 sm:p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold mb-2">
              <Dna className="w-3.5 h-3.5 text-yellow-200" />
              <span>Primary English Grammar Connect</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Irregular Verbs Practice / تصريف الأفعال الشاذة
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 font-arabic mt-1">
              تعلم تصريف الأفعال الشاذة (المضارع V1، الماضي البسيط V2، والتصريف الثالث V3) مع النطق الصوتي والأمثلة.
            </p>
          </div>

          {/* Drill Toggle Button */}
          <button
            onClick={viewMode === 'table' ? startDrill : () => setViewMode('table')}
            className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-white text-amber-900 font-extrabold text-xs shadow-md hover:bg-amber-50 transition tap-active flex items-center gap-1.5 shrink-0"
          >
            {viewMode === 'table' ? (
              <>
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Start Verb Quiz / اختبار الأفعال</span>
              </>
            ) : (
              <span>View Table / جدول الأفعال</span>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          {/* Controls: Search + Grade filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verbs (e.g. go, saw, buy, يذهب)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-amber-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['All', 'P3', 'P4', 'P5', 'P6'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition tap-active whitespace-nowrap ${
                    gradeFilter === g
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {g === 'All' ? 'All Grades' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Responsive Verb Cards Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredVerbs.map((v) => (
              <div
                key={v.id}
                className="rounded-3xl bg-white border-2 border-amber-200/80 p-4 shadow-2xs hover:shadow-sm transition"
              >
                {/* Header: Grade & Meaning */}
                <div className="flex items-center justify-between pb-2 border-b border-amber-100 mb-2.5">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white">
                    {v.grade}
                  </span>
                  <span className="font-arabic font-extrabold text-base text-emerald-800" dir="rtl">
                    {v.arabic}
                  </span>
                </div>

                {/* 3 Forms Grid */}
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  {/* V1 Present */}
                  <div className="bg-slate-50 rounded-2xl p-2 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      V1 (Present)
                    </span>
                    <button
                      onClick={(e) => handleSpeakVerb(v.base, e)}
                      className="inline-flex items-center gap-1 font-extrabold text-sm sm:text-base text-blue-700 hover:text-blue-900 mt-0.5 tap-active"
                    >
                      <span>{v.base}</span>
                      <Volume2 className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </div>

                  {/* V2 Past Simple */}
                  <div className="bg-amber-50 rounded-2xl p-2 border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-700 block uppercase">
                      V2 (Past)
                    </span>
                    <button
                      onClick={(e) => handleSpeakVerb(v.pastSimple, e)}
                      className="inline-flex items-center gap-1 font-black text-sm sm:text-base text-amber-900 hover:text-amber-950 mt-0.5 tap-active"
                    >
                      <span>{v.pastSimple}</span>
                      <Volume2 className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </div>

                  {/* V3 Past Participle */}
                  <div className="bg-purple-50 rounded-2xl p-2 border border-purple-200">
                    <span className="text-[10px] font-bold text-purple-700 block uppercase">
                      V3 (P.P.)
                    </span>
                    <button
                      onClick={(e) => handleSpeakVerb(v.pastParticiple, e)}
                      className="inline-flex items-center gap-1 font-black text-sm sm:text-base text-purple-900 hover:text-purple-950 mt-0.5 tap-active"
                    >
                      <span>{v.pastParticiple}</span>
                      <Volume2 className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </div>
                </div>

                {/* Example sentence */}
                <div className="bg-slate-50/70 rounded-xl p-2 text-xs text-slate-700">
                  <p className="font-medium italic text-[11px]">
                    "{v.examplePast}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Verb Quiz / Drill Screen */
        <div className="rounded-3xl bg-white border-2 border-amber-200 p-5 sm:p-7 shadow-xs max-w-lg mx-auto">
          {!isDrillCompleted && currentDrill ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                <span className="text-xs font-bold text-slate-500">
                  Question {drillIndex + 1} / {drillRounds.length}
                </span>
                <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-xs font-extrabold">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Score: {drillScore}</span>
                </div>
              </div>

              <div className="py-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-orange-100 text-orange-800">
                  {currentDrill.formType}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-3">
                  {currentDrill.question}
                </h3>
              </div>

              {/* 4 Choices */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {currentDrill.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentDrill.correctAnswer;

                  let style = 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-amber-50 hover:border-amber-300';
                  if (isAnswerChecked) {
                    if (isCorrect) {
                      style = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black ring-2 ring-emerald-300';
                    } else if (isSelected && !isCorrect) {
                      style = 'bg-rose-100 text-rose-900 border-rose-300 line-through';
                    } else {
                      style = 'opacity-40 bg-slate-50 text-slate-500 border-slate-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectDrillOption(opt)}
                      disabled={isAnswerChecked}
                      className={`p-4 rounded-2xl border-2 text-base font-extrabold transition-all tap-active flex items-center justify-between ${style}`}
                    >
                      <span>{opt}</span>
                      {isAnswerChecked && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-1" />
                      )}
                      {isAnswerChecked && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Drill Complete */
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl shadow-inner animate-bounce">
                👑
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Grammar Pharaoh!
              </h3>
              <p className="text-xs font-arabic text-emerald-800 font-bold mt-1 mb-4">
                أحسنت! أتقنت تصريف الأفعال الشاذة وحصلت على نجوم إضافية!
              </p>
              <p className="text-base font-extrabold text-amber-700 bg-amber-50 inline-block px-4 py-1.5 rounded-2xl border border-amber-200 mb-5">
                Total Score: {drillScore} Stars
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={startDrill}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition tap-active"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again / تدريب جديد</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition tap-active"
                >
                  Back to Table
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
