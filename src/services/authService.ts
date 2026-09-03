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
];

export const INITIAL_SUBMISSIONS: SubmissionRecord[] = [];

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
        const dummyIds = new Set(['student-alex', 'student-sarah', 'student-marcus', 'student-elena', 'student-liam']);
        const dummyEmails = new Set([
          'alex.rivera@c-mastery.edu',
          'sarah.chen@c-mastery.edu',
          'marcus.v@c-mastery.edu',
          'elena.r@c-mastery.edu',
          'liam.p@c-mastery.edu',
        ]);

        // Filter out all dummy accounts, keeping genuine registered users and admin
        let filtered = parsed.filter(
          (u) => !dummyIds.has(u.id) && !dummyEmails.has(u.email?.toLowerCase())
        );

        // Ensure Master Admin CYRUS is always present
        const hasAdmin = filtered.some(
          (u) => u.id === ADMIN_CREDENTIALS.id || u.email?.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()
        );
        if (!hasAdmin) {
          filtered.unshift(DEFAULT_USERS[0]);
        }

        if (filtered.length !== parsed.length || !hasAdmin) {
          this.saveUsers(filtered);
        }
        return filtered;
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
        const parsed: User = JSON.parse(saved);
        const dummyIds = new Set(['student-alex', 'student-sarah', 'student-marcus', 'student-elena', 'student-liam']);
        if (dummyIds.has(parsed.id) || parsed.email?.includes('@c-mastery.edu')) {
          this.logout();
          return null;
        }
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

  // Delete Account (Admins can delete any user except Master Admin; users can delete their own account)
  static deleteUser(callerUserId: string, targetUserId: string): { success: boolean; error?: string } {
    if (targetUserId === ADMIN_CREDENTIALS.id) {
      return { success: false, error: 'Cannot delete the Lead Master Instructor account (CYRUS).' };
    }

    const users = this.getUsers();
    const caller = users.find((u) => u.id === callerUserId);
    const isSelfDelete = callerUserId === targetUserId;
    const isAdmin = caller?.role === 'admin';

    if (!isAdmin && !isSelfDelete) {
      return { success: false, error: 'Unauthorized: You can only delete your own account or must be an administrator.' };
    }

    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, error: 'Account not found or already deleted.' };
    }

    const nextUsers = users.filter((u) => u.id !== targetUserId);
    this.saveUsers(nextUsers);

    // Clean up password map
    const passMap = this.getPasswordMap();
    if (targetUser.email) {
      delete passMap[targetUser.email.toLowerCase()];
      this.savePasswordMap(passMap);
    }

    // Clean up associated submissions
    try {
      const subs = this.getSubmissions().filter((s) => s.userId !== targetUserId);
      this.saveSubmissions(subs);
    } catch {}

    // Clean up associated chat messages
    try {
      const msgs = this.getChatMessages().filter(
        (m) => m.senderId !== targetUserId && m.recipientId !== targetUserId && m.threadId !== targetUserId
      );
      this.saveChatMessages(msgs);
    } catch {}

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
        const parsed: SubmissionRecord[] = JSON.parse(saved);
        const dummyIds = new Set(['student-alex', 'student-sarah', 'student-marcus', 'student-elena', 'student-liam']);
        const filtered = parsed.filter((s) => !dummyIds.has(s.userId));
        if (filtered.length !== parsed.length) {
          this.saveSubmissions(filtered);
        }
        return filtered;
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
        const dummyIds = new Set(['student-alex', 'student-sarah', 'student-marcus', 'student-elena', 'student-liam']);
        const filtered = parsed.filter(
          (m) => !dummyIds.has(m.senderId) && !dummyIds.has(m.recipientId || '') && !dummyIds.has(m.threadId)
        );

        // Ensure initial welcome message uses the updated CYGPT text
        const welcomeIdx = filtered.findIndex((m) => m.id === 'msg-welcome');
        if (welcomeIdx !== -1 && filtered[welcomeIdx].content.includes('Welcome students to the CS201')) {
          filtered[welcomeIdx].content = `Anong tanong nyo mga bata, CYGPT nga pala AHHAHAHAAHAHAHAHA sige tanong 24/7`;
        }
        if (filtered.length !== parsed.length || (welcomeIdx !== -1 && filtered[welcomeIdx].content.includes('CYGPT'))) {
          this.saveChatMessages(filtered);
        }
        return filtered;
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

