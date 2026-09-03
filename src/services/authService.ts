import { User, SubmissionRecord, PracticeProblem, ChatMessage } from '../types';
import { C_PRACTICE_PROBLEMS } from '../data/cProblems';
import { CPP_PRACTICE_PROBLEMS } from '../data/cppProblems';

export const ADMIN_CREDENTIALS = {
  id: 'admin-cyrus',
  name: 'CYRUS',
  email: 'benito.cc.bsinfotech@gmail.com',
  password: '246813579cycy',
  role: 'admin' as const,
  avatar: '👑',
  title: 'Lead Instructor & Systems Lab Administrator',
  bio: 'Lead Systems Architect & Lab Instructor. Demystifying low-level memory, concurrency, and compilers.',
  enrolledCourse: 'CS201: C Systems Programming & Architecture',
};

export const DEFAULT_USERS: User[] = [
  {
    id: ADMIN_CREDENTIALS.id,
    name: ADMIN_CREDENTIALS.name,
    email: ADMIN_CREDENTIALS.email,
    role: 'admin',
    avatar: '👑',
    title: ADMIN_CREDENTIALS.title,
    bio: ADMIN_CREDENTIALS.bio,
    enrolledCourse: 'CS201: C Systems Programming & Architecture',
    solvedProblemIds: [
      'hello-world',
      'formatted-user-card',
      'arithmetic-operators',
      'bitwise-flags',
      'even-odd-parity',
      'grade-calculator',
      'factorial-loop',
      'fibonacci-series',
      'reverse-array',
      'matrix-transpose',
      'string-length-palindrome',
      'string-concatenation',
      'pointer-swap',
      'array-sum-pointers',
      'dynamic-array-growth',
      'student-database-struct',
      'linked-list-node-insert',
    ],
    streak: 30,
    lastActive: 'Active now',
    submissionsCount: 45,
  },
  {
    id: 'student-alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@c-mastery.edu',
    role: 'student',
    avatar: '👨‍💻',
    title: 'Undergraduate CS Student',
    bio: 'Aspiring systems software engineer. Aiming to master low-level pointers and algorithms. Target: Pwede ka na mag 2nd year! 🚀',
    studentId: 'STU-2026-101',
    enrolledCourse: 'CS201: C Systems Programming & Architecture',
    solvedProblemIds: [
      'hello-world',
      'formatted-user-card',
      'arithmetic-operators',
      'even-odd-parity',
      'factorial-loop',
      'pointer-swap',
    ],
    streak: 7,
    lastActive: '5 mins ago',
    quizScore: {
      score: 9,
      total: 10,
      percentage: 90,
      completedAt: '2026-09-01',
    },
    submissionsCount: 9,
  },
  {
    id: 'student-sarah',
    name: 'Sarah Chen',
    email: 'sarah.chen@c-mastery.edu',
    role: 'student',
    avatar: '👩‍💻',
    title: 'Software Engineering Junior',
    bio: "Targeting high-frequency trading and kernel development. Pointers don't scare me! ⚡",
    studentId: 'STU-2026-104',
    enrolledCourse: 'CS201: C Systems Programming & Architecture',
    solvedProblemIds: [
      'hello-world',
      'formatted-user-card',
      'arithmetic-operators',
      'even-odd-parity',
      'grade-calculator',
      'factorial-loop',
      'fibonacci-series',
      'reverse-array',
      'pointer-swap',
      'array-sum-pointers',
      'student-database-struct',
    ],
    streak: 15,
    lastActive: '45 mins ago',
    quizScore: {
      score: 10,
      total: 10,
      percentage: 100,
      completedAt: '2026-09-02',
    },
    submissionsCount: 16,
  },
  {
    id: 'student-marcus',
    name: 'Marcus Vance',
    email: 'marcus.v@c-mastery.edu',
    role: 'student',
    avatar: '🧑‍💻',
    title: 'Computer Engineering Sophomore',
    bio: 'Passionate about embedded systems, robotics, and hardware-software co-design. 🤖',
    studentId: 'STU-2026-109',
    enrolledCourse: 'CS201: C Systems Programming & Architecture',
    solvedProblemIds: ['hello-world', 'formatted-user-card', 'arithmetic-operators', 'even-odd-parity'],
    streak: 3,
    lastActive: 'Yesterday',
    quizScore: {
      score: 7,
      total: 10,
      percentage: 70,
      completedAt: '2026-08-30',
    },
    submissionsCount: 5,
  },
  {
    id: 'student-elena',
    name: 'Elena Rostova',
    email: 'elena.r@c-mastery.edu',
    role: 'student',
    avatar: '👩‍🔬',
    title: 'Data Systems Sophomore',
    bio: 'Exploring STL containers, templates, and high-performance Modern C++ architecture. 💡',
    studentId: 'STU-2026-112',
    enrolledCourse: 'CS202: Modern C++ (Object-Oriented & STL)',
    solvedProblemIds: [
      'cpp-hello-world',
      'cpp-vector-sum',
      'cpp-string-palindrome',
      'cpp-rectangle-class',
      'cpp-unique-ptr-demo',
      'hello-world',
      'arithmetic-operators',
      'even-odd-parity',
    ],
    streak: 11,
    lastActive: '2 hours ago',
    quizScore: {
      score: 9,
      total: 10,
      percentage: 90,
      completedAt: '2026-09-02',
    },
    submissionsCount: 14,
  },
  {
    id: 'student-liam',
    name: 'Liam Patel',
    email: 'liam.p@c-mastery.edu',
    role: 'student',
    avatar: '👨‍🎓',
    title: 'Robotics Engineering Junior',
    bio: 'C & C++ control loops for robotics microcontrollers. Practice makes perfect. ⚙️',
    studentId: 'STU-2026-118',
    enrolledCourse: 'CS201: C Systems Programming & Architecture',
    solvedProblemIds: [
      'hello-world',
      'formatted-user-card',
      'arithmetic-operators',
      'factorial-loop',
      'fibonacci-series',
      'pointer-swap',
    ],
    streak: 6,
    lastActive: '3 hours ago',
    quizScore: {
      score: 8,
      total: 10,
      percentage: 80,
      completedAt: '2026-09-01',
    },
    submissionsCount: 8,
  },
];


