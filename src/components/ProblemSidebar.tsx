import React, { useState } from 'react';
import { PracticeProblem, ProblemCategory, Difficulty, CourseId } from '../types';
import { Search, CheckCircle2, Circle, Filter, Tag, BookMarked, Code2, Layers } from 'lucide-react';

interface ProblemSidebarProps {
  problems: PracticeProblem[];
  selectedProblemId: string;
  onSelectProblem: (id: string) => void;
  solvedProblemIds: Set<string>;
  activeCourseId?: CourseId;
  onSelectCourse?: (courseId: CourseId) => void;
}

const CATEGORY_LABELS: Record<ProblemCategory, string> = {
  'basics-io': '1. Basics & I/O',
  'variables-data': '2. Variables & Types',
  operators: '3. Operators & Math',
  conditionals: '4. Conditionals',
  loops: '5. Loops & Sequences',
  'arrays-strings': '6. Arrays & Strings',
  functions: '7. Functions & Recursion',
  pointers: '8. Pointers & Memory',
  structs: '9. Structures (struct)',
  'classes-oop': '10. Classes & OOP',
  references: '11. References & Const',
  'stl-containers': '12. STL Containers',
  'smart-pointers': '13. Smart Pointers',
  templates: '14. Generics & Templates',
  custom: '15. Custom Instructor Labs',
};

export const ProblemSidebar: React.FC<ProblemSidebarProps> = ({
  problems,
  selectedProblemId,
  onSelectProblem,
  solvedProblemIds,
  activeCourseId,
  onSelectCourse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredProblems = problems.filter((p) => {
    // If course is active, filter by courseId (or custom if matching)
    if (activeCourseId) {
      if (p.courseId && p.courseId !== activeCourseId) return false;
    }

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <BookMarked className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Curriculum</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700/60">
            {filteredProblems.length} Topics
          </span>
        </div>

        {/* Course Switcher Tabs */}
        {onSelectCourse && (
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onSelectCourse('c')}
              className={`flex-1 py-1 text-center rounded-lg font-bold text-[11px] transition ${
                activeCourseId === 'c'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              C Systems
            </button>
            <button
              onClick={() => onSelectCourse('cpp')}
              className={`flex-1 py-1 text-center rounded-lg font-bold text-[11px] transition ${
                activeCourseId === 'cpp'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Modern C++
            </button>
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="search-problems-input"
            type="text"
            placeholder="Search topics, syntax, pointers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category & Difficulty Filters */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter problems by category"
            className="w-full py-1.5 px-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Modules</option>
            {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
              <option key={catKey} value={catKey}>
                {label}
              </option>
            ))}
          </select>

          <select
            id="difficulty-filter"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            aria-label="Filter problems by difficulty"
            className="w-full py-1.5 px-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Problem List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {filteredProblems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs space-y-2">
            <Code2 className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
            <p>No practice exercises match your filters.</p>
          </div>
        ) : (
          filteredProblems.map((problem, idx) => {
            const isSelected = problem.id === selectedProblemId;
            const isSolved = solvedProblemIds.has(problem.id);

            return (
              <button
                key={problem.id}
                id={`problem-item-${problem.id}`}
                onClick={() => onSelectProblem(problem.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                {/* Solved Status Dot */}
                <div className="pt-0.5 shrink-0">
                  {isSolved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-700" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {idx + 1}. {problem.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border uppercase shrink-0 ${getDifficultyColor(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-1.5">{problem.summary}</p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {CATEGORY_LABELS[problem.category]?.split('. ')[1] || problem.category}
                    </span>
                    {problem.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono text-emerald-400/80 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-800/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
