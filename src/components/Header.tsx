import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Terminal,
  BookOpen,
  BrainCircuit,
  Cpu,
  Play,
  Download,
  Sparkles,
  CheckCircle2,
  Flame,
  ShieldCheck,
  GraduationCap,
  LogIn,
  LogOut,
  UserCheck,
  MessageSquare,
  Bot,
  Crown,
  Trophy,
  Award,
  Check,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { User, CourseId } from '../types';
import { getEarnedBadges, ALL_ACHIEVEMENT_BADGES, AchievementBadge } from '../utils/achievementBadges';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  activeTab: 'problems' | 'sandbox' | 'quiz' | 'cheatsheet' | 'memory' | 'awards' | 'admin';
  setActiveTab: (tab: 'problems' | 'sandbox' | 'quiz' | 'cheatsheet' | 'memory' | 'awards' | 'admin') => void;
  solvedCount: number;
  totalCount: number;
  onRunCode: () => void;
  isRunning: boolean;
  onDownloadCode: () => void;
  activeProblemTitle?: string;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  activeCourseId?: CourseId;
  onSelectCourse?: (courseId: CourseId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  solvedCount,
  totalCount,
  onRunCode,
  isRunning,
  onDownloadCode,
  activeProblemTitle,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onToggleChat,
  isChatOpen,
  activeCourseId = 'c',
  onSelectCourse,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const progressPercent = Math.round((solvedCount / totalCount) * 100) || 0;
  const isCpp = activeCourseId === 'cpp';

  const [showBadgesPopover, setShowBadgesPopover] = useState(false);
  const badgesPopoverRef = useRef<HTMLDivElement>(null);

  const earnedBadges = useMemo(() => {
    return getEarnedBadges(currentUser?.solvedProblemIds || []);
  }, [currentUser?.solvedProblemIds]);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (badgesPopoverRef.current && !badgesPopoverRef.current.contains(event.target as Node)) {
        setShowBadgesPopover(false);
      }
    };
    if (showBadgesPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBadgesPopover]);

  return (
    <header className="flex flex-col lg:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-900/70 border border-slate-800 rounded-2xl shrink-0 backdrop-blur-sm shadow-lg shadow-black/20">
      {/* Brand & Breadcrumb */}
      <div className="flex items-center justify-between w-full lg:w-auto gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-sm transition-colors ${
            isCpp ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-slate-950'
          }`}>
            {isCpp ? 'C++' : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                {isCpp ? 'C++ Academy' : 'C-Mastery'}
                {activeTab === 'problems' && activeProblemTitle && (
                  <span className="text-slate-500 font-normal text-xs sm:text-sm hidden sm:inline truncate max-w-xs">
                    / {activeProblemTitle}
                  </span>
                )}
              </h1>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                isCpp
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {isCpp ? 'ISO C++20' : 'GCC C11'}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Run Button */}
        <button
          id="btn-run-mobile"
          onClick={onRunCode}
          disabled={isRunning}
          className={`lg:hidden flex items-center gap-1.5 px-3 py-1.5 font-black rounded-xl text-xs transition-all active:scale-95 shadow-md ${
            isCpp
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/40'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
          }`}
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'RUNNING...' : 'RUN'}</span>
        </button>
      </div>

      {/* Navigation Tabs (Bento Pills) */}
      <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-xs w-full lg:w-auto justify-center overflow-x-auto">
        <button
          id="tab-challenges"
          onClick={() => setActiveTab('problems')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'problems'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Challenges</span>
        </button>

        <button
          id="tab-sandbox"
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'sandbox'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Sandbox</span>
        </button>

        <button
          id="tab-memory"
          onClick={() => setActiveTab('memory')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'memory'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Memory</span>
        </button>

        <button
          id="tab-cheatsheet"
          onClick={() => setActiveTab('cheatsheet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'cheatsheet'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Reference</span>
        </button>

        <button
          id="tab-quiz"
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'quiz'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quiz</span>
        </button>

        <button
          id="tab-awards"
          onClick={() => setActiveTab('awards')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'awards'
              ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Awards</span>
        </button>

        {/* Admin Portal Tab if role is admin */}
        {isAdmin && (
          <button
            id="tab-admin-portal"
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'admin'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
            <span>Classroom Admin</span>
          </button>
        )}
      </nav>

      {/* Right Stats & Bento Actions & Auth Widget */}
      <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
        {/* User Account / Login Widget */}
        {currentUser ? (
          <div className="flex items-center gap-2 relative" ref={badgesPopoverRef}>
            {/* User Account Badge Button */}
            <button
              id="btn-account-pill"
              onClick={onOpenAuthModal}
              title="Click to customize your profile, avatar, bio, or switch account"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition group text-left ${
                isAdmin
                  ? 'bg-purple-950/40 border-purple-800/60 hover:border-purple-500 hover:bg-purple-950/60'
                  : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900'
              }`}
            >
              <UserAvatar
                avatar={currentUser.avatar}
                name={currentUser.name}
                className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-sm shadow-sm"
              />
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white max-w-[100px] truncate">{currentUser.name}</span>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                      isAdmin
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 group-hover:text-emerald-400 transition">
                  Edit Profile & Bio ▾
                </span>
              </div>
            </button>

            {/* Earned Achievement Badges in User Profile Area */}
            <div id="header-user-badges" className="flex items-center gap-1.5">
              {earnedBadges.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  {/* Display up to 3 earned badges individually */}
                  {earnedBadges.slice(0, 3).map((badge) => (
                    <button
                      key={badge.id}
                      id={`badge-pill-${badge.id}`}
                      onClick={() => setShowBadgesPopover(!showBadgesPopover)}
                      title={`${badge.name}: ${badge.description} (Click to see all achievements)`}
                      className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition hover:scale-105 active:scale-95 shadow-sm cursor-pointer ${badge.bgClass} ${badge.borderClass} ${badge.textClass}`}
                    >
                      <span className="text-xs">{badge.icon}</span>
                      <span className="max-w-[85px] truncate">{badge.name}</span>
                    </button>
                  ))}

                  {/* If more than 3 badges are earned, show count pill */}
                  {earnedBadges.length > 3 && (
                    <button
                      id="btn-more-badges"
                      onClick={() => setShowBadgesPopover(!showBadgesPopover)}
                      title="Click to view all earned badges"
                      className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold border border-slate-700 bg-slate-900 text-amber-300 hover:bg-slate-800 transition shadow-sm cursor-pointer"
                    >
                      <span>+{earnedBadges.length - 3}</span>
                      <Trophy className="w-3 h-3 text-amber-400" />
                    </button>
                  )}

                  {/* Mobile compact badge pill */}
                  <button
                    id="btn-mobile-badges"
                    onClick={() => setShowBadgesPopover(!showBadgesPopover)}
                    title="View Earned Badges"
                    className="sm:hidden inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold border border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-sm"
                  >
                    <span>{earnedBadges[0]?.icon || '🏆'}</span>
                    <span>{earnedBadges.length}</span>
                  </button>
                </div>
              ) : (
                /* Unearned placeholder explaining how to unlock badges */
                <button
                  id="btn-unearned-badges"
                  onClick={() => setShowBadgesPopover(!showBadgesPopover)}
                  title="No badges earned yet. Solve your 1st challenge to earn 'First Solve'!"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-medium border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Badges (0/{ALL_ACHIEVEMENT_BADGES.length})</span>
                </button>
              )}
            </div>

            {/* Dedicated Log Out Button */}
            {onLogout && (
              <button
                id="btn-header-logout"
                onClick={onLogout}
                title="Log Out of your account"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-900/40 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 hover:text-white text-xs font-bold transition shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}

            {/* Achievement Badges Details Popover */}
            {showBadgesPopover && (
              <div
                id="popover-user-badges"
                className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950 border border-slate-800 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Student Achievements</h4>
                      <p className="text-[10px] text-slate-400">
                        Earned from solved problem list ({earnedBadges.length}/{ALL_ACHIEVEMENT_BADGES.length})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBadgesPopover(false)}
                    className="text-slate-500 hover:text-slate-300 text-xs px-2 py-0.5 rounded hover:bg-slate-900"
                  >
                    ✕
                  </button>
                </div>

                <div className="py-3 space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                  {ALL_ACHIEVEMENT_BADGES.map((badge) => {
                    const isEarned = badge.isEarned(currentUser.solvedProblemIds || []);
                    return (
                      <div
                        key={badge.id}
                        id={`popover-badge-card-${badge.id}`}
                        className={`p-2.5 rounded-xl border transition ${
                          isEarned
                            ? `${badge.bgClass} ${badge.borderClass}`
                            : 'bg-slate-900/30 border-slate-800/80 opacity-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span className="text-lg leading-none mt-0.5">{badge.icon}</span>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-xs font-bold ${isEarned ? badge.textClass : 'text-slate-400'}`}>
                                  {badge.name}
                                </span>
                                {isEarned ? (
                                  <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                                    <Check className="w-2.5 h-2.5" />
                                    Earned
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-500 uppercase">
                                    Locked
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-300 leading-snug mt-1">
                                {badge.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-white/5 text-[10px] text-slate-400 font-mono flex items-center justify-between gap-2">
                          <span className="truncate">Criteria: {badge.criteria}</span>
                          {badge.progressText && (
                            <span className={`shrink-0 text-[10px] font-bold ${isEarned ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {badge.progressText(currentUser.solvedProblemIds || [])}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setShowBadgesPopover(false);
                      onOpenAuthModal();
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>Edit Profile & Bio ✏️</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowBadgesPopover(false);
                      setActiveTab('awards');
                    }}
                    className="text-[11px] text-slate-400 hover:text-white font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>Leaderboard</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* When Logged Out: Show Log In Button */
          <button
            id="btn-header-login"
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/40 transition active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In / Register</span>
          </button>
        )}

        {/* Solved Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Solved</span>
            <span className="font-mono font-bold text-white text-xs">
              {solvedCount}/{totalCount}
            </span>
          </div>
          <div className="w-10 h-1.5 rounded-full bg-slate-800 overflow-hidden ml-1">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI & Cyrus Help Chat Toggle Button */}
          {onToggleChat && (
            <button
              id="btn-toggle-chat-header"
              onClick={onToggleChat}
              title={isAdmin ? 'Open Student Q&A & AI Reply Hub' : 'Ask AI C Tutor or Instructor Cyrus'}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition ${
                isChatOpen
                  ? isAdmin
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950/40'
                    : 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md shadow-emerald-950/40'
                  : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              {isAdmin ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Q&A Hub</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">AI Tutor & Help</span>
                </>
              )}
            </button>
          )}

          <button
            id="btn-download-c"
            onClick={onDownloadCode}
            title="Download source code as .c file"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .c</span>
          </button>


          <button
            id="btn-run-top"
            onClick={onRunCode}
            disabled={isRunning}
            className={`hidden lg:flex items-center gap-2 px-4 py-2 font-black rounded-xl text-xs uppercase tracking-wider transition-all transform active:scale-95 shadow-md ${
              isRunning
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'COMPILING...' : 'RUN CODE'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

