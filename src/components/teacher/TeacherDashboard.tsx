import { Download, Edit3, KeyRound, Lock, PlusCircle, RefreshCw, Save, Trash2, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { soundEffects } from '../../services/soundEffects';
import { storageService } from '../../services/storageService';
import { GradeLevel, PartOfSpeech, ReadingPassage, WordCategory, WordItem } from '../../types';

interface TeacherDashboardProps {
  words: WordItem[];
  passages: ReadingPassage[];
  onWordsUpdated: (words: WordItem[]) => void;
  onPassagesUpdated: (passages: ReadingPassage[]) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  words,
  passages,
  onWordsUpdated,
  onPassagesUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'words' | 'addWord' | 'addStory' | 'data'>('words');

  // Form State for Adding / Editing Word
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [wordForm, setWordForm] = useState<Partial<WordItem>>({
    word: '',
    phonetic: '',
    partOfSpeech: 'noun',
    grade: 'P4',
    category: 'Ancient Egypt & Heritage',
    arabic: '',
    arabicPlural: '',
    definitionEn: '',
    definitionAr: '',
    exampleEn: '',
    exampleAr: '',
    pronunciationTip: '',
    iconName: 'pyramid',
  });

  // Story Form State
  const [storyForm, setStoryForm] = useState({
    titleEn: '',
    titleAr: '',
    grade: 'P4' as GradeLevel,
    category: 'Ancient Egypt & Heritage' as WordCategory,
    readingLevel: 'Primary 4 Connect',
    summary: '',
    paragraphs: ['', '', ''],
    q1: { questionEn: '', questionAr: '', opt1: '', opt2: '', correct: 0 },
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Authenticate PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = storageService.getTeacherPin();
    if (pinInput.trim() === correctPin || pinInput.trim() === '1234') {
      soundEffects.playSuccess();
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      soundEffects.playTryAgain();
      setPinError(true);
    }
  };

  // Save new or edited word
  const handleSaveWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordForm.word || !wordForm.arabic) {
      alert('Please provide at least the English word and Arabic translation.');
      return;
    }

    const newWord: WordItem = {
      id: editingWordId || `custom-${Date.now()}`,
      word: wordForm.word.trim().toLowerCase(),
      phonetic: wordForm.phonetic?.trim() || `/${wordForm.word.trim().toLowerCase()}/`,
      partOfSpeech: (wordForm.partOfSpeech as PartOfSpeech) || 'noun',
      grade: (wordForm.grade as GradeLevel) || 'P4',
      category: (wordForm.category as WordCategory) || 'School & Classroom',
      arabic: wordForm.arabic.trim(),
      arabicPlural: wordForm.arabicPlural?.trim() || undefined,
      definitionEn: wordForm.definitionEn?.trim() || 'A useful vocabulary word.',
      definitionAr: wordForm.definitionAr?.trim() || 'كلمة مفيدة في المنهج.',
      exampleEn: wordForm.exampleEn?.trim() || `We practice using ${wordForm.word} in class.`,
      exampleAr: wordForm.exampleAr?.trim() || `نتدرب على استخدام الكلمة في الصف.`,
      pronunciationTip: wordForm.pronunciationTip?.trim() || undefined,
      iconName: wordForm.iconName?.trim() || 'book-open',
      isCustom: true,
    };

    storageService.addWord(newWord);
    onWordsUpdated(storageService.getWords());
    soundEffects.playSuccess();
    showNotification(editingWordId ? 'Word updated successfully!' : 'New vocabulary word added!');

    // Reset Form
    setEditingWordId(null);
    setWordForm({
      word: '',
      phonetic: '',
      partOfSpeech: 'noun',
      grade: 'P4',
      category: 'Ancient Egypt & Heritage',
      arabic: '',
      arabicPlural: '',
      definitionEn: '',
      definitionAr: '',
      exampleEn: '',
      exampleAr: '',
      pronunciationTip: '',
      iconName: 'book-open',
    });
    setActiveTab('words');
  };

  // Start Editing
  const startEditWord = (w: WordItem) => {
    setEditingWordId(w.id);
    setWordForm(w);
    setActiveTab('addWord');
  };

  // Delete Word
  const handleDeleteWord = (id: string) => {
    if (confirm('Are you sure you want to delete this word from the curriculum?')) {
      storageService.deleteWord(id);
      onWordsUpdated(storageService.getWords());
      soundEffects.playPop();
      showNotification('Word deleted.');
    }
  };

  // Save new Reading Passage
  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.titleEn || !storyForm.titleAr) {
      alert('Please fill out the English and Arabic story titles.');
      return;
    }

    const filteredParagraphs = storyForm.paragraphs.filter((p) => p.trim().length > 0);
    if (filteredParagraphs.length === 0) {
      alert('Please add at least one story paragraph.');
      return;
    }

    const newPassage: ReadingPassage = {
      id: `story-${Date.now()}`,
      titleEn: storyForm.titleEn.trim(),
      titleAr: storyForm.titleAr.trim(),
      grade: storyForm.grade,
      category: storyForm.category,
      readingLevel: storyForm.readingLevel,
      summary: storyForm.summary.trim() || 'A reading passage designed for primary pupils.',
      paragraphs: filteredParagraphs,
      vocabularyIds: [],
      comprehensionQuestions: [
        {
          id: `q-${Date.now()}`,
          questionEn: storyForm.q1.questionEn || 'What was the main idea of this story?',
          questionAr: storyForm.q1.questionAr || 'ما هي الفكرة الرئيسية في القصة؟',
          options: [
            storyForm.q1.opt1 || 'Correct answer',
            storyForm.q1.opt2 || 'Another answer',
          ],
          correctIndex: 0,
        },
      ],
      isCustom: true,
    };

    storageService.addPassage(newPassage);
    onPassagesUpdated(storageService.getPassages());
    soundEffects.playSuccess();
    showNotification('New reading story created!');
    setActiveTab('words');
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonStr = storageService.exportCurriculumJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nilekids-curriculum-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundEffects.playSuccess();
    showNotification('Curriculum downloaded successfully!');
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importCurriculumJson(content);
      if (res.success) {
        onWordsUpdated(storageService.getWords());
        onPassagesUpdated(storageService.getPassages());
        soundEffects.playFanfare();
        showNotification(res.message);
      } else {
        alert(`Import failed: ${res.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Reset
  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset to the standard Egyptian Primary Curriculum? Any custom words will be restored to defaults.')) {
      storageService.resetToDefaults();
      onWordsUpdated(storageService.getWords());
      onPassagesUpdated(storageService.getPassages());
      soundEffects.playSuccess();
      showNotification('Restored Egyptian Primary Curriculum defaults.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-white border-2 border-amber-200 shadow-sm text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          Teacher & Parent Dashboard
        </h2>
        <p className="text-xs text-slate-500 font-arabic mt-1 mb-6">
          لوحة تحكم المعلم وولي الأمر لإضافة الوحدات والكلمات والقصص المخصصة
        </p>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN (Default: 1234)"
              className="w-full text-center text-lg font-black tracking-widest py-3 rounded-2xl border-2 border-amber-300 focus:outline-none focus:border-blue-600 shadow-2xs"
            />
            {pinError && (
              <p className="text-xs text-rose-600 font-bold mt-1">
                Incorrect PIN. Default is 1234.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition tap-active flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Dashboard / دخول</span>
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          Default safety PIN is <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold">1234</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Teacher & Admin Portal
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-0.5">
            Curriculum Manager / إدارة المنهج
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Total active vocabulary: <strong>{words.length}</strong> words | Reading passages: <strong>{passages.length}</strong>
          </p>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
        >
          Lock / خروج
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('words')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition tap-active border ${
            activeTab === 'words'
              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Vocabulary List ({words.length})
        </button>
        <button
          onClick={() => {
            setEditingWordId(null);
            setActiveTab('addWord');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition tap-active border ${
            activeTab === 'addWord'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{editingWordId ? 'Edit Word' : 'Add New Word'}</span>
        </button>
        <button
          onClick={() => setActiveTab('addStory')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition tap-active border ${
            activeTab === 'addStory'
              ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Custom Story</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition tap-active border ${
            activeTab === 'data'
              ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Backup & Sync</span>
        </button>
      </div>

      {/* Tab 1: Vocabulary List Table */}
      {activeTab === 'words' && (
        <div className="rounded-3xl bg-white border-2 border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Word</th>
                  <th className="py-3 px-4">Arabic</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {words.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 capitalize">
                      {w.word}
                    </td>
                    <td className="py-3 px-4 font-arabic font-bold text-emerald-800 text-sm">
                      {w.arabic}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">
                        {w.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-[150px]">
                      {w.category}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => startEditWord(w)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWord(w.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Add / Edit Word Form */}
      {activeTab === 'addWord' && (
        <form onSubmit={handleSaveWord} className="rounded-3xl bg-white border-2 border-emerald-200 p-5 sm:p-7 shadow-xs space-y-4">
          <h3 className="text-lg font-black text-slate-900">
            {editingWordId ? 'Edit Vocabulary Word' : 'Add New Egyptian Curriculum Word'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                English Word *
              </label>
              <input
                type="text"
                required
                value={wordForm.word || ''}
                onChange={(e) => setWordForm({ ...wordForm, word: e.target.value })}
                placeholder="e.g. papyrus"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-arabic">
                Arabic Meaning (with Tashkeel) *
              </label>
              <input
                type="text"
                required
                dir="rtl"
                value={wordForm.arabic || ''}
                onChange={(e) => setWordForm({ ...wordForm, arabic: e.target.value })}
                placeholder="e.g. وَرَقُ الْبَرْدِيِّ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-arabic font-bold text-right focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phonetic Transcription
              </label>
              <input
                type="text"
                value={wordForm.phonetic || ''}
                onChange={(e) => setWordForm({ ...wordForm, phonetic: e.target.value })}
                placeholder="e.g. /pəˈpaɪ.rəs/"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-arabic">
                Arabic Plural (جَمْعٌ - اختياري)
              </label>
              <input
                type="text"
                dir="rtl"
                value={wordForm.arabicPlural || ''}
                onChange={(e) => setWordForm({ ...wordForm, arabicPlural: e.target.value })}
                placeholder="e.g. أَهْرَامَات"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-arabic text-right focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grade Level
              </label>
              <select
                value={wordForm.grade}
                onChange={(e) => setWordForm({ ...wordForm, grade: e.target.value as GradeLevel })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="P1">Primary 1</option>
                <option value="P2">Primary 2</option>
                <option value="P3">Primary 3</option>
                <option value="P4">Primary 4</option>
                <option value="P5">Primary 5</option>
                <option value="P6">Primary 6</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category / Unit Theme
              </label>
              <select
                value={wordForm.category}
                onChange={(e) => setWordForm({ ...wordForm, category: e.target.value as WordCategory })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="spellingbee2026/2027">🐝 Spelling Bee 2026/2027</option>
                <option value="Ancient Egypt & Heritage">Ancient Egypt & Heritage</option>
                <option value="School & Classroom">School & Classroom</option>
                <option value="Animals & Nature">Animals & Nature</option>
                <option value="Food & Egyptian Dishes">Food & Egyptian Dishes</option>
                <option value="Family & Friends">Family & Friends</option>
                <option value="Jobs & Community">Jobs & Community</option>
                <option value="Places & Cities">Places & Cities</option>
                <option value="Science & Wonders">Science & Wonders</option>
                <option value="Feelings & Actions">Feelings & Actions</option>
                <option value="Daily Routine & Time">Daily Routine & Time</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              English Definition
            </label>
            <input
              type="text"
              value={wordForm.definitionEn || ''}
              onChange={(e) => setWordForm({ ...wordForm, definitionEn: e.target.value })}
              placeholder="Child-friendly definition in English..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-arabic">
              Arabic Definition / تعريف باللغة العربية
            </label>
            <input
              type="text"
              dir="rtl"
              value={wordForm.definitionAr || ''}
              onChange={(e) => setWordForm({ ...wordForm, definitionAr: e.target.value })}
              placeholder="تعريف الكلمة المبسط للتلميذ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-arabic text-right focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Example Sentence (English)
              </label>
              <input
                type="text"
                value={wordForm.exampleEn || ''}
                onChange={(e) => setWordForm({ ...wordForm, exampleEn: e.target.value })}
                placeholder="e.g. Ancient Egyptians wrote on papyrus."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-arabic">
                Example Sentence (Arabic)
              </label>
              <input
                type="text"
                dir="rtl"
                value={wordForm.exampleAr || ''}
                onChange={(e) => setWordForm({ ...wordForm, exampleAr: e.target.value })}
                placeholder="e.g. كتب قدماء المصريين على ورق البردي."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-arabic text-right focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition tap-active flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{editingWordId ? 'Save Changes' : 'Save Vocabulary Word'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('words')}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Add Custom Story */}
      {activeTab === 'addStory' && (
        <form onSubmit={handleSaveStory} className="rounded-3xl bg-white border-2 border-purple-200 p-5 sm:p-7 shadow-xs space-y-4">
          <h3 className="text-lg font-black text-slate-900">
            Create Custom Reading Story / إضافة قصة قراءة
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Story Title (English) *
              </label>
              <input
                type="text"
                required
                value={storyForm.titleEn}
                onChange={(e) => setStoryForm({ ...storyForm, titleEn: e.target.value })}
                placeholder="e.g. A Visit to Luxor Temple"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-arabic">
                Story Title (Arabic) *
              </label>
              <input
                type="text"
                required
                dir="rtl"
                value={storyForm.titleAr}
                onChange={(e) => setStoryForm({ ...storyForm, titleAr: e.target.value })}
                placeholder="e.g. زيارة إلى معبد الأقصر"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-arabic font-bold text-right focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Paragraph 1 (Main story text in English) *
            </label>
            <textarea
              rows={3}
              required
              value={storyForm.paragraphs[0]}
              onChange={(e) => {
                const p = [...storyForm.paragraphs];
                p[0] = e.target.value;
                setStoryForm({ ...storyForm, paragraphs: p });
              }}
              placeholder="Write the first paragraph. Every word will be clickable for pronunciation!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Paragraph 2 (Optional)
            </label>
            <textarea
              rows={3}
              value={storyForm.paragraphs[1]}
              onChange={(e) => {
                const p = [...storyForm.paragraphs];
                p[1] = e.target.value;
                setStoryForm({ ...storyForm, paragraphs: p });
              }}
              placeholder="Second paragraph..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition tap-active flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Publish Reading Story</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Backup, Export & Reset */}
      {activeTab === 'data' && (
        <div className="rounded-3xl bg-white border-2 border-amber-200 p-5 sm:p-7 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Curriculum Data Backup & Import
            </h3>
            <p className="text-xs text-slate-500 font-arabic mt-0.5">
              تصدير المنهج كملف ومشاركته مع الزملاء أو استرجاع النسخة الأساسية للمنهج المصري
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                Export Curriculum JSON
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Download all vocabulary words, stories, and irregular verbs as an offline JSON backup.
              </p>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition tap-active"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON</span>
              </button>
            </div>

            {/* Import */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                Import Curriculum JSON
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Load a previously exported curriculum file with custom units.
              </p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition tap-active cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Choose File to Import</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Restore Defaults */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-700">
                Restore Egyptian Primary Connect Defaults
              </h4>
              <p className="text-[11px] text-slate-500 font-arabic">
                استرجاع قائمة الكلمات والقصص الافتراضية المعتمدة للمرحلة الابتدائية
              </p>
            </div>
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition tap-active"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
