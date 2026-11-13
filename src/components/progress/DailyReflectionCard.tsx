import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Trash2,
  Volume2
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { DailyReflection } from '../../types';

interface DailyReflectionCardProps {
  reflections: DailyReflection[];
  onSaveReflection: (reflection: DailyReflection) => void;
}

const EMOJI_MOODS = [
  { emoji: '🌟', labelEn: 'Super Star', labelAr: 'مُمَيَّزٌ وَمُتَفَوِّق', color: 'border-amber-400 bg-amber-50 text-amber-900' },
  { emoji: '😊', labelEn: 'Happy & Proud', labelAr: 'سَعِيدٌ وَفَخُور', color: 'border-emerald-400 bg-emerald-50 text-emerald-900' },
  { emoji: '🤔', labelEn: 'Curious & Exploring', labelAr: 'شَغُوفٌ وَمُسْتَكْشِف', color: 'border-blue-400 bg-blue-50 text-blue-900' },
  { emoji: '⚡', labelEn: 'Full of Energy', labelAr: 'مَلِيءٌ بِالْحَمَاس', color: 'border-orange-400 bg-orange-50 text-orange-900' },
  { emoji: '😴', labelEn: 'Worked Hard & Tired', labelAr: 'بَذَلْتُ جُهْدًا كَبِيرًا', color: 'border-purple-400 bg-purple-50 text-purple-900' },
];

const QUICK_PROMPTS = [
  { en: '✨ I learned 3 new words today!', ar: 'حفظت كلمات جديدة اليوم!' },
  { en: '📚 Loved reading the Nile story!', ar: 'أحببت قراءة قصة النيل!' },
  { en: '🎮 Won the Spelling Bee game!', ar: 'فزت في لعبة التهجئة!' },
  { en: '⚡ Practiced my irregular verbs!', ar: 'تدربت على الأفعال الشاذة!' },
];