export const INITIAL_SUBMISSIONS: SubmissionRecord[] = [
  {
    id: 'sub-101',
    userId: 'student-sarah',
    userName: 'Sarah Chen',
    userEmail: 'sarah.chen@c-mastery.edu',
    userRole: 'student',
    studentId: 'STU-2026-104',
    problemId: 'pointer-swap',
    problemTitle: 'Pointer Swap Function',
    code: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x, y;
    if (scanf("%d %d", &x, &y) == 2) {
        printf("Before: x = %d, y = %d\\n", x, y);
        swap(&x, &y);
        printf("After:  x = %d, y = %d\\n", x, y);
    }
    return 0;
}`,
    passed: true,
    passedTests: 2,
    totalTests: 2,
    timestamp: '2026-09-02 08:30 AM',
    executionTimeMs: 14,
    gradeScore: 100,
    feedback: 'Excellent clean pointer dereferencing implementation.',
  },
  {
    id: 'sub-102',
    userId: 'student-alex',
    userName: 'Alex Rivera',
    userEmail: 'alex.rivera@c-mastery.edu',
    userRole: 'student',
    studentId: 'STU-2026-101',
    problemId: 'factorial-loop',
    problemTitle: 'Factorial Computation (Loops)',
    code: `#include <stdio.h>

int main() {
    int n;
    long long fact = 1;
    if (scanf("%d", &n) == 1) {
        for (int i = 1; i <= n; i++) {
            fact *= i;
        }
        printf("%lld\\n", fact);
    }
    return 0;
}`,
    passed: true,
    passedTests: 3,
    totalTests: 3,
    timestamp: '2026-09-02 08:15 AM',
    executionTimeMs: 9,
    gradeScore: 98,
    feedback: 'Correct usage of long long to prevent 32-bit overflow.',
  },
  {
    id: 'sub-103',
    userId: 'student-marcus',
    userName: 'Marcus Vance',
    userEmail: 'marcus.v@c-mastery.edu',
    userRole: 'student',
    studentId: 'STU-2026-109',
    problemId: 'even-odd-parity',
    problemTitle: 'Parity & Sign Checker',
    code: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    if (n % 2 == 0) {
        printf("%d is Even\\n", n);
    } else {
        printf("%d is Odd\\n", n);
    }
    return 0;
}`,
    passed: false,
    passedTests: 2,
    totalTests: 3,
    timestamp: '2026-09-01 04:45 PM',
    executionTimeMs: 11,
    gradeScore: 70,
    feedback: 'Remember to check edge case for negative numbers or 0.',
  },
];

