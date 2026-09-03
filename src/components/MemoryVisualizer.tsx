import React, { useState } from 'react';
import { MemorySnapshot, StackFrameSnapshot, VariableSnapshot } from '../types';
import {
  BrainCircuit,
  Layers,
  ArrowRight,
  Play,
  SkipBack,
  SkipForward,
  Info,
  Hash,
  Binary,
  Code2,
} from 'lucide-react';

interface MemoryVisualizerProps {
  snapshots: MemorySnapshot[];
}

export const MemoryVisualizer: React.FC<MemoryVisualizerProps> = ({ snapshots }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 space-y-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Interactive C Memory & Stack Inspector</h3>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Run any C program with variables, pointers, or arrays to inspect its live stack frames, hexadecimal memory addresses, and pointer dereferences in real time.
          </p>
        </div>
      </div>
    );
  }

  const activeSnapshot = snapshots[Math.min(currentStep, snapshots.length - 1)];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 overflow-hidden shadow-lg shadow-black/20">
      {/* Top Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="font-bold text-white text-xs uppercase tracking-wider">Memory Model</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            Step {currentStep + 1} of {snapshots.length}
          </span>
        </div>

        {/* Step controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-memory-prev"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 transition"
            title="Step Back"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Step range slider */}
          <input
            id="slider-memory-step"
            type="range"
            min={0}
            max={snapshots.length - 1}
            value={currentStep}
            onChange={(e) => setCurrentStep(parseInt(e.target.value, 10))}
            aria-label="Memory execution step slider"
            className="w-24 sm:w-36 accent-emerald-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
          />

          <button
            id="btn-memory-next"
            disabled={currentStep >= snapshots.length - 1}
            onClick={() => setCurrentStep((prev) => Math.min(snapshots.length - 1, prev + 1))}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 transition"
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Current statement banner */}
      {activeSnapshot.codeSnippet && (
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-300">
            <span className="text-slate-500 font-sans text-[10px] font-bold uppercase tracking-wider">Statement:</span>
            <code className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-emerald-300 font-bold">
              {activeSnapshot.codeSnippet}
            </code>
          </div>
          {activeSnapshot.stdout && (
            <span className="text-[11px] text-slate-300 font-mono hidden md:inline">
              stdout: {activeSnapshot.stdout.replace(/\n/g, ' ')}
            </span>
          )}
        </div>
      )}

      {/* Stack Frames & Memory Blocks */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-950">
        {activeSnapshot.stackFrames.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No active stack frames at this step.</div>
        ) : (
          activeSnapshot.stackFrames.map((frame: StackFrameSnapshot, fIdx: number) => (
            <div
              key={fIdx}
              className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg"
            >
              {/* Frame Header */}
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-white font-mono text-xs">
                    Stack Frame: <span className="text-emerald-400">{frame.functionName}()</span>
                  </span>
                </div>
                <span className="text-[9px] uppercase font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                  {frame.variables.length} Variable(s)
                </span>
              </div>

              {/* Variables Grid */}
              <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {frame.variables.map((v: VariableSnapshot, vIdx: number) => {
                  const isArray = Array.isArray(v.value);
                  const isPointer = v.isPointer || v.type.includes('*');

                  return (
                    <div
                      key={vIdx}
                      className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                        isPointer
                          ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                          : isArray
                          ? 'bg-indigo-950/20 border-indigo-800/40 text-indigo-200'
                          : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    >
                      {/* Variable Header: Type & Name */}
                      <div className="flex items-center justify-between font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[10px]">{v.type}</span>
                          <span className="font-bold text-white text-xs">{v.name}</span>
                          {v.isParam && (
                            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-sans">
                              param
                            </span>
                          )}
                        </div>

                        {/* Hex Memory Address */}
                        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400/90 bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-800">
                          <Hash className="w-2.5 h-2.5" />
                          <span>{v.address}</span>
                        </div>
                      </div>

                      {/* Value Display */}
                      <div className="pt-1">
                        {isArray ? (
                          /* Array Elements Contiguous View */
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 block font-sans">Contiguous Array:</span>
                            <div className="flex flex-wrap gap-1 font-mono text-xs">
                              {(v.value as any[]).map((elem, idx) => (
                                <div
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 flex items-center gap-1"
                                >
                                  <span className="text-[9px] text-slate-500">[{idx}]:</span>
                                  <span className="font-bold text-emerald-300">
                                    {elem === '\0' ? '\\0' : String(elem)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : isPointer ? (
                          /* Pointer with Target Address & Arrow */
                          <div className="space-y-1.5 font-mono text-xs">
                            <div className="flex items-center gap-1.5 text-amber-300">
                              <span>Points to:</span>
                              <span className="bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/60 font-bold">
                                {v.pointsToAddress || v.value || 'NULL'}
                              </span>
                            </div>
                            <div className="text-[10px] text-amber-400/80 font-sans flex items-center gap-1">
                              <ArrowRight className="w-3 h-3" />
                              <span>Dereferencing *{v.name} reads this address</span>
                            </div>
                          </div>
                        ) : (
                          /* Standard Primitive Value */
                          <div className="flex items-center justify-between font-mono text-xs bg-slate-900 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-400 text-[10px] font-sans font-bold uppercase">Value:</span>
                            <span className="font-bold text-emerald-300 text-xs">{String(v.value)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Memory Architecture Tip */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2 shrink-0">
        <Info className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="text-[11px]">
          <strong className="text-slate-200">Memory Architecture:</strong> Stack memory allocates variables in contiguous local frames. Pointers store direct hexadecimal references to other memory addresses.
        </p>
      </div>
    </div>
  );
};