export const DailyReflectionCard: React.FC<DailyReflectionCardProps> = ({
  reflections,
  onSaveReflection,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExisting = reflections.find((r) => r.date === todayStr);

  const [selectedEmoji, setSelectedEmoji] = useState<string>(todayExisting?.emoji || '🌟');
  const [selectedMood, setSelectedMood] = useState(
    EMOJI_MOODS.find((m) => m.emoji === (todayExisting?.emoji || '🌟')) || EMOJI_MOODS[0]
  );
  const [noteText, setNoteText] = useState<string>(todayExisting?.noteText || '');
  const [voiceMemoUrl, setVoiceMemoUrl] = useState<string | undefined>(todayExisting?.voiceMemoUrl);
  const [voiceDuration, setVoiceDuration] = useState<number>(todayExisting?.voiceDurationSeconds || 0);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  // Audio Playback State for Preview & History
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSelectEmoji = (mood: typeof EMOJI_MOODS[0]) => {
    soundEffects.playPop();
    setSelectedEmoji(mood.emoji);
    setSelectedMood(mood);
  };

  const handleSelectPrompt = (prompt: { en: string; ar: string }) => {
    soundEffects.playPop();
    const current = noteText.trim();
    if (!current) {
      setNoteText(`${prompt.en} (${prompt.ar})`);
    } else {
      setNoteText(`${current}\n${prompt.en}`);
    }
  };

  // Start Voice Recording
  const startRecording = async () => {
    soundEffects.playPop();
    setMicError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicError('Audio recording is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setVoiceMemoUrl(base64data);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      recordIntervalRef.current = window.setInterval(() => {
        setRecordDuration((prev) => {
          if (prev >= 60) {
            // Auto stop after 60 seconds
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Microphone error:', err);
      setMicError('Could not access microphone. You can still type your reflection note!');
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    soundEffects.playPop();
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setVoiceDuration(recordDuration);
    setIsRecording(false);
  };

  const deleteVoiceMemo = () => {
    soundEffects.playPop();
    setVoiceMemoUrl(undefined);
    setVoiceDuration(0);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setPlayingId(null);
  };

  const togglePlayAudio = (url: string, id: string) => {
    soundEffects.playPop();
    if (playingId === id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(url);
      audioPlayerRef.current = audio;
      setPlayingId(id);

      audio.onended = () => {
        setPlayingId(null);
      };

      audio.play().catch(() => {
        setPlayingId(null);
      });
    }
  };

  const handleSave = () => {
    soundEffects.playSuccess();
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch {}

    const reflection: DailyReflection = {
      id: todayExisting?.id || `refl-${Date.now()}`,
      date: todayStr,
      createdAt: new Date().toISOString(),
      emoji: selectedEmoji,
      moodLabelEn: selectedMood.labelEn,
      moodLabelAr: selectedMood.labelAr,
      noteText: noteText.trim() || undefined,
      voiceMemoUrl: voiceMemoUrl,
      voiceDurationSeconds: voiceDuration > 0 ? voiceDuration : undefined,
    };

    onSaveReflection(reflection);
  };

  return (
    <div className="rounded-3xl bg-white border-2 border-amber-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-xl shadow-xs">
            🌟
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Daily Reflection</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-arabic">
                تأملي اليومي
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-arabic">
              كيف كان تعلمك اليوم؟ اختر الإيموجي وأضف رسالة صوتية أو نصية!
            </p>
          </div>
        </div>

        {todayExisting && (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Today's Reflection Saved (+15 XP)</span>
          </div>
        )}
      </div>

      {/* Step 1: Emoji Mood Picker */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          1. How do you feel about your learning today? / كيف تشعر اليوم؟
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {EMOJI_MOODS.map((mood) => {
            const isSelected = selectedEmoji === mood.emoji;
            return (
              <button
                key={mood.emoji}
                type="button"
                onClick={() => handleSelectEmoji(mood)}
                className={`p-3 rounded-2xl border-2 transition-all tap-active flex flex-col items-center text-center ${
                  isSelected
                    ? `${mood.color} ring-2 ring-amber-300 shadow-xs scale-102 font-black`
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-amber-50/50'
                }`}
              >
                <span className="text-3xl mb-1">{mood.emoji}</span>
                <span className="text-xs font-bold leading-tight">{mood.labelEn}</span>
                <span className="text-[10px] font-arabic text-slate-500 mt-0.5 leading-tight">
                  {mood.labelAr}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Voice Memo Recording */}
      <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/60 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-amber-600" />
            <span>2. Record a Voice Memo (مذكرة صوتية)</span>
          </label>
          <span className="text-[11px] text-slate-400">Optional / اختياري</span>
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {!isRecording && !voiceMemoUrl && (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition tap-active"
            >
              <Mic className="w-4 h-4" />
              <span>Record Voice Memo / اضغط للتسجيل</span>
            </button>
          )}

          {isRecording && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-300 text-xs font-bold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span>Recording... 0:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}</span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-xs transition tap-active"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Stop Recording / إنهاء</span>
              </button>
            </div>
          )}

          {voiceMemoUrl && !isRecording && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Play Recorded Voice */}
              <button
                type="button"
                onClick={() => togglePlayAudio(voiceMemoUrl, 'current-memo')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition tap-active"
              >
                {playingId === 'current-memo' ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Memo</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Listen to My Memo ({voiceDuration}s)</span>
                  </>
                )}
              </button>

              {/* Delete Voice Memo */}
              <button
                type="button"
                onClick={deleteVoiceMemo}
                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition tap-active"
                title="Delete voice memo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {micError && (
          <p className="text-xs text-rose-600 font-medium">{micError}</p>
        )}
      </div>

      {/* Step 3: Text Note & Quick Prompt Chips */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          3. Add a short note / اكتب ملاحظة عما تعلمته
        </label>

        {/* Quick prompt suggestions for children */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPrompt(prompt)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-[11px] font-semibold whitespace-nowrap border border-slate-200 transition tap-active"
            >
              {prompt.en}
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="What word or story made you smile today? (مثال: أحببت كلمة pyramid وقصة الإسكندرية اليوم)..."
          className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition"
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Earn +15 XP & +2 Stars for reflecting!</span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white font-extrabold text-xs shadow-md transition tap-active"
        >
          <Send className="w-4 h-4" />
          <span>{todayExisting ? 'Update Reflection' : 'Save Reflection / حفظ'}</span>
        </button>
      </div>

      {/* Past Reflections History Log */}
      {reflections.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Previous Reflections / سجل التأملات السابقة ({reflections.length})
            </h4>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {reflections.map((refl) => {
              const isToday = refl.date === todayStr;
              return (
                <div
                  key={refl.id}
                  className={`p-3 rounded-2xl border transition flex items-start justify-between gap-3 ${
                    isToday
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0 mt-0.5">{refl.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-800">
                          {refl.moodLabelEn}
                        </span>
                        <span className="text-[10px] font-arabic font-semibold text-emerald-800">
                          ({refl.moodLabelAr})
                        </span>
                        <span className="text-[10px] text-slate-400">
                          • {refl.date} {isToday ? '(Today)' : ''}
                        </span>
                      </div>

                      {refl.noteText && (
                        <p className="text-xs text-slate-600 mt-1 leading-snug break-words">
                          "{refl.noteText}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Play Voice Memo button if attached */}
                  {refl.voiceMemoUrl && (
                    <button
                      type="button"
                      onClick={() => togglePlayAudio(refl.voiceMemoUrl!, refl.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold shrink-0 transition tap-active"
                    >
                      {playingId === refl.id ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-blue-700" />
                          <span>Voice ({refl.voiceDurationSeconds || 0}s)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
