import React, { useState, useMemo } from 'react';
import { User, CourseId, SubmissionRecord } from '../types';
import { AuthService } from '../services/authService';
import { UserAvatar } from './UserAvatar';
import { C_PRACTICE_PROBLEMS } from '../data/cProblems';
import { CPP_PRACTICE_PROBLEMS } from '../data/cppProblems';
import {
  Trophy,
  Award,
  Medal,
  Crown,
  Flame,
  CheckCircle2,
  Sparkles,
  Search,
  BookOpen,
  Filter,
  ArrowUpRight,
  TrendingUp,
  GraduationCap,
  ShieldCheck,
  Zap,
  Info,
  RotateCcw,
  Star,
  Brain,
  Code2,
  ChevronRight,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface LeaderboardViewProps {
  currentUser: User | null;
  activeCourseId: CourseId;
  onSelectProblem?: (problemId: string) => void;
  onOpenAuthModal?: () => void;
}

export interface AwardDefinition {
  id: string;
  title: string;
  icon: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  description: string;
  criteria: string;
  checkUnlocked: (user: User, userSubmissions: SubmissionRecord[]) => boolean;
}

export const AWARDS_CATALOG: AwardDefinition[] = [
  {
    id: 'valedictorian',
    title: 'Course Valedictorian',
    icon: '👑',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Holds the #1 highest total aggregated score in the active curriculum.',
    criteria: 'Achieve Rank 1 on the course leaderboard.',
    checkUnlocked: (user, _subs) => false, // Set dynamically during rank calculation
  },
  {
    id: 'pointer-wizard',
    title: 'Pointer Wizard',
    icon: '🧠',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Mastered memory addresses, dereferencing, and pointer arithmetic.',
    criteria: 'Solve "pointer-swap", "array-sum-pointers", or "cpp-unique-ptr-demo".',
    checkUnlocked: (user) => {
      const pointerIds = ['pointer-swap', 'array-sum-pointers', 'dynamic-array-growth', 'cpp-unique-ptr-demo'];
      return pointerIds.some((pid) => user.solvedProblemIds.includes(pid));
    },
  },
  {
    id: 'algo-ace',
    title: 'Algorithmic Ace',
    icon: '⚡',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Demonstrated extensive lab proficiency by solving 7 or more problems.',
    criteria: 'Solve at least 7 coding challenges in C or C++.',
    checkUnlocked: (user) => user.solvedProblemIds.length >= 7,
  },
  {
    id: 'deans-list',
    title: "Dean's Lister",
    icon: '🎯',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Demonstrated top-tier theoretical mastery on the comprehensive quiz.',
    criteria: 'Score 90% or higher on the curriculum quiz.',
    checkUnlocked: (user) => (user.quizScore?.percentage || 0) >= 90,
  },
  {
    id: 'consistency-titan',
    title: 'Consistency Titan',
    icon: '🔥',
    color: 'text-orange-400',
    badgeBg: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: 'Built a disciplined engineering routine through continuous daily practice.',
    criteria: 'Maintain a coding streak of 7 or more consecutive days.',
    checkUnlocked: (user) => (user.streak || 0) >= 7,
  },
  {
    id: 'lab-prolific',
    title: 'Lab Prolific',
    icon: '🚀',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: 'Actively compiled and verified solutions against automated test suites.',
    criteria: 'Execute 10 or more verified test submissions.',
    checkUnlocked: (user, userSubs) => {
      return (user.submissionsCount || 0) >= 10 || userSubs.length >= 10;
    },
  },
  {
    id: 'clean-coder',
    title: 'Clean Syntax Pro',
    icon: '💎',
    color: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Maintained high precision with zero compile warnings across submissions.',
    criteria: 'Pass 3 or more problems with a 100% grade test score.',
    checkUnlocked: (_user, userSubs) => {
      const perfectSubs = userSubs.filter((s) => s.passed && s.gradeScore === 100);
      return perfectSubs.length >= 3;
    },
  },
  {
    id: 'pwede-kana-mag-2nd-year',
    title: 'pwede kana mag 2nd year',
    icon: '🎓',
    color: 'text-amber-300',
    badgeBg: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20',
    borderColor: 'border-amber-400/60 shadow-lg shadow-amber-500/10',
    description: 'Mastered both C Systems Programming & Modern C++ OOP! You conquered low-level memory, pointers, data structures, and OOP: "pwede kana mag 2nd year"!',
    criteria: 'Master and solve all C language challenges (21/21) and all Modern C++ challenges (8/8).',
    checkUnlocked: (user) => {
      if (!user.solvedProblemIds || !Array.isArray(user.solvedProblemIds)) return false;
      const cIds = C_PRACTICE_PROBLEMS.map((p) => p.id);
      const cppIds = CPP_PRACTICE_PROBLEMS.map((p) => p.id);
      const cSolved = cIds.filter((id) => user.solvedProblemIds.includes(id)).length;
      const cppSolved = cppIds.filter((id) => user.solvedProblemIds.includes(id)).length;
      return cIds.length > 0 && cppIds.length > 0 && cSolved >= cIds.length && cppSolved >= cppIds.length;
    },
  },
];

interface RankedStudent {
  rank: number;
  user: User;
  totalScore: number;
  problemPoints: number;
  quizPoints: number;
  submissionPoints: number;
  streakPoints: number;
  awards: AwardDefinition[];
  passedSubmissionsCount: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUser,
  activeCourseId,
  onSelectProblem,
  onOpenAuthModal,
}) => {
  const [courseFilter, setCourseFilter] = useState<'all' | 'c' | 'cpp'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAwardsModal, setShowAwardsModal] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Fetch all users and submissions from authService
  const rawUsers = useMemo(() => AuthService.getUsers(), [lastRefreshed]);
  const allSubmissions = useMemo(() => AuthService.getSubmissions(), [lastRefreshed]);

  // Aggregate scores for students
  const rankedStudents: RankedStudent[] = useMemo(() => {
    // Only rank students (instructors/admins are excluded from competition)
    const students = rawUsers.filter((u) => u.role === 'student');

    const calculated: Omit<RankedStudent, 'rank'>[] = students.map((student) => {
      const studentSubs = allSubmissions.filter(
        (s) => s.userId === student.id || (student.email && s.userEmail === student.email)
      );
      const passedSubs = studentSubs.filter((s) => s.passed);

      // Scoring Breakdown:
      // 1. Problems: 100 pts per solved problem
      const problemPoints = (student.solvedProblemIds?.length || 0) * 100;
      // 2. Quiz: Up to 300 pts (percentage * 3)
      const quizPoints = Math.round(((student.quizScore?.percentage || 0) / 100) * 300);
      // 3. Submissions: 15 pts per passed test suite
      const submissionPoints = passedSubs.length * 15;
      // 4. Streak: 15 pts per day (capped at 300)
      const streakPoints = Math.min((student.streak || 0) * 15, 300);

      const totalScore = problemPoints + quizPoints + submissionPoints + streakPoints;

      // Calculate unlocked awards
      const unlockedAwards = AWARDS_CATALOG.filter((award) => {
        if (award.id === 'valedictorian') return false; // Handled after sorting
        return award.checkUnlocked(student, studentSubs);
      });

      return {
        user: student,
        totalScore,
        problemPoints,
        quizPoints,
        submissionPoints,
        streakPoints,
        awards: unlockedAwards,
        passedSubmissionsCount: passedSubs.length,
      };
    });

    // Sort descending by total aggregated score
    calculated.sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks and Valedictorian award
    return calculated.map((item, index) => {
      const rank = index + 1;
      const awards = [...item.awards];
      if (rank === 1) {
        const valedictorianBadge = AWARDS_CATALOG.find((a) => a.id === 'valedictorian');
        if (valedictorianBadge && !awards.some((a) => a.id === 'valedictorian')) {
          awards.unshift(valedictorianBadge);
        }
      }
      return {
        ...item,
        rank,
        awards,
      };
    });
  }, [rawUsers, allSubmissions]);

  // Filter based on course and search query
  const filteredStudents = useMemo(() => {
    return rankedStudents.filter((student) => {
      const course = student.user.enrolledCourse?.toLowerCase() || '';
      const matchesCourse =
        courseFilter === 'all'
          ? true
          : courseFilter === 'c'
          ? course.includes('c ') || course.includes('cs201') || course.includes('systems') || !course.includes('c++')
          : course.includes('c++') || course.includes('cs202') || course.includes('cpp');

      const matchesSearch =
        !searchQuery.trim() ||
        student.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.user.studentId && student.user.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        student.user.email.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCourse && matchesSearch;
    });
  }, [rankedStudents, courseFilter, searchQuery]);

  // Top 3 Podium Students
  const topThree = useMemo(() => {
    return filteredStudents.slice(0, 3);
  }, [filteredStudents]);

  // Current logged in student's rank record
  const currentUserRanking = useMemo(() => {
    if (!currentUser) return null;
    return rankedStudents.find((s) => s.user.id === currentUser.id || s.user.email === currentUser.email) || null;
  }, [rankedStudents, currentUser]);

  const handleRefresh = () => {
    setLastRefreshed(new Date());
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
      {/* Top Header & Context Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  Student Awards & Course Leaderboard
                </h1>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Live Rankings
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Aggregated student performance across coding challenges, unit test verification, quiz evaluations, and coding habits.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-open-awards-catalog"
            onClick={() => setShowAwardsModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition shadow-sm"
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span>Awards Catalog ({AWARDS_CATALOG.length})</span>
          </button>

          <button
            type="button"
            id="btn-refresh-leaderboard"
            onClick={handleRefresh}
            title="Refresh latest scores"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User's Position Banner / Instructor Notice */}
      {currentUser && currentUser.role === 'student' && currentUserRanking && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <UserAvatar
                avatar={currentUser.avatar}
                name={currentUser.name}
                className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-2xl shadow-sm"
                fallbackEmoji="🎓"
              />
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-900">
                #{currentUserRanking.rank}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Your Standing: Rank #{currentUserRanking.rank}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentUserRanking.rank <= 3 ? 'Podium Contender' : 'Ranked Student'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                You have accumulated <strong className="text-emerald-400 font-mono">{currentUserRanking.totalScore} XP</strong> and unlocked{' '}
                <strong className="text-white">{currentUserRanking.awards.length}</strong> of {AWARDS_CATALOG.length} official awards.
              </p>
              {currentUser.bio && (
                <p className="text-[11px] text-emerald-300/90 italic flex items-center gap-1 mt-1">
                  <span className="text-emerald-400 font-serif text-xs">“</span>
                  <span>{currentUser.bio}</span>
                  <span className="text-emerald-400 font-serif text-xs">”</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {onOpenAuthModal && (
              <button
                id="btn-leaderboard-customize-profile"
                onClick={onOpenAuthModal}
                title="Customize your avatar, bio & student profile"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/60 text-xs font-bold text-slate-200 hover:text-white transition shadow-sm cursor-pointer"
              >
                <span>✏️ Customize Profile & Bio</span>
              </button>
            )}
            <div className="flex items-center gap-1">
              {currentUserRanking.awards.map((award) => (
                <span
                  key={award.id}
                  title={`${award.title}: ${award.description}`}
                  className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shadow-sm"
                >
                  {award.icon}
                </span>
              ))}
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-right">
              <div className="text-[10px] font-mono uppercase text-slate-400">Total Points</div>
              <div className="text-base font-black text-emerald-400 font-mono">{currentUserRanking.totalScore} pts</div>
            </div>
          </div>
        </div>
      )}

      {currentUser && currentUser.role === 'admin' && (
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-purple-200">
              Instructor CYRUS Oversight Mode
            </p>
            <p className="text-purple-300/90 leading-relaxed">
              You are viewing the automated student grading and leaderboard matrix. Scores are dynamically computed from verified test suite passes, quiz accuracy, problem completion, and active coding streaks.
            </p>
          </div>
        </div>
      )}

      {/* Podium Showcase (Top 3 Performers) */}
      {filteredStudents.length >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="order-2 md:order-1 p-5 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-slate-700">
                <Medal className="w-3.5 h-3.5 text-slate-400" />
                <span>#2 Silver</span>
              </div>
              <UserAvatar
                avatar={topThree[1].user.avatar}
                name={topThree[1].user.name}
                className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-500/60 text-3xl shadow-lg mt-4 mb-2"
                fallbackEmoji="🥈"
              />
              <h3 className="text-base font-bold text-white tracking-tight">{topThree[1].user.name}</h3>
              <p className="text-xs text-slate-400 font-mono mb-2">{topThree[1].user.studentId || 'Student'}</p>
              <div className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-mono font-bold mb-3 border border-slate-700">
                {topThree[1].totalScore} XP
              </div>
              <div className="flex items-center gap-1.5">
                {topThree[1].awards.slice(0, 4).map((award) => (
                  <span
                    key={award.id}
                    title={award.title}
                    className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs"
                  >
                    {award.icon}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 1st Place (Valedictorian Champion) */}
          {topThree[0] && (
            <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-900 border-2 border-amber-500/60 shadow-2xl shadow-amber-950/50 flex flex-col items-center text-center relative overflow-hidden transform md:-translate-y-2">
              <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>#1 Valedictorian</span>
              </div>
              <div className="relative mt-3 mb-2">
                <UserAvatar
                  avatar={topThree[0].user.avatar}
                  name={topThree[0].user.name}
                  className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 text-4xl shadow-xl shadow-amber-900/40"
                  fallbackEmoji="🥇"
                />
                <span className="absolute -top-2 -right-1 text-2xl animate-bounce">👑</span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">{topThree[0].user.name}</h3>
              <p className="text-xs text-amber-300 font-mono mb-2">{topThree[0].user.studentId || 'Lead Scholar'}</p>
              <div className="px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 text-sm font-mono font-black mb-3 shadow-md">
                {topThree[0].totalScore} XP
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                {topThree[0].user.solvedProblemIds.length} Solved • {topThree[0].user.quizScore?.percentage || 0}% Quiz • {topThree[0].user.streak} Day Streak
              </p>
              <div className="flex items-center gap-1.5">
                {topThree[0].awards.map((award) => (
                  <span
                    key={award.id}
                    title={award.title}
                    className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs"
                  >
                    {award.icon}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="order-3 p-5 rounded-3xl bg-slate-900/90 border border-amber-900/40 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/40 text-amber-400 text-[10px] font-mono font-bold border border-amber-800/40">
                <Medal className="w-3.5 h-3.5 text-amber-600" />
                <span>#3 Bronze</span>
              </div>
              <UserAvatar
                avatar={topThree[2].user.avatar}
                name={topThree[2].user.name}
                className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-amber-800/40 text-3xl shadow-lg mt-4 mb-2"
                fallbackEmoji="🥉"
              />
              <h3 className="text-base font-bold text-white tracking-tight">{topThree[2].user.name}</h3>
              <p className="text-xs text-slate-400 font-mono mb-2">{topThree[2].user.studentId || 'Student'}</p>
              <div className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-mono font-bold mb-3 border border-slate-700">
                {topThree[2].totalScore} XP
              </div>
              <div className="flex items-center gap-1.5">
                {topThree[2].awards.slice(0, 4).map((award) => (
                  <span
                    key={award.id}
                    title={award.title}
                    className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs"
                  >
                    {award.icon}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-900/80 border border-slate-800 rounded-2xl">
        {/* Course Filter Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setCourseFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              courseFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Courses ({rankedStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setCourseFilter('c')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              courseFilter === 'c'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            CS201: C Systems
          </button>
          <button
            type="button"
            onClick={() => setCourseFilter('cpp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              courseFilter === 'cpp'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            CS202: Modern C++
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Main Rankings Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4 text-center">Challenges Solved</th>
                <th className="py-3.5 px-4 text-center">Quiz Score</th>
                <th className="py-3.5 px-4 text-center">Streak</th>
                <th className="py-3.5 px-4">Awards Earned</th>
                <th className="py-3.5 px-4 text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-bold text-sm text-slate-300">No students matched this filter</p>
                    <p className="text-xs text-slate-500 mt-1">Try clearing the search query or course tab filter.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((item) => {
                  const isCurrent = currentUser?.id === item.user.id || currentUser?.email === item.user.email;
                  const isGold = item.rank === 1;
                  const isSilver = item.rank === 2;
                  const isBronze = item.rank === 3;

                  return (
                    <tr
                      key={item.user.id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                          : 'hover:bg-slate-850/60'
                      }`}
                    >
                      {/* Rank Indicator */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {isGold ? (
                            <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                              1
                            </span>
                          ) : isSilver ? (
                            <span className="w-7 h-7 rounded-xl bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                              2
                            </span>
                          ) : isBronze ? (
                            <span className="w-7 h-7 rounded-xl bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md">
                              3
                            </span>
                          ) : (
                            <span className="font-mono text-slate-400 font-bold text-xs">
                              #{item.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            avatar={item.user.avatar}
                            name={item.user.name}
                            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-lg shadow-sm"
                            fallbackEmoji="👤"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white text-sm truncate">{item.user.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                              <span>{item.user.studentId || item.user.email}</span>
                              {item.user.title && (
                                <span className="text-slate-500 hidden sm:inline truncate max-w-[130px]">
                                  • {item.user.title}
                                </span>
                              )}
                            </div>
                            {item.user.bio && (
                              <p className="text-[10px] text-slate-400 italic truncate max-w-[240px] mt-0.5" title={item.user.bio}>
                                "{item.user.bio}"
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            item.user.enrolledCourse?.includes('C++') || item.user.enrolledCourse?.includes('CS202')
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {item.user.enrolledCourse?.includes('C++') ? 'CS202 C++' : 'CS201 C'}
                        </span>
                      </td>

                      {/* Challenges Solved */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-mono font-bold text-white">
                            {item.user.solvedProblemIds?.length || 0}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.problemPoints} pts
                          </span>
                        </div>
                      </td>

                      {/* Quiz Score */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-mono font-bold text-emerald-400">
                            {item.user.quizScore ? `${item.user.quizScore.percentage}%` : '—'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.quizPoints} pts
                          </span>
                        </div>
                      </td>

                      {/* Streak */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-mono text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-lg">
                          <Flame className="w-3 h-3 fill-current" />
                          <span>{item.user.streak || 0}d</span>
                        </div>
                      </td>

                      {/* Awards Earned */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {item.awards.map((award) => (
                            <span
                              key={award.id}
                              title={`${award.title}: ${award.description}`}
                              className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-xs hover:scale-110 transition-transform cursor-pointer"
                            >
                              {award.icon}
                            </span>
                          ))}
                          {item.awards.length === 0 && (
                            <span className="text-slate-600 text-[11px]">In progress...</span>
                          )}
                        </div>
                      </td>

                      {/* Total Aggregated Score */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-black text-sm text-emerald-400">
                          {item.totalScore}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono ml-1">XP</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Awards Catalog Modal */}
      {showAwardsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowAwardsModal(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Course Honors & Awards Catalog</h2>
                  <p className="text-xs text-slate-400">
                    Official milestones and badges students can earn in CS201 & CS202.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAwardsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4 bg-slate-950">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AWARDS_CATALOG.map((award) => {
                  const unlockedCount = rankedStudents.filter((s) =>
                    s.awards.some((a) => a.id === award.id)
                  ).length;

                  return (
                    <div
                      key={award.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                          {award.icon}
                        </span>
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white">{award.title}</h4>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{award.description}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <div className="text-slate-400">
                          <strong className="text-emerald-400">Criteria:</strong> {award.criteria}
                        </div>
                        <span className="font-mono text-slate-500 shrink-0 ml-2">
                          {unlockedCount} earned
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Instructor: CYRUS • CS201 & CS202 Practice Studio</span>
              <button
                type="button"
                onClick={() => setShowAwardsModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
