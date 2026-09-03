import React, { useState, useRef, useEffect } from 'react';
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
  Keyboard,
  Save,
  Info,
  X,
} from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChangeCode: (newCode: string) => void;
  stdin: string;
  onChangeStdin: (newStdin: string) => void;
  onRunCode: () => void;
  isRunning: boolean;
  sampleInputs?: string[];
  onSaveCode?: (code: string) => void;
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
  onSaveCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveToast, setSaveToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [showShortcutsTooltip, setShowShortcutsTooltip] = useState(false);
  const [showStdin, setShowStdin] = useState(true);
  const [fontSize, setFontSize] = useState<'text-xs' | 'text-sm' | 'text-base'>('text-xs');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shortcutsTooltipRef = useRef<HTMLDivElement>(null);

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKeySymbol = isMac ? '⌘' : 'Ctrl';

  // Close shortcuts tooltip on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        shortcutsTooltipRef.current &&
        !shortcutsTooltipRef.current.contains(e.target as Node)
      ) {
        setShowShortcutsTooltip(false);
      }
    };
    if (showShortcutsTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShortcutsTooltip]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveLocally = () => {
    try {
      localStorage.setItem('c_code_saved_locally_draft', code);
      localStorage.setItem('c_code_saved_locally_time', new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Failed to save code locally:', err);
    }
    if (onSaveCode) {
      onSaveCode(code);
    }
    setSaved(true);
    setSaveToast({ show: true, message: `Code saved locally! (${modKeySymbol}+S)` });
    setTimeout(() => setSaved(false), 2000);
    setTimeout(() => setSaveToast({ show: false, message: '' }), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to Run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRunCode();
      return;
    }

    // Ctrl+S or Cmd+S to Save Locally
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      handleSaveLocally();
      return;
    }

    // Ctrl+/ or Cmd+/ to toggle line comment
    if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.code === 'Slash')) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const lines = code.split('\n');

      let currentPos = 0;
      let startLineIdx = 0;
      let endLineIdx = 0;

      for (let i = 0; i < lines.length; i++) {
        const lineLen = lines[i].length + 1;
        if (currentPos <= start && start < currentPos + lineLen) {
          startLineIdx = i;
        }
        if (currentPos <= end && end <= currentPos + lineLen) {
          endLineIdx = i;
        }
        currentPos += lineLen;
      }

      const targetLines = lines.slice(startLineIdx, endLineIdx + 1);
      const allCommented = targetLines.every((l) => l.trimStart().startsWith('//'));

      const newLines = [...lines];
      for (let i = startLineIdx; i <= endLineIdx; i++) {
        if (allCommented) {
          newLines[i] = newLines[i].replace(/^(\s*)\/\/\s?/, '$1');
        } else {
          newLines[i] = '// ' + newLines[i];
        }
      }

      const updatedCode = newLines.join('\n');
      onChangeCode(updatedCode);
      return;
    }

    // Tab key inserts 4 spaces or dedents with Shift+Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Dedent 4 spaces
        const before = code.substring(0, start);
        const after = code.substring(end);
        const lineStart = before.lastIndexOf('\n') + 1;
        const currentLine = code.substring(lineStart, end);
        if (currentLine.startsWith('    ')) {
          const newCode = code.substring(0, lineStart) + currentLine.substring(4) + after;
          onChangeCode(newCode);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - 4);
          }, 0);
        }
      } else {
        // Indent 4 spaces
        const newCode = code.substring(0, start) + '    ' + code.substring(end);
        onChangeCode(newCode);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      }
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
          {/* Quick Shortcut Hint Pill */}
          <span className="hidden xl:inline-block text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800/60">
            {modKeySymbol}+Enter to run · {modKeySymbol}+S to save
          </span>

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

          {/* Save Locally Button */}
          <button
            id="btn-save-code-local"
            onClick={handleSaveLocally}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
            title={`Save code locally (${modKeySymbol}+S)`}
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span className="text-xs hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Copy Button */}
          <button
            id="btn-copy-code"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
            title="Copy source code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-xs hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Keyboard Shortcuts Tooltip & Popover */}
          <div className="relative" ref={shortcutsTooltipRef}>
            <button
              id="btn-editor-shortcuts"
              type="button"
              onClick={() => setShowShortcutsTooltip(!showShortcutsTooltip)}
              title="Keyboard Shortcuts Guide"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer ${
                showShortcutsTooltip
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-medium">Shortcuts</span>
            </button>

            {showShortcutsTooltip && (
              <div
                id="popover-editor-shortcuts"
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-slate-950 border border-slate-800 p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white">Keyboard Shortcuts</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowShortcutsTooltip(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">Run Program</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-mono text-[11px] font-bold shadow-sm">
                      {modKeySymbol} + Enter
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">Save Code Locally</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-mono text-[11px] font-bold shadow-sm">
                      {modKeySymbol} + S
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">Indent Code</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px] font-bold shadow-sm">
                      Tab
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">Unindent Code</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px] font-bold shadow-sm">
                      Shift + Tab
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">Toggle Line Comment</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px] font-bold shadow-sm">
                      {modKeySymbol} + /
                    </kbd>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Saves to local browser storage</span>
                  <span>{isMac ? 'macOS bindings' : 'Win / Linux'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative flex overflow-hidden bg-slate-950">
        {/* Floating Save Toast */}
        {saveToast.show && (
          <div
            id="toast-code-saved"
            className="absolute bottom-3 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/60 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{saveToast.message}</span>
          </div>
        )}
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
