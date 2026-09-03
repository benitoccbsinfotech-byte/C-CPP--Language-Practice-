import { C_PRACTICE_PROBLEMS } from '../data/cProblems';
import { CPP_PRACTICE_PROBLEMS } from '../data/cppProblems';

export interface AchievementBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  description: string;
  criteria: string;
  isEarned: (solvedProblemIds: string[]) => boolean;
  progressText?: (solvedProblemIds: string[]) => string;
}

export const ALL_ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: 'first-solve',
    name: 'First Solve',
    icon: '🎯',
    color: 'emerald',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/30',
    textClass: 'text-emerald-400',
    description: 'Successfully compiled and solved your first lab challenge.',
    criteria: 'Solve at least 1 coding challenge in C or Modern C++.',
    isEarned: (solvedProblemIds: string[]) => solvedProblemIds.length >= 1,
  },
  {
    id: 'cpp-expert',
    name: 'C++ Expert',
    icon: '⚡',
    color: 'blue',
    bgClass: 'bg-blue-500/15',
    borderClass: 'border-blue-500/30',
    textClass: 'text-blue-400',
    description: 'Mastered Modern C++ object-oriented principles, streams, or STL containers.',
    criteria: 'Solve any Modern C++ challenge (e.g. classes, vectors, smart pointers).',
    isEarned: (solvedProblemIds: string[]) => {
      const cppPrefixes = ['cpp-'];
      return solvedProblemIds.some((id) => cppPrefixes.some((p) => id.startsWith(p)));
    },
  },
  {
    id: 'debug-master',
    name: 'Debug Master',
    icon: '🛠️',
    color: 'purple',
    bgClass: 'bg-purple-500/15',
    borderClass: 'border-purple-500/30',
    textClass: 'text-purple-400',
    description: 'Conquered memory bugs, pointer arithmetic, and algorithmic edge cases.',
    criteria: 'Solve memory, pointer, or sorting challenges (e.g., pointer swap, array sum pointers).',
    isEarned: (solvedProblemIds: string[]) => {
      const debugIds = [
        'pointer-swap',
        'array-sum-pointers',
        'dynamic-array-growth',
        'cpp-unique-ptr-demo',
        'find-max-min',
        'bubble-sort-ascending',
        'linear-search-key',
      ];
      return solvedProblemIds.some((id) => debugIds.includes(id)) || solvedProblemIds.length >= 4;
    },
  },
  {
    id: 'pointer-pro',
    name: 'Pointer Pro',
    icon: '🧠',
    color: 'cyan',
    bgClass: 'bg-cyan-500/15',
    borderClass: 'border-cyan-500/30',
    textClass: 'text-cyan-400',
    description: 'Mastered direct hardware memory addressing and pointer dereferencing.',
    criteria: 'Solve at least one pointer manipulation or dynamic allocation challenge.',
    isEarned: (solvedProblemIds: string[]) => {
      const pointerIds = ['pointer-swap', 'array-sum-pointers', 'dynamic-array-growth', 'cpp-unique-ptr-demo'];
      return solvedProblemIds.some((id) => pointerIds.includes(id));
    },
  },
  {
    id: 'algo-ace',
    name: 'Algorithm Ace',
    icon: '🏆',
    color: 'amber',
    bgClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-400',
    description: 'Built algorithmic prowess with a robust repertoire of solved challenges.',
    criteria: 'Solve 5 or more coding challenges across the curriculum.',
    isEarned: (solvedProblemIds: string[]) => solvedProblemIds.length >= 5,
  },
  {
    id: 'syntax-titan',
    name: 'Syntax Titan',
    icon: '💎',
    color: 'rose',
    bgClass: 'bg-rose-500/15',
    borderClass: 'border-rose-500/30',
    textClass: 'text-rose-400',
    description: 'Top-tier programmatic mastery across system architecture and modern paradigms.',
    criteria: 'Solve 8 or more comprehensive challenges in C and Modern C++.',
    isEarned: (solvedProblemIds: string[]) => solvedProblemIds.length >= 8,
  },
  {
    id: 'pwede-kana-mag-2nd-year',
    name: 'pwede kana mag 2nd year',
    icon: '🎓',
    color: 'amber',
    bgClass: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20',
    borderClass: 'border-amber-400/60 shadow-lg shadow-amber-500/10',
    textClass: 'text-amber-300',
    description: 'Mastered all C Systems Programming & Modern C++ OOP! "pwede kana mag 2nd year" — you conquered low-level memory, pointers, data structures, and OOP paradigms!',
    criteria: 'Master and solve all C language challenges (21/21) and all Modern C++ challenges (8/8).',
    isEarned: (solvedProblemIds: string[]) => {
      if (!solvedProblemIds || !Array.isArray(solvedProblemIds)) return false;
      const cIds = C_PRACTICE_PROBLEMS.map((p) => p.id);
      const cppIds = CPP_PRACTICE_PROBLEMS.map((p) => p.id);
      const cSolved = cIds.filter((id) => solvedProblemIds.includes(id)).length;
      const cppSolved = cppIds.filter((id) => solvedProblemIds.includes(id)).length;
      return cIds.length > 0 && cppIds.length > 0 && cSolved >= cIds.length && cppSolved >= cppIds.length;
    },
    progressText: (solvedProblemIds: string[]) => {
      const cIds = C_PRACTICE_PROBLEMS.map((p) => p.id);
      const cppIds = CPP_PRACTICE_PROBLEMS.map((p) => p.id);
      const cSolved = cIds.filter((id) => (solvedProblemIds || []).includes(id)).length;
      const cppSolved = cppIds.filter((id) => (solvedProblemIds || []).includes(id)).length;
      if (cSolved >= cIds.length && cppSolved >= cppIds.length) {
        return 'All Mastered! 🎓';
      }
      return `C: ${cSolved}/${cIds.length} • C++: ${cppSolved}/${cppIds.length}`;
    },
  },
];

export function getEarnedBadges(solvedProblemIds: string[]): AchievementBadge[] {
  if (!solvedProblemIds || !Array.isArray(solvedProblemIds)) return [];
  return ALL_ACHIEVEMENT_BADGES.filter((badge) => badge.isEarned(solvedProblemIds));
}

export function getNextUnlockableBadge(solvedProblemIds: string[]): AchievementBadge | null {
  if (!solvedProblemIds || !Array.isArray(solvedProblemIds)) {
    return ALL_ACHIEVEMENT_BADGES[0];
  }
  return ALL_ACHIEVEMENT_BADGES.find((badge) => !badge.isEarned(solvedProblemIds)) || null;
}
