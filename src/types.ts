export type CourseId = 'c' | 'cpp';

export interface Course {
  id: CourseId;
  name: string;
  code: string;
  badge: string;
  accentColor: string;
  description: string;
  language: 'c' | 'cpp';
  level: string;
  topicsCount?: number;
}

export type ProblemCategory =
  | 'basics-io'
  | 'variables-data'
  | 'operators'
  | 'conditionals'
  | 'loops'
  | 'arrays-strings'
  | 'functions'
  | 'pointers'
  | 'structs'
  | 'classes-oop'
  | 'references'
  | 'stl-containers'
  | 'smart-pointers'
  | 'templates'
  | 'custom';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  studentId?: string;
  enrolledCourse?: string;
  bio?: string;
  solvedProblemIds: string[];
  streak: number;
  lastActive: string;
  quizScore?: {
    score: number;
    total: number;
    percentage: number;
    completedAt: string;
  };
  submissionsCount: number;
}

export interface SubmissionRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userRole: UserRole;
  studentId?: string;
  problemId: string;
  problemTitle: string;
  courseId?: CourseId;
  language?: 'c' | 'cpp';
  code: string;
  passed: boolean;
  passedTests: number;
  totalTests: number;
  timestamp: string;
  executionTimeMs?: number;
  feedback?: string;
  gradeScore?: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
  isHidden?: boolean;
}

export interface PracticeProblem {
  id: string;
  title: string;
  category: ProblemCategory;
  difficulty: Difficulty;
  summary: string;
  description: string;
  learningPoints: string[];
  initialCode: string;
  solutionCode: string;
  explanation: string;
  testCases: TestCase[];
  hint: string;
  commonPitfalls: string[];
  tags: string[];
  createdBy?: string;
  isCustom?: boolean;
  courseId?: CourseId;
  language?: 'c' | 'cpp';
}

export interface VariableSnapshot {
  name: string;
  type: string;
  value: string | number | boolean | Array<any>;
  address: string;
  isPointer?: boolean;
  pointsToAddress?: string;
  isParam?: boolean;
}

export interface StackFrameSnapshot {
  functionName: string;
  variables: VariableSnapshot[];
}

export interface MemorySnapshot {
  step: number;
  line: number;
  codeSnippet: string;
  stackFrames: StackFrameSnapshot[];
  stdout: string;
}

export interface ExecutionResult {
  output: string;
  error: string | null;
  executionTimeMs: number;
  exitCode: number;
  warnings: string[];
  snapshots: MemorySnapshot[];
  testResults?: {
    total: number;
    passed: number;
    failed: number;
    details: Array<{
      testId: string;
      description: string;
      input: string;
      expected: string;
      actual: string;
      passed: boolean;
    }>;
  };
}

export interface QuizQuestion {
  id: string;
  category: ProblemCategory;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  courseId?: CourseId;
}

export interface CheatsheetTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  code: string;
  notes?: string[];
  courseId?: CourseId;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole | 'ai';
  senderAvatar?: string;
  recipientId?: string; // If direct message to a student or admin
  recipientName?: string;
  content: string;
  codeSnippet?: string;
  timestamp: string;
  isAI?: boolean;
  isInstructorReply?: boolean;
  relatedProblemId?: string;
  relatedProblemTitle?: string;
}
