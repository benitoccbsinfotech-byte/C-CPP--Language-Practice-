import React, { useState } from 'react';
import { PracticeProblem, User, SubmissionRecord } from '../types';
import {
  Lightbulb,
  AlertTriangle,
  Code,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  ArrowRight,
  Eye,
  EyeOff,
  Terminal,
  Send,
  Award,
  MessageSquare,
} from 'lucide-react';

interface ProblemDescriptionProps {
  problem: PracticeProblem;
  onApplyStarterCode: () => void;
  onApplySolutionCode: () => void;
  isSolved: boolean;
  currentUser?: User;
  onSubmitSolution?: () => void;
  isSubmitting?: boolean;
  lastSubmission?: SubmissionRecord;
}

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
  problem,
  onApplyStarterCode,
  onApplySolutionCode,
  isSolved,
  currentUser,
  onSubmitSolution,
  isSubmitting,
  lastSubmission,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-y-auto p-5 custom-scrollbar text-slate-200 shadow-lg shadow-black/20">
      {/* Title & Metadata */}
      <div className="space-y-3 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Instructions</span>
            </div>
            <span
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${
                problem.difficulty === 'Easy'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : problem.difficulty === 'Medium'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {problem.difficulty}
            </span>
            {problem.isCustom && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800/60 uppercase">
                Custom Lab
              </span>
            )}
          </div>

          {isSolved && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
              <CheckCircle2 className="w-3.5 h-3.5" />
              SOLVED
            </span>
          )}
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">{problem.title}</h2>
        <p className="text-xs text-slate-400 leading-relaxed">{problem.summary}</p>

        {/* Student Submission Status Badge if submitted */}
        {lastSubmission && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Classroom Submission Recorded</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">{lastSubmission.timestamp}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>Tests: <strong className="text-emerald-400 font-mono">{lastSubmission.passedTests}/{lastSubmission.totalTests}</strong></span>
              {lastSubmission.gradeScore !== undefined && (
                <span>Grade: <strong className="text-amber-400 font-mono">{lastSubmission.gradeScore}/100</strong></span>
              )}
            </div>
            {lastSubmission.feedback && (
              <div className="pt-1 border-t border-slate-800 text-[11px] text-purple-300 flex items-start gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-400" />
                <span><strong className="text-purple-200">Instructor Note:</strong> {lastSubmission.feedback}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Description */}
      <div className="py-4 space-y-4 text-xs leading-relaxed text-slate-300">
        <div className="whitespace-pre-line font-sans space-y-2 text-slate-300">
          {problem.description}
        </div>

        {/* Learning Takeaways (Bento style list with bullet rings) */}
        {problem.learningPoints.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
              Core Requirements & Guidelines
            </span>
            <ul className="space-y-2.5">
              {problem.learningPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-300">
                  <div className="w-4 h-4 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 text-[10px] font-bold">
                    ✓
                  </div>
                  <span className="text-xs leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Example Test Cases */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sample Test Cases</span>
          </span>

          <div className="space-y-2">
            {problem.testCases.map((tc, idx) => (
              <div key={tc.id} className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden text-xs">
                <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="text-slate-300 font-bold">Case {idx + 1}: {tc.description}</span>
                </div>
                <div className="p-3 space-y-2 font-mono text-[11px]">
                  {tc.input && (
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-sans font-bold">Input (stdin):</span>
                      <pre className="bg-slate-900 px-2.5 py-1.5 rounded-lg text-emerald-300 overflow-x-auto border border-slate-800 mt-1">
                        {tc.input}
                      </pre>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans font-bold">Expected Output (stdout):</span>
                    <pre className="bg-slate-900 px-2.5 py-1.5 rounded-lg text-slate-200 overflow-x-auto border border-slate-800 mt-1">
                      {tc.expectedOutput}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Solution Button */}
        {onSubmitSolution && (
          <div className="pt-1">
            <button
              id="btn-submit-solution-classroom"
              onClick={onSubmitSolution}
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-md ${
                isSubmitting
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Evaluating & Submitting...' : 'Submit Solution to Instructor'}</span>
            </button>
          </div>
        )}

        {/* Hints Toggle (Bento Card) */}
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 overflow-hidden">
          <button
            id="btn-toggle-hint"
            onClick={() => setShowHint(!showHint)}
            className="w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs font-bold text-amber-300 hover:bg-amber-900/20 transition"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Need a Hint?</span>
            </div>
            {showHint ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHint && (
            <div className="p-3.5 border-t border-amber-900/30 text-xs text-amber-200/90 bg-amber-950/30 leading-relaxed font-sans">
              {problem.hint}
            </div>
          )}
        </div>

        {/* Common Pitfalls in C */}
        {problem.commonPitfalls.length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Common C Pitfalls</span>
            </div>
            <ul className="space-y-1.5 pl-4 list-disc text-rose-200/90 text-xs">
              {problem.commonPitfalls.map((pitfall, idx) => (
                <li key={idx}>{pitfall}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Solution View & Actions */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button
              id="btn-reveal-solution"
              onClick={() => setShowSolution(!showSolution)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 transition"
            >
              {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showSolution ? 'Hide Solution' : 'View Reference Solution'}</span>
            </button>

            <button
              id="btn-reset-starter"
              onClick={onApplyStarterCode}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
            >
              Reset Starter Code
            </button>
          </div>

          {showSolution && (
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-emerald-400 text-[11px] font-bold">Standard C Solution:</span>
                <button
                  id="btn-apply-solution"
                  onClick={onApplySolutionCode}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black transition"
                >
                  Load into Editor
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-200 overflow-x-auto border border-slate-800 leading-relaxed">
                {problem.solutionCode}
              </pre>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 leading-relaxed">
                <strong className="text-slate-300">Explanation:</strong> {problem.explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