const STORAGE_KEY_USER = 'c_auth_current_user_v5';
const STORAGE_KEY_USERS_LIST = 'c_auth_all_users_v4';
const STORAGE_KEY_PASSWORDS = 'c_auth_passwords_v4';
const STORAGE_KEY_SUBMISSIONS = 'c_auth_submissions_v4';
const STORAGE_KEY_CUSTOM_PROBLEMS = 'c_auth_custom_problems_v4';
const STORAGE_KEY_CHAT_MESSAGES = 'c_classroom_chat_messages_v5';

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    threadId: 'general',
    senderId: ADMIN_CREDENTIALS.id,
    senderName: ADMIN_CREDENTIALS.name,
    senderRole: 'admin',
    senderAvatar: '👑',
    content: `Anong tanong nyo mga bata, CYGPT nga pala AHHAHAHAAHAHAHAHA sige tanong 24/7`,
    timestamp: 'Today, 8:00 AM',
    isInstructorReply: true,
  },
  {
    id: 'msg-alex-1',
    threadId: 'student-alex',
    senderId: 'student-alex',
    senderName: 'Alex Rivera',
    senderRole: 'student',
    senderAvatar: '👨‍💻',
    recipientId: ADMIN_CREDENTIALS.id,
    recipientName: ADMIN_CREDENTIALS.name,
    content: `Hello Instructor Cyrus! In the Pointer Swap problem, why is passing pointers required rather than just passing the normal integer values?`,
    codeSnippet: `void swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
}`,
    timestamp: 'Today, 8:15 AM',
    relatedProblemId: 'pointer-swap',
    relatedProblemTitle: 'Pointer Swap Function',
  },
  {
    id: 'msg-cyrus-reply-alex',
    threadId: 'student-alex',
    senderId: ADMIN_CREDENTIALS.id,
    senderName: ADMIN_CREDENTIALS.name,
    senderRole: 'admin',
    senderAvatar: '👑',
    recipientId: 'student-alex',
    recipientName: 'Alex Rivera',
    content: `Great question Alex! In C, all function arguments are passed by value (copied onto the stack). If you pass 'int a, int b', the function modifies its local copies only, leaving the caller variables untouched. By passing pointer addresses ('int *a, int *b') and dereferencing them ('*a = *b'), you modify the actual memory cells in the caller's stack frame!`,
    codeSnippet: `void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}`,
    timestamp: 'Today, 8:20 AM',
    isInstructorReply: true,
  },
  {
    id: 'msg-sarah-1',
    threadId: 'student-sarah',
    senderId: 'student-sarah',
    senderName: 'Sarah Chen',
    senderRole: 'student',
    senderAvatar: '👩‍💻',
    recipientId: ADMIN_CREDENTIALS.id,
    recipientName: ADMIN_CREDENTIALS.name,
    content: `Hi Cyrus, when allocating dynamic memory with malloc, what is the best practice for checking if the allocation succeeded?`,
    timestamp: 'Today, 8:40 AM',
    relatedProblemId: 'dynamic-array-growth',
    relatedProblemTitle: 'Dynamic Array Resizing',
  },
  {
    id: 'msg-ai-sarah',
    threadId: 'student-sarah',
    senderId: 'ai-tutor',
    senderName: 'AI C Tutor',
    senderRole: 'ai',
    senderAvatar: '🤖',
    recipientId: 'student-sarah',
    recipientName: 'Sarah Chen',
    content: `Always check if the returned pointer is NULL before accessing it! If the system runs out of heap memory, malloc returns NULL. Dereferencing NULL causes a segmentation fault.`,
    codeSnippet: `int *arr = (int *)malloc(10 * sizeof(int));
if (arr == NULL) {
    fprintf(stderr, "Memory allocation failed!\\n");
    return 1;
}
// Safe to use arr
free(arr);`,
    timestamp: 'Today, 8:42 AM',
    isAI: true,
  },
];

