import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ExecutionResult, TestCase } from '../types';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
  Play,
  RotateCw,
  Cpu,
  Activity,
  Zap,
  HelpCircle,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { estimateBigOComplexity } from '../utils/complexityAnalyzer';

interface TerminalOutputProps {
  result: ExecutionResult | null;
  isRunning: boolean;
  onClear: () => void;
  onRunTestCases?: () => void;
  testCases?: TestCase[];
  code?: string;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  result,
  isRunning,
  onClear,
  onRunTestCases,
  testCases = [],
  code = '',
}) => {
  const [activeTab, setActiveTab] = useState<'console' | 'tests' | 'warnings'>('console');
  const [showComplexityModal, setShowComplexityModal] = useState(false);
  const complexityModalRef = useRef<HTMLDivElement>(null);

  const testResults = result?.testResults;
  const hasTests = testResults && testResults.total > 0;
  const warnings = result?.warnings || [];

  // Run static analysis helper to estimate Big O complexity
  const complexity = useMemo(() => {
    return estimateBigOComplexity(code);
  }, [code]);

  // Close complexity popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (complexityModalRef.current && !complexityModalRef.current.contains(event.target as Node)) {
        setShowComplexityModal(false);
      }
    };
    if (showComplexityModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showComplexityModal]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg shadow-black/20 text-xs">
      {/* Terminal Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 select-none shrink-0">
        {/* Left Tabs */}
        <div className="flex items-center gap-2">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <button
            id="tab-output-console"
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'console'
                ? 'bg-slate-950 text-emerald-400 border border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Stdout Terminal</span>
          </button>

          {testCases.length > 0 && (
            <button
              id="tab-output-tests"
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                activeTab === 'tests'
                  ? 'bg-slate-950 text-emerald-400 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {hasTests ? (
                testResults.failed === 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                )
              ) : (
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Test Suite</span>
              {hasTests && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    testResults.failed === 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                  }`}
                >
                  {testResults.passed}/{testResults.total}
                </span>
              )}
            </button>
          )}

          {warnings.length > 0 && (
            <button
              id="tab-output-warnings"
              onClick={() => setActiveTab('warnings')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                activeTab === 'warnings'
                  ? 'bg-slate-950 text-amber-300 border border-slate-800'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Warnings ({warnings.length})</span>
            </button>
          )}
        </div>

        {/* Right Tools & Metrics */}
        <div className="flex items-center gap-2.5">
          {/* Complexity Score Indicator next to Output Terminal */}
          <div className="relative" ref={complexityModalRef}>
            <button
              id="btn-complexity-score-indicator"
              onClick={() => setShowComplexityModal(!showComplexityModal)}
              title={`Estimated Big O Complexity: ${complexity.timeComplexity} (${complexity.label}). Click for static analysis breakdown`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition hover:scale-105 active:scale-95 shadow-sm cursor-pointer ${complexity.badgeBg} ${complexity.badgeBorder} ${complexity.badgeText}`}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-300 hidden md:inline">Complexity:</span>
              <span className="font-mono font-black text-xs">{complexity.timeComplexity}</span>
              <span className="text-[10px] opacity-75 hidden lg:inline font-sans font-normal">({complexity.label})</span>
            </button>

            {/* Complexity Score Static Analysis Popover */}
            {showComplexityModal && (
              <div
                id="popover-complexity-analysis"
                className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950 border border-slate-800 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-sans"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${complexity.badgeBg} ${complexity.badgeBorder} border flex items-center justify-center ${complexity.badgeText}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Complexity Score & Static Analysis</h4>
                      <p className="text-[10px] text-slate-400">Estimated Big O from submitted code structure</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowComplexityModal(false)}
                    className="text-slate-500 hover:text-slate-300 text-xs px-2 py-0.5 rounded hover:bg-slate-900"
                  >
                    ✕
                  </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <div className={`p-2.5 rounded-xl border ${complexity.badgeBg} ${complexity.badgeBorder}`}>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Time Complexity</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className={`text-base font-mono font-black ${complexity.badgeText}`}>{complexity.timeComplexity}</span>
                      <span className="text-[10px] text-slate-300 font-medium">({complexity.label})</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Space Complexity</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-base font-mono font-black text-cyan-400">{complexity.spaceComplexity}</span>
                      <span className="text-[10px] text-slate-400">Auxiliary</span>
                    </div>
                  </div>
                </div>

                {/* Efficiency Meter */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Algorithmic Rating:</span>
                    <span className={`font-mono font-bold ${complexity.badgeText}`}>{complexity.score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        complexity.score >= 80
                          ? 'bg-emerald-400'
                          : complexity.score >= 60
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                      style={{ width: `${complexity.score}%` }}
                    />
                  </div>
                </div>

                {/* Static Analysis Diagnostic Reasoning */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Static Analysis Verdict</span>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-sans">{complexity.reason}</p>
                </div>

                {/* Diagnostics List */}
                {complexity.diagnostics.length > 0 && (
                  <div className="mt-2.5 space-y-1 text-[10px] text-slate-400 font-mono">
                    {complexity.diagnostics.map((diag, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-emerald-400">›</span>
                        <span>{diag}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Big O Scale Reference Table */}
                <div className="mt-3 pt-2.5 border-t border-slate-800">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1.5">Big O Scale Reference:</span>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800/80">
                    <span className={complexity.timeComplexity === 'O(1)' ? 'text-emerald-400 font-bold' : ''}>O(1)</span>
                    <span>&lt;</span>
                    <span className={complexity.timeComplexity === 'O(log n)' ? 'text-emerald-400 font-bold' : ''}>O(log n)</span>
                    <span>&lt;</span>
                    <span className={complexity.timeComplexity === 'O(n)' ? 'text-cyan-400 font-bold' : ''}>O(n)</span>
                    <span>&lt;</span>
                    <span className={complexity.timeComplexity === 'O(n log n)' ? 'text-blue-400 font-bold' : ''}>O(n log n)</span>
                    <span>&lt;</span>
                    <span className={complexity.timeComplexity === 'O(n²)' ? 'text-amber-400 font-bold' : ''}>O(n²)</span>
                    <span>&lt;</span>
                    <span className={complexity.timeComplexity === 'O(2^n)' ? 'text-rose-400 font-bold' : ''}>O(2^n)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {onRunTestCases && testCases.length > 0 && (
            <button
              id="btn-run-tests"
              onClick={onRunTestCases}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider transition"
            >
              <RotateCw className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Validate Tests</span>
            </button>
          )}

          {result && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 hidden sm:flex">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{result.executionTimeMs} ms</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold border ${
                  result.exitCode === 0
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                    : 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                }`}
              >
                Exit {result.exitCode}
              </span>
            </div>
          )}

          <button
            id="btn-clear-terminal"
            onClick={onClear}
            title="Clear output"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-950 border border-transparent hover:border-slate-800 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Content Body */}
      <div className="flex-1 p-4 font-mono text-xs leading-6 overflow-y-auto custom-scrollbar bg-slate-950">
        {isRunning ? (
          <div className="flex items-center gap-2.5 text-emerald-400 p-4">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="font-bold">Compiling C source with GCC...</span>
          </div>
        ) : activeTab === 'tests' && hasTests ? (
          /* Test Suite Results */
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                {testResults.failed === 0 ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400" />
                )}
                <div>
                  <h4 className="font-bold text-white text-xs">
                    {testResults.failed === 0
                      ? 'All Test Cases Passed Successfully!'
                      : `${testResults.failed} Test Case(s) Failed`}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {testResults.passed} of {testResults.total} test cases satisfied program requirements.
                  </p>
                </div>
              </div>

              {/* Complexity Score pill in Test Results */}
              <button
                onClick={() => setShowComplexityModal(true)}
                title="View Big O Complexity analysis"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition hover:scale-105 cursor-pointer ${complexity.badgeBg} ${complexity.badgeBorder}`}
              >
                <Activity className={`w-3.5 h-3.5 ${complexity.badgeText}`} />
                <div className="text-right leading-tight hidden sm:block">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Complexity Score</span>
                  <span className={`text-xs font-mono font-bold ${complexity.badgeText}`}>
                    {complexity.timeComplexity} <span className="font-normal font-sans opacity-80">({complexity.label})</span>
                  </span>
                </div>
              </button>
            </div>

            <div className="space-y-2">
              {testResults.details.map((item, idx) => (
                <div
                  key={item.testId || idx}
                  className={`rounded-xl border p-3.5 text-xs space-y-2 font-mono ${
                    item.passed ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-rose-950/20 border-rose-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between font-sans">
                    <span className="font-bold text-slate-200 flex items-center gap-2">
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>
                        Test {idx + 1}: {item.description}
                      </span>
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-md font-bold border ${
                        item.passed
                          ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60'
                          : 'bg-rose-900/60 text-rose-300 border-rose-700/60'
                      }`}
                    >
                      {item.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>

                  {item.input && (
                    <div className="text-xs">
                      <span className="text-slate-500 font-sans block text-[10px] font-bold uppercase">Input (stdin):</span>
                      <pre className="bg-slate-900 p-2 rounded-lg text-emerald-300 border border-slate-800 mt-1">{item.input}</pre>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-sans block text-[10px] font-bold uppercase">Expected Output:</span>
                      <pre className="bg-slate-900 p-2 rounded-lg text-slate-200 whitespace-pre-wrap border border-slate-800 mt-1">
                        {item.expected}
                      </pre>
                    </div>
                    <div>
                      <span className="text-slate-500 font-sans block text-[10px] font-bold uppercase">Actual Output:</span>
                      <pre
                        className={`p-2 rounded-lg whitespace-pre-wrap border mt-1 ${
                          item.passed ? 'bg-slate-900 text-emerald-300 border-slate-800' : 'bg-rose-950/40 text-rose-300 border-rose-900/60'
                        }`}
                      >
                        {item.actual || '(no output)'}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'warnings' && warnings.length > 0 ? (
          /* Compiler Warnings */
          <div className="space-y-2">
            {warnings.map((w, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-300 text-xs font-mono">
                {w}
              </div>
            ))}
          </div>
        ) : result ? (
          /* Console Standard Output */
          <div className="space-y-2">
            {result.error && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs whitespace-pre-wrap">
                <div className="font-bold text-rose-200 mb-1 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Compilation / Runtime Error:</span>
                </div>
                {result.error}
              </div>
            )}

            {result.output ? (
              <pre className="text-slate-200 whitespace-pre-wrap selection:bg-emerald-500/30 font-mono">
                {result.output}
              </pre>
            ) : !result.error ? (
              <div className="text-emerald-400/80 italic font-mono flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Program executed successfully with exit status 0 (no stdout output).</span>
              </div>
            ) : null}
          </div>
        ) : (
          /* Empty Terminal Prompt */
          <div className="text-slate-500 space-y-1">
            <p className="text-slate-400 font-bold">GCC 11.4.0 (x86_64-pc-linux-gnu)</p>
            <p>Ready to compile. Press &quot;RUN CODE&quot; or press Ctrl+Enter to execute.</p>
          </div>
        )}
      </div>
    </div>
  );
};
