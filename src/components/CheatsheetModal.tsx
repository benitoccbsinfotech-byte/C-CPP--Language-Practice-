import React, { useState } from 'react';
import { C_CHEATSHEET_TOPICS } from '../data/cCheatsheet';
import { CPP_CHEATSHEET_TOPICS } from '../data/cppCheatsheet';
import { BookOpen, Search, Copy, Check, Info, Code2 } from 'lucide-react';
import { CourseId } from '../types';

interface CheatsheetModalProps {
  onInsertSnippet?: (code: string) => void;
  activeCourseId?: CourseId;
}

export const CheatsheetModal: React.FC<CheatsheetModalProps> = ({ onInsertSnippet, activeCourseId = 'c' }) => {
  const [selectedCourse, setSelectedCourse] = useState<CourseId>(activeCourseId);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const topicsList = selectedCourse === 'cpp' ? CPP_CHEATSHEET_TOPICS : C_CHEATSHEET_TOPICS;

  const filteredTopics = topicsList.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {selectedCourse === 'cpp' ? 'C++ Reference & STL Cheatsheet' : 'C Reference & Cheatsheet'}
            </h2>
            <p className="text-xs text-slate-400">
              {selectedCourse === 'cpp'
                ? 'Streams I/O, references, classes, operator overloading, STL containers & smart pointers'
                : 'Syntax patterns, format specifiers, pointer semantics, heap memory, and idioms'}
            </p>
          </div>
        </div>

        {/* Course Toggle & Search */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedCourse('c')}
              className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                selectedCourse === 'c'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              C Language
            </button>
            <button
              onClick={() => setSelectedCourse('cpp')}
              className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                selectedCourse === 'cpp'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Modern C++
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="cheatsheet-search"
              type="text"
              placeholder="Search syntax, classes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Topics Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950">
        {filteredTopics.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No reference topics found matching &quot;{search}&quot;.</div>
        ) : (
          filteredTopics.map((topic) => (
            <div key={topic.id} className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden space-y-3 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/40">
                    {topic.category}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{topic.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{topic.description}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(topic.id, topic.code)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold uppercase tracking-wider transition"
                  >
                    {copiedId === topic.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === topic.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  {onInsertSnippet && (
                    <button
                      onClick={() => onInsertSnippet(topic.code)}
                      className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider transition shadow-sm"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Use In Editor</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Code Snippet Box */}
              <pre className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800 leading-relaxed selection:bg-emerald-500/30">
                {topic.code}
              </pre>

              {/* Notes */}
              {topic.notes && topic.notes.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-1.5 text-xs text-amber-300">
                  <div className="font-bold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span className="uppercase tracking-wider text-[10px]">Important Notes:</span>
                  </div>
                  <ul className="pl-4 list-disc space-y-1 text-amber-200/90 text-[11px]">
                    {topic.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
