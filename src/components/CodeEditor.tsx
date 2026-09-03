import React, { useState, useRef } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileCode,
  CornerDownLeft,
} from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChangeCode: (newCode: string) => void;
  stdin: string;
  onChangeStdin: (newStdin: string) => void;
  onRunCode: () => void;
  isRunning: boolean;
  sampleInputs?: string[];
}

const C_BOILERPLATES = [
  {
    name: 'Basic I/O Template',
    code: `#include <stdio.h>

int main() {
    int n;
    printf("Enter a number: ");
    scanf("%d", &n);
    printf("You entered: %d\\n", n);
    return 0;
}`,
  },
  {
    name: 'Array & Loops',
    code: `#include <stdio.h>

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int size = sizeof(arr) / sizeof(arr[0]);
    
    for (int i = 0; i < size; i++) {
        printf("arr[%d] = %d\\n", i, arr[i]);
    }
    return 0;
}`,
  },
  {
    name: 'Pointer Swap Function',
    code: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 10, y = 20;
    printf("Before: x = %d, y = %d\\n", x, y);
    swap(&x, &y);
    printf("After:  x = %d, y = %d\\n", x, y);
    return 0;
}`,
  },
  {
    name: 'Struct Record',
    code: `#include <stdio.h>

struct Student {
    int id;
    float gpa;
};

int main() {
    struct Student s1 = {101, 3.85};
    printf("Student ID: %d | GPA: %.2f\\n", s1.id, s1.gpa);
    return 0;
} `,
  },
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChangeCode,
  stdin,
  onChangeStdin,
  onRunCode,
  isRunning,
  sampleInputs = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [showStdin, setShowStdin] = useState(true);
  const [fontSize, setFontSize] = useState<'text-xs' | 'text-sm' | 'text-base'>('text-xs');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to Run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRunCode();
      return;
    }

    // Tab key inserts 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onChangeCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 14) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
      {/* Editor Top Bento Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs shrink-0">
        <div className="flex items-center gap-3">
          {/* Traffic Light Dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs">
            <FileCode className="w-3.5 h-3.5" />
            <span className="font-bold">main.c</span>
          </div>

          {/* Boilerplate dropdown */}
          <select
            id="select-boilerplate"
            onChange={(e) => {
              const selected = C_BOILERPLATES.find((b) => b.name === e.target.value);
              if (selected) onChangeCode(selected.code);
            }}
            defaultValue=""
            aria-label="Select C code boilerplate template"
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 hidden sm:inline-block cursor-pointer"
          >
            <option value="" disabled>
              Insert Boilerplate...
            </option>
            {C_BOILERPLATES.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded-lg border border-slate-800 text-[10px] text-slate-400">
            <button
              onClick={() => setFontSize('text-xs')}
              className={`px-1.5 py-0.5 rounded ${fontSize === 'text-xs' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : ''}`}
            >
              12px
            </button>
            <button
              onClick={() => setFontSize('text-sm')}
              className={`px-1.5 py-0.5 rounded ${fontSize === 'text-sm' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : ''}`}
            >
              14px
            </button>
          </div>

          <button
            id="btn-copy-code"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
            title="Copy source code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative flex overflow-hidden bg-slate-950">
        {/* Line Numbers */}
        <div className="w-11 bg-slate-950 text-slate-600 font-mono text-xs select-none py-3 text-right pr-3 border-r border-slate-900 leading-6 shrink-0">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          id="c-code-textarea"
          ref={textareaRef}
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="C source code editor"
          className={`flex-1 w-full bg-slate-950 text-slate-100 font-mono ${fontSize} leading-6 p-3 focus:outline-none resize-none selection:bg-emerald-500/30 overflow-auto whitespace-pre`}
          placeholder="// Write your C program here..."
        />
      </div>

      {/* Custom Stdin Panel */}
      <div className="border-t border-slate-800 bg-slate-900 text-xs shrink-0">
        <div
          onClick={() => setShowStdin(!showStdin)}
          className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition select-none"
        >
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <CornerDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-slate-300">Standard Input (stdin):</span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">Values for scanf()</span>
          </div>

          <div className="flex items-center gap-2">
            {sampleInputs.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 hidden sm:inline">Test Presets:</span>
                {sampleInputs.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeStdin(sample);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-emerald-950/40 text-[10px] font-mono text-emerald-300 border border-slate-800 hover:border-emerald-800/60"
                  >
                    Input {idx + 1}
                  </button>
                ))}
              </div>
            )}
            {showStdin ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </div>
        </div>

        {showStdin && (
          <div className="p-3 pt-0 bg-slate-900">
            <textarea
              id="stdin-input-textarea"
              rows={2}
              value={stdin}
              onChange={(e) => onChangeStdin(e.target.value)}
              placeholder="e.g. 24 4500.50 A (space or newline delimited input values for scanf)"
              aria-label="Standard input stdin stream for scanf"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
