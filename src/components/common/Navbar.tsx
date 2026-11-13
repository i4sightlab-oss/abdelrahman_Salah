import { Award, Flame, Sparkles, Volume2 } from 'lucide-react';
import React from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { GradeLevel } from '../../types';

interface NavbarProps {
  activeGrade: GradeLevel;
  onGradeChange: (grade: GradeLevel) => void;
  stars: number;
  streak: number;
  isSlowAudio: boolean;
  onToggleAudioSpeed: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeGrade,
  onGradeChange,
  stars,
  streak,
  isSlowAudio,
  onToggleAudioSpeed,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = React.useState(false);

  const gradeLabels: Record<GradeLevel, { en: string; ar: string }> = {
    P1: { en: 'Primary 1', ar: 'الأول الابتدائي' },
    P2: { en: 'Primary 2', ar: 'الثاني الابتدائي' },
    P3: { en: 'Primary 3', ar: 'الثالث الابتدائي' },
    P4: { en: 'Primary 4', ar: 'الرابع الابتدائي' },
    P5: { en: 'Primary 5', ar: 'الخامس الابتدائي' },
    P6: { en: 'Primary 6', ar: 'السادس الابتدائي' },
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-amber-400 p-0.5 shadow-sm shrink-0 flex items-center justify-center text-white">
              <span className="font-extrabold text-xl font-english">N</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight leading-none">
                  NileKids
                </h1>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-arabic hidden sm:inline">
                  قاموس النيل
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden xs:block">
                English-Arabic Primary Dictionary
              </p>
            </div>
          </div>

          {/* Right Controls: Grade selector, Streak, Stars, Audio speed, Install */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Grade Selector Dropdown */}
            <div className="relative">
              <select
                aria-label="Select Primary Grade"
                value={activeGrade}
                onChange={(e) => onGradeChange(e.target.value as GradeLevel)}
                className="bg-amber-100/80 hover:bg-amber-100 text-amber-900 font-bold text-xs sm:text-sm py-1.5 px-2.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer transition shadow-2xs"
              >
                {(Object.keys(gradeLabels) as GradeLevel[]).map((g) => (
                  <option key={g} value={g} className="bg-white text-slate-800">
                    {g} ({gradeLabels[g].ar})
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Speed Toggle (Turtle vs Normal) */}
            <button
              onClick={onToggleAudioSpeed}
              title={isSlowAudio ? 'Slow audio enabled (0.7x)' : 'Normal audio speed (1.0x)'}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold transition tap-active border ${
                isSlowAudio
                  ? 'bg-purple-100 text-purple-700 border-purple-300 ring-2 ring-purple-300/50'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSlowAudio ? '🐢 Slow' : '⚡ 1.0x'}</span>
            </button>

            {/* Streak Counter */}
            <div
              className="flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 px-2 py-1.5 rounded-xl text-xs font-extrabold shadow-2xs"
              title="Daily Learning Streak"
            >
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{streak}d</span>
            </div>

            {/* Stars Counter */}
            <div
              className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-xl text-xs font-extrabold shadow-2xs"
              title="Stars Earned"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{stars}</span>
            </div>

            {/* PWA Install Button (Chromium / Desktop / Android) */}
            {isInstallable && !isInstalled && (
              <button
                onClick={install}
                className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs hover:brightness-110 transition tap-active"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* iOS Safari PWA Prompt Button */}
            {isIOS && !isInstalled && (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="hidden md:flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs px-2.5 py-1.5 rounded-xl hover:bg-blue-100 transition tap-active"
              >
                <span>Install on iOS</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-amber-100 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">
              Install NileKids App
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 font-arabic">
              تثبيت القاموس على الآيفون والآيباد للعمل بدون إنترنت
            </p>
            <div className="text-left bg-slate-50 rounded-2xl p-4 text-xs space-y-2 text-slate-700 font-medium">
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>Tap the <strong>Share</strong> button at bottom of Safari.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>Enjoy full offline vocabulary cards and games anytime!</span>
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-2xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition"
            >
              Got it! / فَهِمْتُ
            </button>
          </div>
        </div>
      )}
    </>
  );
};
