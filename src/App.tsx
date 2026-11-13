/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { OfflineBanner } from './components/common/OfflineBanner';
import { TabBar } from './components/common/TabBar';
import { DictionaryView } from './components/dictionary/DictionaryView';
import { GamesHub } from './components/games/GamesHub';
import { StudentProgressView } from './components/progress/StudentProgressView';
import { ReadingPassagesView } from './components/reading/ReadingPassagesView';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { IrregularVerbsView } from './components/verbs/IrregularVerbsView';
import { storageService } from './services/storageService';
import { ActiveTab, Badge, DailyReflection, GradeLevel, IrregularVerb, ReadingPassage, StudentProgress, WordItem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dictionary');
  const [words, setWords] = useState<WordItem[]>(() => storageService.getWords());
  const [passages, setPassages] = useState<ReadingPassage[]>(() => storageService.getPassages());
  const [verbs, setVerbs] = useState<IrregularVerb[]>(() => storageService.getVerbs());
  const [progress, setProgress] = useState<StudentProgress>(() => storageService.getProgress());
  const [badges, setBadges] = useState<Badge[]>(() => storageService.getBadges());
  const [isSlowAudio, setIsSlowAudio] = useState<boolean>(() => storageService.getSlowAudio());

  // Keep badges synced whenever progress changes
  useEffect(() => {
    setBadges(storageService.getBadges());
  }, [progress]);

  // Handlers
  const handleGradeChange = (newGrade: GradeLevel) => {
    storageService.setActiveGrade(newGrade);
    setProgress(storageService.getProgress());
  };

  const handleToggleFavorite = (wordId: string) => {
    storageService.toggleFavorite(wordId);
    setProgress(storageService.getProgress());
  };

  const handleToggleMastered = (wordId: string) => {
    const isCurrentlyMastered = progress.masteredWordIds.includes(wordId);
    const updated = storageService.setWordMastery(
      wordId,
      isCurrentlyMastered ? 'learning' : 'mastered'
    );
    setProgress(updated);
  };

  const handleCompletePassage = (passageId: string) => {
    const updated = storageService.recordCompletedPassage(passageId);
    setProgress(updated);
  };

  const handleGameScore = (game: 'wordMatch' | 'spellingBee' | 'pictureQuiz' | 'verbsDrill', score: number) => {
    const updated = storageService.recordGameScore(game, score);
    setProgress(updated);
  };

  const handleSaveReflection = (reflection: DailyReflection) => {
    const updated = storageService.saveDailyReflection(reflection);
    setProgress(updated);
  };

  const handleToggleAudioSpeed = () => {
    const nextVal = !isSlowAudio;
    setIsSlowAudio(nextVal);
    storageService.setSlowAudio(nextVal);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-800 flex flex-col font-sans selection:bg-amber-200">
      {/* Offline Status Alert Banner */}
      <OfflineBanner />

      {/* Primary Navigation Bar */}
      <Navbar
        activeGrade={progress.activeGrade}
        onGradeChange={handleGradeChange}
        stars={progress.stars}
        streak={progress.streakDays}
        isSlowAudio={isSlowAudio}
        onToggleAudioSpeed={handleToggleAudioSpeed}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-24">
        {activeTab === 'dictionary' && (
          <DictionaryView
            words={words}
            activeGrade={progress.activeGrade}
            onGradeChange={handleGradeChange}
            favoriteWordIds={progress.favoriteWordIds}
            masteredWordIds={progress.masteredWordIds}
            onToggleFavorite={handleToggleFavorite}
            onToggleMastered={handleToggleMastered}
            isSlowAudio={isSlowAudio}
          />
        )}

        {activeTab === 'reading' && (
          <ReadingPassagesView
            passages={passages}
            allWords={words}
            activeGrade={progress.activeGrade}
            favoriteWordIds={progress.favoriteWordIds}
            masteredWordIds={progress.masteredWordIds}
            completedPassageIds={progress.completedPassageIds}
            onToggleFavorite={handleToggleFavorite}
            onToggleMastered={handleToggleMastered}
            onCompletePassage={handleCompletePassage}
            isSlowAudio={isSlowAudio}
          />
        )}

        {activeTab === 'games' && (
          <GamesHub
            words={words.filter((w) => w.grade === progress.activeGrade || w.grade === 'P1' || w.grade === 'P2' || w.grade === 'P3' || w.grade === 'P4')}
            highScores={progress.gameHighScores}
            onUpdateHighScore={handleGameScore}
            isSlowAudio={isSlowAudio}
          />
        )}

        {activeTab === 'verbs' && (
          <IrregularVerbsView
            verbs={verbs}
            activeGrade={progress.activeGrade}
            onDrillScore={(score) => handleGameScore('verbsDrill', score)}
            isSlowAudio={isSlowAudio}
          />
        )}

        {activeTab === 'progress' && (
          <StudentProgressView
            progress={progress}
            badges={badges}
            allWords={words}
            activeGrade={progress.activeGrade}
            onGradeChange={handleGradeChange}
            onToggleFavorite={handleToggleFavorite}
            onSaveReflection={handleSaveReflection}
            isSlowAudio={isSlowAudio}
          />
        )}

        {activeTab === 'teacher' && (
          <TeacherDashboard
            words={words}
            passages={passages}
            onWordsUpdated={(newWords) => setWords(newWords)}
            onPassagesUpdated={(newPassages) => setPassages(newPassages)}
          />
        )}
      </main>

      {/* Bottom Sticky Tab Navigation */}
      <TabBar activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}