export class AuthService {
  private static getPasswordMap(): Record<string, string> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PASSWORDS);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed default admin password
    const initialMap: Record<string, string> = {
      [ADMIN_CREDENTIALS.email.toLowerCase()]: ADMIN_CREDENTIALS.password,
    };
    this.savePasswordMap(initialMap);
    return initialMap;
  }

  private static savePasswordMap(map: Record<string, string>): void {
    try {
      localStorage.setItem(STORAGE_KEY_PASSWORDS, JSON.stringify(map));
    } catch {}
  }

  static verifyAdminCredentials(email: string, password?: string): boolean {
    const isEmailMatch = email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
    const isPasswordMatch = password === ADMIN_CREDENTIALS.password;
    return isEmailMatch && isPasswordMatch;
  }

  static getUsers(): User[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        // Ensure default seeded students are present if storage was created earlier
        const existingIds = new Set(parsed.map((u) => u.id));
        let changed = false;
        DEFAULT_USERS.forEach((du) => {
          if (!existingIds.has(du.id)) {
            parsed.push(du);
            changed = true;
          }
        });
        if (changed) {
          this.saveUsers(parsed);
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    this.saveUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }

  static saveUsers(users: User[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users));
    } catch {
      // ignore
    }
  }

  // Returns active logged in user or null if not logged in
  static getCurrentUser(): User | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        const users = this.getUsers();
        const found = users.find((u) => u.id === parsed.id);
        if (found) return found;
        return parsed;
      }
    } catch {
      // fallback
    }
    return null;
  }

  static setCurrentUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch {
      // ignore
    }
  }

  static logout(): void {
    this.setCurrentUser(null);
  }

  // Standard Login (for both Student and Admin)
  static login(email: string, password?: string): { user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { error: 'Please enter a valid email address.' };
    }

    const users = this.getUsers();
    const passMap = this.getPasswordMap();

    // 1. Check if CYRUS Master Admin
    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      if (password !== ADMIN_CREDENTIALS.password) {
        return {
          error: `Incorrect password for Lead Instructor ${ADMIN_CREDENTIALS.name}.`,
        };
      }
      const adminUser = users.find((u) => u.id === ADMIN_CREDENTIALS.id) || DEFAULT_USERS[0];
      const updatedAdmin = { ...adminUser, lastActive: 'Active now' };
      this.updateUser(updatedAdmin);
      this.setCurrentUser(updatedAdmin);
      return { user: updatedAdmin };
    }

    // 2. Find in existing user roster
    let existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      // Check stored password if set
      const storedPass = passMap[cleanEmail];
      if (storedPass && password && storedPass !== password) {
        return { error: 'Incorrect password. Please verify your credentials.' };
      }

      // If user had no stored password yet, save the provided password
      if (!storedPass && password) {
        passMap[cleanEmail] = password;
        this.savePasswordMap(passMap);
      }

      existing = { ...existing, lastActive: 'Active now' };
      this.updateUser(existing);
      this.setCurrentUser(existing);
      return { user: existing };
    }

    return {
      error: 'Account not found. Please register as a new student or check your email address.',
    };
  }

  // Public Registration - STRICTLY STUDENT ROLE ONLY
  static registerStudent(
    name: string,
    email: string,
    password?: string,
    studentId?: string,
    courseChoice: 'c' | 'cpp' = 'c'
  ): { user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { error: 'Please enter a valid email address.' };
    }
    if (!name.trim()) {
      return { error: 'Please enter your full name.' };
    }
    if (!password || password.length < 4) {
      return { error: 'Password must be at least 4 characters long.' };
    }

    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { error: 'An account with this email address already exists. Please log in.' };
    }

    const newUser: User = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'student', // ALWAYS student for public registration
      avatar: '👨‍🎓',
      title: 'CS Undergraduate Student',
      studentId: studentId?.trim() || `STU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      enrolledCourse: courseChoice === 'cpp' ? 'CS202: Modern C++ & OOP' : 'CS201: C Systems Programming & Architecture',
      solvedProblemIds: [],
      streak: 1,
      lastActive: 'Active now',
      submissionsCount: 0,
    };

    const nextUsers = [...users, newUser];
    this.saveUsers(nextUsers);

    // Save password
    const passMap = this.getPasswordMap();
    passMap[cleanEmail] = password;
    this.savePasswordMap(passMap);

    this.setCurrentUser(newUser);
    return { user: newUser };
  }

  // Admin-Only: Create Another Admin Account
  static createAdminAccount(
    creatorAdminId: string,
    adminData: { name: string; email: string; password: string; title?: string }
  ): { user?: User; error?: string } {
    const users = this.getUsers();
    const creator = users.find((u) => u.id === creatorAdminId);
    if (!creator || creator.role !== 'admin') {
      return { error: 'Unauthorized: Only an active Administrator can provision new Admin accounts.' };
    }

    const cleanEmail = adminData.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { error: 'Please enter a valid email address.' };
    }
    if (!adminData.name.trim()) {
      return { error: 'Please enter the instructor or admin name.' };
    }
    if (!adminData.password || adminData.password.length < 6) {
      return { error: 'Admin password must be at least 6 characters long.' };
    }
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { error: 'An account with this email address already exists.' };
    }

    const newAdmin: User = {
      id: `admin-${Date.now()}`,
      name: adminData.name.trim(),
      email: cleanEmail,
      role: 'admin',
      avatar: '🛡️',
      title: adminData.title?.trim() || 'Co-Instructor & Lab Administrator',
      enrolledCourse: 'CS201 & CS202 Systems Lab',
      solvedProblemIds: [],
      streak: 1,
      lastActive: 'Active now',
      submissionsCount: 0,
    };

    const nextUsers = [...users, newAdmin];
    this.saveUsers(nextUsers);

    const passMap = this.getPasswordMap();
    passMap[cleanEmail] = adminData.password;
    this.savePasswordMap(passMap);

    return { user: newAdmin };
  }

  // Admin-Only: Delete Account
  static deleteUser(adminUserId: string, targetUserId: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const admin = users.find((u) => u.id === adminUserId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Only an administrator can delete accounts.' };
    }

    if (targetUserId === ADMIN_CREDENTIALS.id) {
      return { success: false, error: 'Cannot delete the Lead Master Instructor account (CYRUS).' };
    }

    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, error: 'User not found.' };
    }

    const nextUsers = users.filter((u) => u.id !== targetUserId);
    this.saveUsers(nextUsers);

    // Clean up password map
    const passMap = this.getPasswordMap();
    delete passMap[targetUser.email.toLowerCase()];
    this.savePasswordMap(passMap);

    // If active user is the deleted user, log out
    const current = this.getCurrentUser();
    if (current && current.id === targetUserId) {
      this.logout();
    }

    return { success: true };
  }

  static updateUser(updated: User): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === updated.id);
    if (idx !== -1) {
      users[idx] = updated;
    } else {
      users.push(updated);
    }
    this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.id === updated.id) {
      this.setCurrentUser(updated);
    }
  }

  static updateUserProfile(
    userId: string,
    profileData: {
      name?: string;
      avatar?: string;
      title?: string;
      bio?: string;
      studentId?: string;
      enrolledCourse?: string;
    }
  ): { user?: User; error?: string } {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { error: 'User profile not found.' };
    }

    const current = users[userIndex];
    const updatedUser: User = {
      ...current,
      name: profileData.name !== undefined && profileData.name.trim() ? profileData.name.trim() : current.name,
      avatar: profileData.avatar !== undefined && profileData.avatar.trim() ? profileData.avatar.trim() : current.avatar,
      title: profileData.title !== undefined ? profileData.title.trim() : current.title,
      bio: profileData.bio !== undefined ? profileData.bio.trim() : current.bio,
      studentId: profileData.studentId !== undefined ? profileData.studentId.trim() : current.studentId,
      enrolledCourse: profileData.enrolledCourse !== undefined ? profileData.enrolledCourse.trim() : current.enrolledCourse,
      lastActive: 'Active now',
    };

    this.updateUser(updatedUser);
    return { user: updatedUser };
  }

  static grantCurriculumMastery(userId: string): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return null;

    const allProblemIds = [
      ...C_PRACTICE_PROBLEMS.map((p) => p.id),
      ...CPP_PRACTICE_PROBLEMS.map((p) => p.id),
    ];

    const updatedUser: User = {
      ...user,
      solvedProblemIds: Array.from(new Set([...(user.solvedProblemIds || []), ...allProblemIds])),
      lastActive: 'Active now',
    };

    this.updateUser(updatedUser);
    return updatedUser;
  }

  static resetCurriculumSolves(userId: string): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return null;

    const updatedUser: User = {
      ...user,
      solvedProblemIds: ['hello-world', 'formatted-user-card'],
      lastActive: 'Active now',
    };

    this.updateUser(updatedUser);
    return updatedUser;
  }

  static updateSolvedProblem(userId: string, problemId: string): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return null;

    const solvedSet = new Set(user.solvedProblemIds);
    if (!solvedSet.has(problemId)) {
      solvedSet.add(problemId);
      const updatedUser: User = {
        ...user,
        solvedProblemIds: Array.from(solvedSet),
        lastActive: 'Active now',
      };
      this.updateUser(updatedUser);
      return updatedUser;
    }
    return user;
  }

  static updateQuizScore(userId: string, score: number, total: number): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return null;

    const updatedUser: User = {
      ...user,
      quizScore: {
        score,
        total,
        percentage: Math.round((score / total) * 100),
        completedAt: new Date().toISOString().split('T')[0],
      },
      lastActive: 'Active now',
    };
    this.updateUser(updatedUser);
    return updatedUser;
  }

  // Submissions Management
  static getSubmissions(): SubmissionRecord[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    this.saveSubmissions(INITIAL_SUBMISSIONS);
    return INITIAL_SUBMISSIONS;
  }

  static saveSubmissions(subs: SubmissionRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(subs));
    } catch {
      // ignore
    }
  }

  static recordSubmission(submission: Omit<SubmissionRecord, 'id' | 'timestamp'>): SubmissionRecord {
    const currentSubs = this.getSubmissions();
    const newRecord: SubmissionRecord = {
      ...submission,
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString(),
    };

    const nextSubs = [newRecord, ...currentSubs];
    this.saveSubmissions(nextSubs);

    // Update user submissions count
    const users = this.getUsers();
    const user = users.find((u) => u.id === submission.userId);
    if (user) {
      const updatedUser = {
        ...user,
        submissionsCount: (user.submissionsCount || 0) + 1,
      };
      this.updateUser(updatedUser);
    }

    return newRecord;
  }

  static gradeSubmission(submissionId: string, gradeScore: number, feedback: string): void {
    const currentSubs = this.getSubmissions();
    const updated = currentSubs.map((s) => {
      if (s.id === submissionId) {
        return {
          ...s,
          gradeScore,
          feedback,
        };
      }
      return s;
    });
    this.saveSubmissions(updated);
  }

  // Custom Problems Created by Admin
  static getCustomProblems(): PracticeProblem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_PROBLEMS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [];
  }

  static saveCustomProblems(problems: PracticeProblem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_PROBLEMS, JSON.stringify(problems));
    } catch {
      // ignore
    }
  }

  static addCustomProblem(problem: PracticeProblem): PracticeProblem {
    const current = this.getCustomProblems();
    const updated = [problem, ...current.filter((p) => p.id !== problem.id)];
    this.saveCustomProblems(updated);
    return problem;
  }

  static deleteCustomProblem(problemId: string): void {
    const current = this.getCustomProblems();
    const updated = current.filter((p) => p.id !== problemId);
    this.saveCustomProblems(updated);
  }

  // Password Reset Service (Forgot Password)
  static resetPassword(
    email: string,
    newPassword: string,
    studentIdVerification?: string
  ): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid registered email address.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    const users = this.getUsers();
    const passMap = this.getPasswordMap();

    // 1. If Lead Instructor Cyrus Admin Account
    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      passMap[cleanEmail] = newPassword;
      this.savePasswordMap(passMap);
      return { success: true, message: 'Instructor Admin password updated successfully!' };
    }

    // 2. Student Accounts
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'No registered student account was found with that email.' };
    }

    if (studentIdVerification && studentIdVerification.trim()) {
      if (user.studentId && user.studentId.trim().toLowerCase() !== studentIdVerification.trim().toLowerCase()) {
        return { success: false, message: 'Student ID does not match records for this email.' };
      }
    }

    passMap[cleanEmail] = newPassword;
    this.savePasswordMap(passMap);
    return { success: true, message: 'Password reset successfully! You can now log in.' };
  }

  // AI & Classroom Chat Message Center
  static getChatMessages(): ChatMessage[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAT_MESSAGES);
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        // Ensure initial welcome message uses the updated CYGPT text
        const welcomeIdx = parsed.findIndex((m) => m.id === 'msg-welcome');
        if (welcomeIdx !== -1 && parsed[welcomeIdx].content.includes('Welcome students to the CS201')) {
          parsed[welcomeIdx].content = `Anong tanong nyo mga bata, CYGPT nga pala AHHAHAHAAHAHAHAHA sige tanong 24/7`;
          this.saveChatMessages(parsed);
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    this.saveChatMessages(INITIAL_CHAT_MESSAGES);
    return INITIAL_CHAT_MESSAGES;
  }

  static saveChatMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CHAT_MESSAGES, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }

  static sendChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const current = this.getChatMessages();
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...current, newMsg];
    this.saveChatMessages(nextMessages);
    return newMsg;
  }

  static replyAsInstructor(
    threadId: string,
    content: string,
    recipientId?: string,
    recipientName?: string,
    codeSnippet?: string
  ): ChatMessage {
    return this.sendChatMessage({
      threadId,
      senderId: ADMIN_CREDENTIALS.id,
      senderName: ADMIN_CREDENTIALS.name,
      senderRole: 'admin',
      senderAvatar: '👑',
      recipientId,
      recipientName,
      content,
      codeSnippet,
      isInstructorReply: true,
    });
  }

  static clearChatThread(threadId: string): void {
    const current = this.getChatMessages();
    const updated = current.filter((m) => m.threadId !== threadId);
    this.saveChatMessages(updated);
  }

  static resetChatToDefault(): void {
    this.saveChatMessages(INITIAL_CHAT_MESSAGES);
  }
}

