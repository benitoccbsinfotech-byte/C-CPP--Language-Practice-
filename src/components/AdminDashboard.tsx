import React, { useState, useEffect } from 'react';
import { User, SubmissionRecord, PracticeProblem, Difficulty, ProblemCategory, CourseId } from '../types';
import { AuthService, ADMIN_CREDENTIALS } from '../services/authService';
import { ClassroomChatWidget } from './ClassroomChatWidget';
import { UserAvatar } from './UserAvatar';
import {
  Users,
  FileCode,
  PlusCircle,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Send,
  Eye,
  Trash2,
  Terminal,
  Award,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  UserCheck,
  MessageSquare,
  Bot,
  Crown,
  UserPlus,
  X,
  Lock,
  Mail,
  AlertCircle,
  Code2,
  Cloud,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  onSelectProblemForEditing?: (problemId: string) => void;
  customProblems: PracticeProblem[];
  onAddCustomProblem: (problem: PracticeProblem) => void;
  onDeleteCustomProblem: (problemId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onSwitchUser,
  customProblems,
  onAddCustomProblem,
  onDeleteCustomProblem,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'submissions' | 'create-problem' | 'qna' | 'analytics'>('roster');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<'all' | 'c' | 'cpp'>('all');

  const [allUsers, setAllUsers] = useState<User[]>(() => AuthService.getUsers());
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>(() => AuthService.getSubmissions());
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProblem, setFilterProblem] = useState<string>('all');

  // Deletion state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // New Admin Provisioning Modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminTitle, setNewAdminTitle] = useState('Co-Instructor & Lab Administrator');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminModalError, setAdminModalError] = useState<string | null>(null);
  const [adminModalSuccess, setAdminModalSuccess] = useState<string | null>(null);

  // Grading form state for selected submission
  const [gradeScore, setGradeScore] = useState<number>(100);
  const [feedbackNote, setFeedbackNote] = useState<string>('');
  const [gradeSuccess, setGradeSuccess] = useState<boolean>(false);

  // New Custom Problem Form State
  const [problemCourse, setProblemCourse] = useState<CourseId>('c');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('pointers');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [learningPointsText, setLearningPointsText] = useState('Understand pointer arithmetic\nManage memory safety');
  const [initialCode, setInitialCode] = useState(`#include <stdio.h>

int main() {
    // Write your solution here:
    return 0;
}`);
  const [solutionCode, setSolutionCode] = useState(`#include <stdio.h>

int main() {
    printf("Custom Solution\\n");
    return 0;
}`);
  const [explanation, setExplanation] = useState('This solution handles edge cases and runs in O(N) time.');
  const [testInput1, setTestInput1] = useState('10 20');
  const [testOutput1, setTestOutput1] = useState('30\n');
  const [testDesc1, setTestDesc1] = useState('Standard positive inputs');
  const [hint, setHint] = useState('Remember to dereference the pointer using the * operator.');
  const [pitfallsText, setPitfallsText] = useState('Dangling pointers\nBuffer overflow');
  const [tagsText, setTagsText] = useState('Pointers, Memory, Functions');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // When problemCourse changes, update template starter code
  const handleCourseChange = (course: CourseId) => {
    setProblemCourse(course);
    if (course === 'cpp') {
      setCategory('classes-oop');
      setInitialCode(`#include <iostream>
#include <string>

int main() {
    // Write your modern C++ code here:
    
    return 0;
}`);
      setSolutionCode(`#include <iostream>

int main() {
    std::cout << "Modern C++ Solution" << std::endl;
    return 0;
}`);
      setHint('Use std::cout and std::cin from <iostream>');
      setPitfallsText('Forgetting namespace std resolution\nMissing semicolon at class end');
      setTagsText('C++, OOP, Streams, Classes');
    } else {
      setCategory('pointers');
      setInitialCode(`#include <stdio.h>

int main() {
    // Write your C code here:
    return 0;
}`);
      setSolutionCode(`#include <stdio.h>

int main() {
    printf("C Solution\\n");
    return 0;
}`);
      setHint('Remember to check pointer addresses with & and dereference with *.');
      setPitfallsText('Dangling pointers\nBuffer overflow');
      setTagsText('C, Pointers, Memory');
    }
  };

  const refreshRoster = () => {
    setAllUsers(AuthService.getUsers());
    setSubmissions(AuthService.getSubmissions());
  };

  // Real-time synchronization with Firestore online database
  useEffect(() => {
    const unsubUsers = AuthService.subscribeUsers((users) => {
      setAllUsers(users);
    });
    const unsubSubs = AuthService.subscribeSubmissions((subs) => {
      setSubmissions(subs);
    });
    return () => {
      unsubUsers();
      unsubSubs();
    };
  }, []);

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    setDeleteError(null);

    const res = AuthService.deleteUser(currentUser.id, userToDelete.id);
    if (!res.success) {
      setDeleteError(res.error || 'Failed to delete account.');
      return;
    }

    setDeleteSuccessMsg(`Account for "${userToDelete.name}" (${userToDelete.email}) was successfully deleted.`);
    setUserToDelete(null);
    refreshRoster();
    setTimeout(() => setDeleteSuccessMsg(null), 3500);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminModalError(null);
    setAdminModalSuccess(null);

    const res = AuthService.createAdminAccount(currentUser.id, {
      name: newAdminName,
      email: newAdminEmail,
      password: newAdminPassword,
      title: newAdminTitle,
    });

    if (res.error) {
      setAdminModalError(res.error);
      return;
    }

    setAdminModalSuccess(`Admin account for ${newAdminName} created successfully!`);
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPassword('');
    refreshRoster();
    setTimeout(() => {
      setAdminModalSuccess(null);
      setShowAdminModal(false);
    }, 1800);
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    AuthService.gradeSubmission(selectedSubmission.id, gradeScore, feedbackNote);
    setSubmissions(AuthService.getSubmissions());
    setSelectedSubmission((prev) => (prev ? { ...prev, gradeScore, feedback: feedbackNote } : null));
    setGradeSuccess(true);
    setTimeout(() => setGradeSuccess(false), 2500);
  };

  const handleCreateProblemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProblem: PracticeProblem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category,
      difficulty,
      summary: summary.trim() || `Custom ${problemCourse.toUpperCase()} challenge authored by ${currentUser.name}`,
      description: description.trim() || `Implement the solution according to course specifications.`,
      learningPoints: learningPointsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      initialCode,
      solutionCode,
      explanation,
      testCases: [
        {
          id: `tc-${Date.now()}-1`,
          input: testInput1,
          expectedOutput: testOutput1.endsWith('\n') ? testOutput1 : `${testOutput1}\n`,
          description: testDesc1 || 'Standard test case 1',
        },
      ],
      hint,
      commonPitfalls: pitfallsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      tags: tagsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      createdBy: currentUser.name,
      isCustom: true,
      courseId: problemCourse,
      language: problemCourse,
    };

    onAddCustomProblem(newProblem);
    setPublishSuccess(true);
    setTitle('');
    setSummary('');
    setDescription('');
    setTimeout(() => setPublishSuccess(false), 3000);
  };

  const studentsList = allUsers.filter((u) => u.role === 'student');
  const adminsList = allUsers.filter((u) => u.role === 'admin');

  const filteredRoster = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCourseFilter === 'c') {
      return (u.enrolledCourse && u.enrolledCourse.includes('C ')) || u.role === 'admin';
    }
    if (selectedCourseFilter === 'cpp') {
      return (u.enrolledCourse && u.enrolledCourse.includes('C++')) || u.role === 'admin';
    }
    return true;
  });

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.problemTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProb = filterProblem === 'all' || sub.problemId === filterProblem;
    return matchesSearch && matchesProb;
  });

  const totalClassSolved = studentsList.reduce((acc, s) => acc + s.solvedProblemIds.length, 0);
  const avgSolvedPerStudent = studentsList.length ? (totalClassSolved / studentsList.length).toFixed(1) : '0';
  const passedSubsCount = submissions.filter((s) => s.passed).length;
  const passRate = submissions.length ? Math.round((passedSubsCount / submissions.length) * 100) : 100;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 overflow-hidden shadow-lg shadow-black/20">
      {/* Top Banner & Tab Navigation */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Instructor & Lab Administration Portal</h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60">
                Lead Admin: {currentUser.name}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                <Cloud className="w-3 h-3 text-emerald-400" />
                Cloud Database Online
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Primary Instructor: <strong className="text-purple-300">{ADMIN_CREDENTIALS.name}</strong> ({ADMIN_CREDENTIALS.email})
            </p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            id="tab-admin-roster"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'roster'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Accounts & Roster ({allUsers.length})</span>
          </button>

          <button
            id="tab-admin-submissions"
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'submissions'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Submissions ({submissions.length})</span>
          </button>

          <button
            id="tab-admin-create-problem"
            onClick={() => setActiveTab('create-problem')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'create-problem'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create C / C++ Problem</span>
          </button>

          <button
            id="tab-admin-qna"
            onClick={() => setActiveTab('qna')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'qna'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Student Q&A & AI Reply</span>
          </button>

          <button
            id="tab-admin-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Enrolled Students</p>
            <p className="text-xl font-mono font-black text-white">{studentsList.length}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Submissions</p>
            <p className="text-xl font-mono font-black text-white">{submissions.length}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileCode className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Problems Solved</p>
            <p className="text-xl font-mono font-black text-emerald-400">{avgSolvedPerStudent}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Instructors</p>
            <p className="text-xl font-mono font-black text-amber-400">{adminsList.length}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Crown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-950">
        {/* Success / Error Alerts */}
        {deleteSuccessMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{deleteSuccessMsg}</span>
            </span>
            <button onClick={() => setDeleteSuccessMsg(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {deleteError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{deleteError}</span>
            </span>
            <button onClick={() => setDeleteError(null)} className="text-rose-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: ACCOUNTS & ROSTER */}
        {activeTab === 'roster' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Classroom & Faculty Roster</h3>
                <p className="text-xs text-slate-400">
                  Manage student accounts, provision co-instructors, and delete accounts
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Course Filter */}
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Courses</option>
                  <option value="c">CS201: C Systems</option>
                  <option value="cpp">CS202: Modern C++</option>
                </select>

                {/* Provision Admin Button */}
                <button
                  id="btn-open-provision-admin"
                  onClick={() => setShowAdminModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-purple-950/50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Provision Admin</span>
                </button>
              </div>
            </div>

            {/* Search filter input */}
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by student name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Roster Cards */}
            <div className="grid grid-cols-1 gap-3">
              {filteredRoster.map((user) => {
                const isAdmin = user.role === 'admin';
                const isMasterAdmin = user.id === ADMIN_CREDENTIALS.id;
                const solved = user.solvedProblemIds.length;
                const isCurrentActive = currentUser.id === user.id;

                return (
                  <div
                    key={user.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isAdmin
                        ? 'bg-purple-950/20 border-purple-800/40 hover:border-purple-600/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <UserAvatar
                        avatar={user.avatar}
                        name={user.name}
                        className={`w-12 h-12 rounded-2xl text-2xl shadow-sm border ${
                          isAdmin
                            ? 'bg-purple-500/20 border-purple-500/40'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                        fallbackEmoji={isAdmin ? '👑' : '👨‍🎓'}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{user.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                              isAdmin
                                ? 'bg-purple-900/60 text-purple-300 border-purple-700/50'
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            {isAdmin ? 'INSTRUCTOR / ADMIN' : user.studentId || 'STU-GEN'}
                          </span>
                          {isMasterAdmin && (
                            <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40 font-bold flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Master Lead
                            </span>
                          )}
                          {isCurrentActive && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40 font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{user.enrolledCourse || user.title}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {!isAdmin && (
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Solved</span>
                          <span className="font-mono font-bold text-emerald-400 text-xs">{solved} Challenges</span>
                        </div>
                      )}

                      {/* Impersonate / Switch */}
                      <button
                        onClick={() => onSwitchUser(user)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 transition flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Switch Profile</span>
                      </button>

                      {/* Delete Account Button (Admin Only, Cannot Delete Master Cyrus) */}
                      {!isMasterAdmin ? (
                        <button
                          id={`btn-delete-user-${user.id}`}
                          onClick={() => setUserToDelete(user)}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-900/60 border border-rose-900/50 hover:border-rose-700 transition flex items-center gap-1.5"
                          title="Permanently remove this account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Account</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic px-2">Protected Master</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SUBMISSIONS & CODE REVIEW */}
        {activeTab === 'submissions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-7xl mx-auto h-full">
            {/* Submissions List */}
            <div className="lg:col-span-5 space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Submissions Feed</h3>
                <span className="text-[10px] text-slate-500 font-mono">{filteredSubmissions.length} records</span>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[580px] custom-scrollbar pr-1">
                {filteredSubmissions.map((sub) => {
                  const isSelected = selectedSubmission?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setGradeScore(sub.gradeScore || (sub.passed ? 100 : 70));
                        setFeedbackNote(sub.feedback || '');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          {sub.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span>{sub.userName}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {sub.language && (
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                              {sub.language}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                              sub.passed
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                                : 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                            }`}
                          >
                            {sub.passed ? 'Passed' : 'Failed Tests'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-purple-300 font-semibold mt-1 truncate">{sub.problemTitle}</p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
                        <span>Tests: {sub.passedTests}/{sub.totalTests}</span>
                        <span>{sub.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submission Code Detail & Grading Form */}
            <div className="lg:col-span-7 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-y-auto custom-scrollbar">
              {selectedSubmission ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{selectedSubmission.userName}</h4>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {selectedSubmission.studentId || 'Student'}
                        </span>
                      </div>
                      <p className="text-xs text-purple-300 mt-0.5">{selectedSubmission.problemTitle}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Submitted at {selectedSubmission.timestamp}</p>
                    </div>
                  </div>

                  {/* Student Code Box */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Submitted Source Code
                    </span>
                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto">
                      <code>{selectedSubmission.code}</code>
                    </pre>
                  </div>

                  {/* Grading Controls */}
                  <form onSubmit={handleGradeSubmit} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Instructor Evaluation</span>
                      {gradeSuccess && (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Grade Recorded!
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Score (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={gradeScore}
                          onChange={(e) => setGradeScore(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Feedback Comment</label>
                        <input
                          type="text"
                          placeholder="e.g. Good memory safety, check pointer bounds."
                          value={feedbackNote}
                          onChange={(e) => setFeedbackNote(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md"
                    >
                      Save Grade & Send Feedback
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2 p-8">
                  <FileCode className="w-10 h-10 text-slate-600" />
                  <p className="text-xs">Select a submission from the list on the left to inspect student code and grade.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CREATE C / C++ PROBLEM */}
        {activeTab === 'create-problem' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Publish New Challenge</h3>
                <p className="text-xs text-slate-400">
                  Create custom assignments and automated test cases for C Systems or Modern C++
                </p>
              </div>
              {publishSuccess && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Challenge Published to Students!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleCreateProblemSubmit} className="space-y-4">
              {/* Course Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Target Course</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleCourseChange('c')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition ${
                      problemCourse === 'c'
                        ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                      C
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-white">CS201: C Systems</span>
                      <span className="text-[10px] text-slate-400">Pointers, Structs, malloc</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCourseChange('cpp')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition ${
                      problemCourse === 'cpp'
                        ? 'bg-blue-950/40 border-blue-500 text-white ring-1 ring-blue-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-xs">
                      C++
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-white">CS202: Modern C++</span>
                      <span className="text-[10px] text-slate-400">Classes, STL, Templates</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Challenge Title</label>
                  <input
                    type="text"
                    required
                    placeholder={problemCourse === 'cpp' ? 'e.g. BankAccount Class with Encapsulation' : 'e.g. Binary Search in Sorted Array'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProblemCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    {problemCourse === 'c' ? (
                      <>
                        <option value="basics-io">Basics & I/O</option>
                        <option value="variables-data">Variables & Data</option>
                        <option value="operators">Operators</option>
                        <option value="conditionals">Conditionals</option>
                        <option value="loops">Loops</option>
                        <option value="arrays-strings">Arrays & Strings</option>
                        <option value="functions">Functions</option>
                        <option value="pointers">Pointers & Memory</option>
                        <option value="structs">Structs & Records</option>
                        <option value="custom">Custom Lab Exam</option>
                      </>
                    ) : (
                      <>
                        <option value="basics-io">C++ I/O & Streams</option>
                        <option value="references">References & Const</option>
                        <option value="classes-oop">Classes & OOP</option>
                        <option value="stl-containers">STL Containers (vector)</option>
                        <option value="templates">Templates & Generics</option>
                        <option value="smart-pointers">Smart Pointers & RAII</option>
                        <option value="custom">Custom Lab Exam</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Summary One-Liner</label>
                  <input
                    type="text"
                    placeholder="Brief description for challenge list"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Problem Description (Markdown / Rules)</label>
                <textarea
                  rows={3}
                  placeholder="Explain the problem requirements, formulas, and constraints..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              {/* Code Editors for Starter & Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Starter {problemCourse.toUpperCase()} Code (Given to Student)
                  </label>
                  <textarea
                    rows={6}
                    value={initialCode}
                    onChange={(e) => setInitialCode(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Instructor Reference Solution</label>
                  <textarea
                    rows={6}
                    value={solutionCode}
                    onChange={(e) => setSolutionCode(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Test Case Inputs */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Primary Validation Test Case
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Standard Input (stdin)</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 10"
                      value={testInput1}
                      onChange={(e) => setTestInput1(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Expected Output (stdout)</label>
                    <input
                      type="text"
                      placeholder="e.g. 15"
                      value={testOutput1}
                      onChange={(e) => setTestOutput1(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Normal test case"
                      value={testDesc1}
                      onChange={(e) => setTestDesc1(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Hint for Students</label>
                  <input
                    type="text"
                    placeholder="e.g. Use a while loop with low and high bounds."
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Arrays, Search, Pointers"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish Challenge to {problemCourse.toUpperCase()} Workspace</span>
              </button>
            </form>

            {/* Existing Custom Problems List */}
            {customProblems.length > 0 && (
              <div className="pt-6 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Published Custom Problems ({customProblems.length})
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {customProblems.map((cp) => (
                    <div
                      key={cp.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{cp.title}</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                            {cp.difficulty}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            {cp.courseId || 'c'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{cp.summary}</p>
                      </div>

                      <button
                        onClick={() => onDeleteCustomProblem(cp.id)}
                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition"
                        title="Delete custom challenge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STUDENT Q&A & AI REPLY */}
        {activeTab === 'qna' && (
          <div className="max-w-5xl mx-auto h-[620px] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Student Inquiries & Instructor AI Reply Hub</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Direct message threads from students with code snippets. Reply manually as Instructor CYRUS or use Gemini AI to draft responses.
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ClassroomChatWidget
                currentUser={currentUser}
                isEmbedded={true}
                isOpen={true}
              />
            </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="max-w-5xl mx-auto space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
                  Concept Mastery Breakdown
                </span>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Pointers & Memory Addresses</span>
                      <span className="font-mono font-bold text-emerald-400">82%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Loops & Iterations</span>
                      <span className="font-mono font-bold text-emerald-400">94%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Classes & Encapsulation (C++)</span>
                      <span className="font-mono font-bold text-blue-400">76%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '76%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Common Student Pitfalls Recorded */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Most Frequent Student Pitfalls</span>
                </span>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span>Missing `&` address-of operator in scanf</span>
                    <span className="text-rose-400 font-mono font-bold text-[10px]">14 occurrences</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span>Integer division truncation (`5 / 2 == 2`)</span>
                    <span className="text-rose-400 font-mono font-bold text-[10px]">9 occurrences</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span>Off-by-one error in null-terminated strings</span>
                    <span className="text-rose-400 font-mono font-bold text-[10px]">8 occurrences</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Delete User Confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete User Account?</h3>
                <p className="text-xs text-slate-400">Permanent action</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete the account for <strong className="text-white">{userToDelete.name}</strong> ({userToDelete.email})? This will permanently remove their access, submissions, and roster entry.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-account"
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-rose-950/50"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Provision New Admin Account (Admin Only) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Provision Admin Account</h3>
                  <p className="text-[11px] text-slate-400">Authorize a co-instructor or lab administrator</p>
                </div>
              </div>
              <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminModalError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                {adminModalError}
              </div>
            )}

            {adminModalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{adminModalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Instructor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Doe"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Instructor Email</label>
                <input
                  type="email"
                  required
                  placeholder="instructor@university.edu"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Role / Academic Title</label>
                <input
                  type="text"
                  value={newAdminTitle}
                  onChange={(e) => setNewAdminTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Admin Password (min 6 chars)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                id="btn-submit-create-admin"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-purple-950/50 mt-2"
              >
                Authorize & Create Admin
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
