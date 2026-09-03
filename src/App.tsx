import React, { useState, useEffect, useMemo } from 'react';
import { C_PRACTICE_PROBLEMS } from './data/cProblems';
import { CPP_PRACTICE_PROBLEMS } from './data/cppProblems';
import { PracticeProblem, ExecutionResult, MemorySnapshot, User, SubmissionRecord, CourseId } from './types';
import { CInterpreter, runCTestCases } from './services/cRunner';
import { AuthService } from './services/authService';
import { Header } from './components/Header';
import { ProblemSidebar } from './components/ProblemSidebar';
import { ProblemDescription } from './components/ProblemDescription';
import { CodeEditor } from './components/CodeEditor';
import { TerminalOutput } from './components/TerminalOutput';
import { MemoryVisualizer } from './components/MemoryVisualizer';
import { CheatsheetModal } from './components/CheatsheetModal';
import { QuizModal } from './components/QuizModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ClassroomChatWidget } from './components/ClassroomChatWidget';
import { LeaderboardView } from './components/LeaderboardView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => AuthService.getCurrentUser());
  const [activeCourseId, setActiveCourseId] = useState<CourseId>(() => {
    const user = AuthService.getCurrentUser();
    if (user?.enrolledCourse === 'cpp' || user?.enrolledCourse?.toLowerCase().includes('cpp') || user?.enrolledCourse?.toLowerCase().includes('c++')) {
      return 'cpp';
    }
    return 'c';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [customProblems, setCustomProblems] = useState<PracticeProblem[]>(() => AuthService.getCustomProblems());
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>(() => AuthService.getSubmissions());

  // Combined problems: built-in C curriculum + C++ curriculum + instructor custom labs
  const allProblems = useMemo(() => {
    return [...C_PRACTICE_PROBLEMS, ...CPP_PRACTICE_PROBLEMS, ...customProblems];
  }, [customProblems]);

  // Real-time synchronization with Firestore online database
  useEffect(() => {
    const unsubUsers = AuthService.subscribeUsers((users) => {
      setCurrentUser((prev) => {
        if (!prev) return null;
        const matched = users.find((u) => u.id === prev.id);
        return matched || prev;
      });
    });

    const unsubSubs = AuthService.subscribeSubmissions((subs) => {
      setSubmissions(subs);
    });

    const unsubProblems = AuthService.subscribeCustomProblems((probs) => {
      setCustomProblems(probs);
    });

    return () => {
      unsubUsers();
      unsubSubs();
      unsubProblems();
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'problems' | 'sandbox' | 'quiz' | 'cheatsheet' | 'memory' | 'awards' | 'admin'>('problems');
  const [selectedProblemId, setSelectedProblemId] = useState<string>(() => {
    const user = AuthService.getCurrentUser();
    if (user && (user.enrolledCourse === 'cpp' || user.enrolledCourse?.toLowerCase().includes('cpp') || user.enrolledCourse?.toLowerCase().includes('c++'))) {
      return CPP_PRACTICE_PROBLEMS[0]?.id || C_PRACTICE_PROBLEMS[0].id;
    }
    return C_PRACTICE_PROBLEMS[0].id;
  });
  const [code, setCode] = useState<string>(() => {
    const user = AuthService.getCurrentUser();
    if (user && (user.enrolledCourse === 'cpp' || user.enrolledCourse?.toLowerCase().includes('cpp') || user.enrolledCourse?.toLowerCase().includes('c++'))) {
      return CPP_PRACTICE_PROBLEMS[0]?.initialCode || C_PRACTICE_PROBLEMS[0].initialCode;
    }
    return C_PRACTICE_PROBLEMS[0].initialCode;
  });
  const [stdin, setStdin] = useState<string>(() => {
    const user = AuthService.getCurrentUser();
    if (user && (user.enrolledCourse === 'cpp' || user.enrolledCourse?.toLowerCase().includes('cpp') || user.enrolledCourse?.toLowerCase().includes('c++'))) {
      return CPP_PRACTICE_PROBLEMS[0]?.testCases[0]?.input || '';
    }
    return C_PRACTICE_PROBLEMS[0].testCases[0]?.input || '';
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [memorySnapshots, setMemorySnapshots] = useState<MemorySnapshot[]>([]);

  // Enforce access control: If user is not admin and tries to open admin, redirect back to problems
  useEffect(() => {
    if (currentUser?.role !== 'admin' && activeTab === 'admin') {
      setActiveTab('problems');
    }
  }, [currentUser?.role, activeTab]);

  // Solved problem ids for the current user
  const solvedProblemIds = useMemo(() => {
    return new Set(currentUser?.solvedProblemIds || []);
  }, [currentUser?.solvedProblemIds]);

  const activeProblem = useMemo(() => {
    return allProblems.find((p) => p.id === selectedProblemId) || allProblems[0] || C_PRACTICE_PROBLEMS[0];
  }, [allProblems, selectedProblemId]);

  // Find last submission for the current user on the current problem
  const lastSubmission = useMemo(() => {
    if (!currentUser) return undefined;
    return submissions.find(
      (s) => s.userId === currentUser.id && s.problemId === activeProblem?.id
    );
  }, [submissions, currentUser, activeProblem?.id]);

  // Handle switching course
  const handleSelectCourse = (courseId: CourseId) => {
    setActiveCourseId(courseId);
    // Find first problem matching the course
    const firstCourseProblem = allProblems.find((p) => p.courseId === courseId);
    if (firstCourseProblem) {
      setSelectedProblemId(firstCourseProblem.id);
      setCode(firstCourseProblem.initialCode);
      setStdin(firstCourseProblem.testCases[0]?.input || '');
      setExecutionResult(null);
    }
  };

  // Handle switching user
  const handleSwitchUser = (user: User) => {
    AuthService.setCurrentUser(user);
    setCurrentUser(user);
    const isCpp = user?.enrolledCourse === 'cpp' || user?.enrolledCourse?.toLowerCase().includes('cpp') || user?.enrolledCourse?.toLowerCase().includes('c++');
    const course: CourseId = isCpp ? 'cpp' : 'c';
    setActiveCourseId(course);

    // Pick first problem for this course
    const courseProblems = allProblems.filter((p) => p.courseId === course);
    if (courseProblems.length > 0) {
      setSelectedProblemId(courseProblems[0].id);
      setCode(courseProblems[0].initialCode);
      setStdin(courseProblems[0].testCases[0]?.input || '');
    }

    // Reload submissions and custom problems
    setSubmissions(AuthService.getSubmissions());
    setCustomProblems(AuthService.getCustomProblems());
    if (user?.role === 'student' && activeTab === 'admin') {
      setActiveTab('problems');
    }
  };


  // When problem selection changes in Problems mode
  const handleSelectProblem = (problemId: string) => {
    setSelectedProblemId(problemId);
    const p = allProblems.find((prob) => prob.id === problemId);
    if (p) {
      setCode(p.initialCode);
      setStdin(p.testCases[0]?.input || '');
      setExecutionResult(null);
    }
  };

  // Run user code with current stdin
  const handleRunCode = () => {
    setIsRunning(true);
    setExecutionResult(null);

    setTimeout(() => {
      try {
        const interpreter = new CInterpreter();
        const res = interpreter.run(code, stdin);
        setExecutionResult(res);
        if (res.snapshots.length > 0) {
          setMemorySnapshots(res.snapshots);
        }
      } catch (err: any) {
        setExecutionResult({
          output: '',
          error: err.message || 'Execution error occurred.',
          executionTimeMs: 0,
          exitCode: 1,
          warnings: [],
          snapshots: [],
        });
      } finally {
        setIsRunning(false);
      }
    }, 50);
  };

  // Validate code against all test cases of the problem
  const handleRunTestCases = () => {
    if (!activeProblem || activeProblem.testCases.length === 0) {
      handleRunCode();
      return;
    }

    setIsRunning(true);
    setTimeout(() => {
      try {
        const res = runCTestCases(code, activeProblem.testCases);
        setExecutionResult(res);
        if (res.snapshots.length > 0) {
          setMemorySnapshots(res.snapshots);
        }

        // If all tests pass, mark as solved in current user record
        if (res.testResults && res.testResults.failed === 0) {
          const updatedUser = AuthService.updateSolvedProblem(currentUser.id, activeProblem.id);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        }
      } finally {
        setIsRunning(false);
      }
    }, 50);
  };

  // Submit solution to instructor / classroom
  const handleSubmitSolution = () => {
    if (!activeProblem) return;
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const res = runCTestCases(code, activeProblem.testCases);
        setExecutionResult(res);
        if (res.snapshots.length > 0) {
          setMemorySnapshots(res.snapshots);
        }

        const passed = res.testResults ? res.testResults.passed : 0;
        const total = activeProblem.testCases.length || 1;
        const gradeScore = Math.round((passed / total) * 100);

        // Record submission
        const isPassed = passed === total;
        AuthService.recordSubmission({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          userRole: currentUser.role,
          studentId: currentUser.studentId,
          problemId: activeProblem.id,
          problemTitle: activeProblem.title,
          code,
          passed: isPassed,
          passedTests: passed,
          totalTests: total,
          gradeScore,
          executionTimeMs: res.executionTimeMs,
          feedback: isPassed ? 'All unit tests passed. Clean syntax structure!' : 'Some test assertions failed. Review edge cases.',
        });

        if (isPassed) {
          const updatedUser = AuthService.updateSolvedProblem(currentUser.id, activeProblem.id);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        }

        // Refresh submissions
        setSubmissions(AuthService.getSubmissions());
      } finally {
        setIsSubmitting(false);
      }
    }, 80);
  };

  // Reset starter code
  const handleResetStarterCode = () => {
    if (activeProblem) {
      setCode(activeProblem.initialCode);
      setStdin(activeProblem.testCases[0]?.input || '');
    }
  };

  // Apply solution code
  const handleApplySolutionCode = () => {
    if (activeProblem) {
      setCode(activeProblem.solutionCode);
    }
  };

  // Export current code as .c file
  const handleDownloadCode = () => {
    const filename = activeTab === 'problems' ? `${activeProblem.id}.c` : 'main.c';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Custom problem created by instructor
  const handleAddCustomProblem = (newProb: PracticeProblem) => {
    AuthService.addCustomProblem(newProb);
    const updated = AuthService.getCustomProblems();
    setCustomProblems(updated);
    setSelectedProblemId(newProb.id);
    setCode(newProb.initialCode);
    setStdin(newProb.testCases[0]?.input || '');
    setActiveTab('problems');
  };

  // Custom problem deleted by instructor
  const handleDeleteCustomProblem = (problemId: string) => {
    AuthService.deleteCustomProblem(problemId);
    const updated = AuthService.getCustomProblems();
    setCustomProblems(updated);
    if (selectedProblemId === problemId) {
      setSelectedProblemId(C_PRACTICE_PROBLEMS[0].id);
    }
  };

  // User logout
  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    if (activeTab === 'admin') {
      setActiveTab('problems');
    }
  };

  // Quiz completed
  const handleQuizComplete = (score: number, total: number) => {
    if (!currentUser) return;
    const updated = AuthService.updateQuizScore(currentUser.id, score, total);
    if (updated) {
      setCurrentUser(updated);
    }
  };

  // Mandatory Authentication Gate: Require login or registration first before accessing the workspace
  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden items-center justify-center p-4 relative select-none">
        {/* Ambient background styling */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-36 left-1/3 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

        <AuthModal
          isOpen={true}
          currentUser={null}
          onUserChange={handleSwitchUser}
          isMandatory={true}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Application Header with Auth & Admin tabs */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        solvedCount={solvedProblemIds.size}
        totalCount={allProblems.length}
        onRunCode={handleRunCode}
        isRunning={isRunning}
        onDownloadCode={handleDownloadCode}
        activeProblemTitle={activeProblem?.title}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        activeCourseId={activeCourseId}
        onSelectCourse={handleSelectCourse}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 overflow-hidden p-3 md:p-4">
        {activeTab === 'problems' && (
          <div className="w-full h-full flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden">
            {/* Left Bento: Problem Selector */}
            <div className="w-full md:w-72 lg:w-80 h-56 md:h-full shrink-0">
              <ProblemSidebar
                problems={allProblems}
                selectedProblemId={selectedProblemId}
                onSelectProblem={handleSelectProblem}
                solvedProblemIds={solvedProblemIds}
                activeCourseId={activeCourseId}
                onSelectCourse={handleSelectCourse}
              />
            </div>

            {/* Center Bento: Problem Description & Submission Actions */}
            <div className="w-full md:w-80 lg:w-96 h-64 md:h-full shrink-0">
              <ProblemDescription
                problem={activeProblem}
                onApplyStarterCode={handleResetStarterCode}
                onApplySolutionCode={handleApplySolutionCode}
                isSolved={solvedProblemIds.has(activeProblem.id)}
                currentUser={currentUser}
                onSubmitSolution={handleSubmitSolution}
                isSubmitting={isSubmitting}
                lastSubmission={lastSubmission}
              />
            </div>

            {/* Right Bento: Code Editor & Terminal Console */}
            <div className="flex-1 flex flex-col gap-3 md:gap-4 h-full min-w-0 overflow-hidden">
              <div className="flex-1 min-h-[260px] overflow-hidden">
                <CodeEditor
                  code={code}
                  onChangeCode={setCode}
                  stdin={stdin}
                  onChangeStdin={setStdin}
                  onRunCode={handleRunCode}
                  isRunning={isRunning}
                  sampleInputs={activeProblem.testCases.map((tc) => tc.input).filter(Boolean)}
                />
              </div>
              <div className="h-60 sm:h-64 lg:h-72 shrink-0">
                <TerminalOutput
                  result={executionResult}
                  isRunning={isRunning}
                  onClear={() => setExecutionResult(null)}
                  onRunTestCases={handleRunTestCases}
                  testCases={activeProblem.testCases}
                  code={code}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sandbox' && (
          <div className="w-full h-full flex flex-col lg:flex-row gap-3 md:gap-4 overflow-hidden">
            {/* Free Coding Editor */}
            <div className="flex-1 flex flex-col gap-3 md:gap-4 h-full min-w-0 overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  code={code}
                  onChangeCode={setCode}
                  stdin={stdin}
                  onChangeStdin={setStdin}
                  onRunCode={handleRunCode}
                  isRunning={isRunning}
                />
              </div>
              <div className="h-64 sm:h-72 lg:h-80 shrink-0">
                <TerminalOutput
                  result={executionResult}
                  isRunning={isRunning}
                  onClear={() => setExecutionResult(null)}
                  code={code}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="w-full h-full flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden">
            <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-hidden">
              <CodeEditor
                code={code}
                onChangeCode={setCode}
                stdin={stdin}
                onChangeStdin={setStdin}
                onRunCode={handleRunCode}
                isRunning={isRunning}
              />
            </div>
            <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-hidden">
              <MemoryVisualizer snapshots={memorySnapshots.length > 0 ? memorySnapshots : executionResult?.snapshots || []} />
            </div>
          </div>
        )}

        {activeTab === 'cheatsheet' && (
          <div className="w-full h-full overflow-hidden">
            <CheatsheetModal
              activeCourseId={activeCourseId}
              onInsertSnippet={(snippet) => {
                setCode(snippet);
                setActiveTab('sandbox');
              }}
            />
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="w-full h-full overflow-hidden">
            <QuizModal
              currentUser={currentUser}
              activeCourseId={activeCourseId}
              onQuizComplete={handleQuizComplete}
            />
          </div>
        )}

        {/* Awards & Student Leaderboard View */}
        {activeTab === 'awards' && (
          <div className="w-full h-full overflow-hidden">
            <LeaderboardView
              currentUser={currentUser}
              activeCourseId={activeCourseId}
              onSelectProblem={(problemId) => {
                setSelectedProblemId(problemId);
                setActiveTab('problems');
              }}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          </div>
        )}

        {/* Admin Dashboard (Exclusive to Instructor / Admin) */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <div className="w-full h-full overflow-hidden">
            <AdminDashboard
              currentUser={currentUser}
              onSwitchUser={handleSwitchUser}
              customProblems={customProblems}
              onAddCustomProblem={handleAddCustomProblem}
              onDeleteCustomProblem={handleDeleteCustomProblem}
            />
          </div>
        )}
      </div>

      {/* Floating / Expandable Classroom & AI Chat Widget */}
      <ClassroomChatWidget
        currentUser={currentUser}
        activeProblem={activeProblem}
        currentCode={code}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpenLogin={() => setIsAuthModalOpen(true)}
      />

      {/* Auth & Role Switching Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={handleSwitchUser}
        onLogout={handleLogout}
      />
    </div>
  );
}


