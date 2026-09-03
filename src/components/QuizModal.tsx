import React, { useState } from 'react';
import { C_QUIZ_QUESTIONS } from '../data/cQuiz';
import { CPP_QUIZ_QUESTIONS } from '../data/cppQuiz';
import { Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowRight, HelpCircle, Award } from 'lucide-react';
import { User, CourseId } from '../types';

interface QuizModalProps {
  currentUser?: User;
  onQuizComplete?: (score: number, total: number) => void;
  activeCourseId?: CourseId;
}

export const QuizModal: React.FC<QuizModalProps> = ({ currentUser, onQuizComplete, activeCourseId = 'c' }) => {
  const [selectedCourse, setSelectedCourse] = useState<CourseId>(activeCourseId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showSummary, setShowSummary] = useState(false);

  const questionsList = selectedCourse === 'cpp' ? CPP_QUIZ_QUESTIONS : C_QUIZ_QUESTIONS;

  const currentQ = questionsList[currentIndex] || questionsList[0];
  const userSelected = selectedAnswers[currentIndex];
  const isAnswered = userSelected !== undefined;

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered) return; // Prevent changing after answering
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questionsList.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleFinishQuiz = () => {
    const score = calculateScore();
    setShowSummary(true);
    if (onQuizComplete) {
      onQuizComplete(score, questionsList.length);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowSummary(false);
  };

  const handleCourseSwitch = (newCourse: CourseId) => {
    setSelectedCourse(newCourse);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowSummary(false);
  };

  const totalScore = calculateScore();
  const percentage = Math.round((totalScore / questionsList.length) * 100);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 overflow-hidden shadow-lg shadow-black/20">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
            selectedCourse === 'cpp'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {selectedCourse === 'cpp' ? 'C++ OOP & STL Mastery Quiz' : 'C Concept & Mastery Quiz'}
            </h2>
            <p className="text-xs text-slate-400">
              {selectedCourse === 'cpp'
                ? 'Classes, destructors, references, STL vector reallocation & smart pointers'
                : 'Pointers, memory layout, operator precedence, and UB pitfalls'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Course Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => handleCourseSwitch('c')}
              className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                selectedCourse === 'c'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              C Quiz
            </button>
            <button
              onClick={() => handleCourseSwitch('cpp')}
              className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                selectedCourse === 'cpp'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              C++ Quiz
            </button>
          </div>

          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
            selectedCourse === 'cpp'
              ? 'text-blue-400 bg-blue-950/80 border-blue-800/60'
              : 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60'
          }`}>
            Q {currentIndex + 1} / {questionsList.length}
          </span>
          <button
            onClick={handleResetQuiz}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
            title="Restart Quiz"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full space-y-4 custom-scrollbar bg-slate-950">
        {showSummary ? (
          /* Final Score Summary Screen */
          <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${
              selectedCourse === 'cpp'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Quiz Completed!</h3>
            <div className={`text-4xl font-black font-mono ${
              selectedCourse === 'cpp' ? 'text-blue-400' : 'text-emerald-400'
            }`}>
              {totalScore} / {questionsList.length}
              <span className="text-base text-slate-400 font-normal ml-2">({percentage}%)</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {percentage >= 80
                ? `Outstanding! You have a solid grasp of core ${selectedCourse === 'cpp' ? 'C++ and OOP' : 'C programming'} concepts.`
                : `Great practice! Review the explanations for any missed questions to solidify your foundations.`}
            </p>
            <button
              onClick={handleResetQuiz}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg ${
                selectedCourse === 'cpp'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              Retake Quiz
            </button>
          </div>
        ) : (
          /* Active Question Card */
          <div className="space-y-4">
            {/* Question Text */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-md border ${
                  selectedCourse === 'cpp'
                    ? 'bg-blue-950 text-blue-400 border-blue-800/60'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                }`}>
                  {currentQ.category}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{currentQ.question}</h3>

              {/* Code Snippet if present */}
              {currentQ.codeSnippet && (
                <pre className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800">
                  {currentQ.codeSnippet}
                </pre>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((option, optIdx) => {
                const isCorrect = optIdx === currentQ.correctIndex;
                const isSelectedByUser = userSelected === optIdx;

                let optionStyles = 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-200';

                if (isAnswered) {
                  if (isCorrect) {
                    optionStyles = selectedCourse === 'cpp'
                      ? 'bg-blue-950/40 border-blue-600 text-blue-200'
                      : 'bg-emerald-950/40 border-emerald-600 text-emerald-200';
                  } else if (isSelectedByUser) {
                    optionStyles = 'bg-rose-950/40 border-rose-600 text-rose-200';
                  } else {
                    optionStyles = 'opacity-40 bg-slate-900 border-slate-800 text-slate-400';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isAnswered}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition flex items-center justify-between gap-3 ${optionStyles}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[11px] text-slate-400 shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isAnswered && (
                      <div>
                        {isCorrect && (
                          <CheckCircle2 className={`w-4 h-4 ${selectedCourse === 'cpp' ? 'text-blue-400' : 'text-emerald-400'}`} />
                        )}
                        {isSelectedByUser && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box on answer */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className={`flex items-center gap-1.5 font-bold ${
                  selectedCourse === 'cpp' ? 'text-blue-400' : 'text-emerald-400'
                }`}>
                  <HelpCircle className="w-4 h-4" />
                  <span className="uppercase tracking-wider text-[10px]">Explanation:</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">{currentQ.explanation}</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider text-slate-300 transition"
              >
                Previous
              </button>

              {currentIndex < questionsList.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    selectedCourse === 'cpp'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  id="btn-finish-quiz"
                  onClick={handleFinishQuiz}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md ${
                    selectedCourse === 'cpp'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  Finish & View Score
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
