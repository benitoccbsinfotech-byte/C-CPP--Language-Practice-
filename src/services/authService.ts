import { User, SubmissionRecord, PracticeProblem, ChatMessage } from '../types';
import { C_PRACTICE_PROBLEMS } from '../data/cProblems';
import { CPP_PRACTICE_PROBLEMS } from '../data/cppProblems';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

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

// In-memory subscribers for live cross-device reactivity
type Listener<T> = (data: T) => void;
const usersListeners: Set<Listener<User[]>> = new Set();
const submissionsListeners: Set<Listener<SubmissionRecord[]>> = new Set();
const customProblemsListeners: Set<Listener<PracticeProblem[]>> = new Set();
const chatMessagesListeners: Set<Listener<ChatMessage[]>> = new Set();

let isFirestoreSyncActive = false;

function initFirestoreSync(): void {
  if (isFirestoreSyncActive || typeof window === 'undefined') return;
  isFirestoreSyncActive = true;

  // 1. Synchronize Users Collection from Firestore
  try {
    const usersCol = collection(db, 'users');
    onSnapshot(
      usersCol,
      (snapshot) => {
        const remoteUsers: User[] = [];
        const passMap = AuthService.getPasswordMap();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id && data.email) {
            const u: User = {
              id: data.id,
              name: data.name || 'Student',
              email: data.email,
              role: (data.role === 'admin' ? 'admin' : 'student') as User['role'],
              avatar: data.avatar || '👨‍🎓',
              title: data.title || '',
              studentId: data.studentId || '',
              enrolledCourse: data.enrolledCourse || '',
              bio: data.bio || '',
              solvedProblemIds: Array.isArray(data.solvedProblemIds) ? data.solvedProblemIds : [],
              streak: typeof data.streak === 'number' ? data.streak : 1,
              lastActive: data.lastActive || 'Active now',
              quizScore: data.quizScore || undefined,
              submissionsCount: typeof data.submissionsCount === 'number' ? data.submissionsCount : 0,
            };
            remoteUsers.push(u);

            if (data.password) {
              passMap[data.email.toLowerCase()] = data.password;
            }
          }
        });

        AuthService.savePasswordMap(passMap);

        // Ensure Master Admin CYRUS is always present in users
        const hasMasterAdmin = remoteUsers.some(
          (u) =>
            u.id === ADMIN_CREDENTIALS.id ||
            u.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()
        );

        if (!hasMasterAdmin) {
          remoteUsers.unshift(DEFAULT_USERS[0]);
          // Seed master admin to Firestore online
          setDoc(
            doc(db, 'users', ADMIN_CREDENTIALS.id),
            {
              ...DEFAULT_USERS[0],
              password: ADMIN_CREDENTIALS.password,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((err) => console.warn('Could not seed admin to Firestore:', err));
        }

        AuthService.saveUsers(remoteUsers);
        usersListeners.forEach((cb) => cb(remoteUsers));
      },
      (err) => {
        console.warn('Firestore users sync notice:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to initialize Firestore users sync:', err);
  }

  // 2. Synchronize Submissions Collection from Firestore
  try {
    const subsCol = collection(db, 'submissions');
    onSnapshot(
      subsCol,
      (snapshot) => {
        const remoteSubs: SubmissionRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id && data.userId && data.problemId) {
            remoteSubs.push(data as SubmissionRecord);
          }
        });
        remoteSubs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        AuthService.saveSubmissions(remoteSubs);
        submissionsListeners.forEach((cb) => cb(remoteSubs));
      },
      (err) => {
        console.warn('Firestore submissions sync notice:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to initialize Firestore submissions sync:', err);
  }

  // 3. Synchronize Custom Problems Collection from Firestore
  try {
    const probsCol = collection(db, 'customProblems');
    onSnapshot(
      probsCol,
      (snapshot) => {
        const remoteProbs: PracticeProblem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id && data.title) {
            remoteProbs.push(data as PracticeProblem);
          }
        });
        AuthService.saveCustomProblems(remoteProbs);
        customProblemsListeners.forEach((cb) => cb(remoteProbs));
      },
      (err) => {
        console.warn('Firestore customProblems sync notice:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to initialize Firestore customProblems sync:', err);
  }

  // 4. Synchronize Classroom Chat Messages from Firestore
  try {
    const chatCol = collection(db, 'chatMessages');
    onSnapshot(
      chatCol,
      (snapshot) => {
        const remoteMsgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id && data.content) {
            remoteMsgs.push(data as ChatMessage);
          }
        });
        if (remoteMsgs.length > 0) {
          AuthService.saveChatMessages(remoteMsgs);
          chatMessagesListeners.forEach((cb) => cb(remoteMsgs));
        }
      },
      (err) => {
        console.warn('Firestore chat sync notice:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to initialize Firestore chat sync:', err);
  }
}

// Kick off sync automatically on startup
if (typeof window !== 'undefined') {
  setTimeout(() => initFirestoreSync(), 0);
}

export class AuthService {
  static getPasswordMap(): Record<string, string> {
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

  static savePasswordMap(map: Record<string, string>): void {
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

        // Filter out dummy accounts, keeping genuine registered users and admin
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
    } catch {}
    this.saveUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }

  static saveUsers(users: User[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users));
    } catch {}
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
    } catch {}
    return null;
  }

  static setCurrentUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch {}
  }

  static logout(): void {
    this.setCurrentUser(null);
  }

  // Real-time subscribers for React components
  static subscribeUsers(callback: (users: User[]) => void): () => void {
    initFirestoreSync();
    usersListeners.add(callback);
    callback(this.getUsers());
    return () => {
      usersListeners.delete(callback);
    };
  }

  static subscribeSubmissions(callback: (subs: SubmissionRecord[]) => void): () => void {
    initFirestoreSync();
    submissionsListeners.add(callback);
    callback(this.getSubmissions());
    return () => {
      submissionsListeners.delete(callback);
    };
  }

  static subscribeCustomProblems(callback: (probs: PracticeProblem[]) => void): () => void {
    initFirestoreSync();
    customProblemsListeners.add(callback);
    callback(this.getCustomProblems());
    return () => {
      customProblemsListeners.delete(callback);
    };
  }

  static subscribeChatMessages(callback: (msgs: ChatMessage[]) => void): () => void {
    initFirestoreSync();
    chatMessagesListeners.add(callback);
    callback(this.getChatMessages());
    return () => {
      chatMessagesListeners.delete(callback);
    };
  }

  // Standard Login (works online across any device via Firestore)
  static async login(email: string, password?: string): Promise<{ user?: User; error?: string }> {
    initFirestoreSync();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { error: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { error: 'Please enter your password.' };
    }

    // 1. Check if CYRUS Master Admin
    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      if (password !== ADMIN_CREDENTIALS.password) {
        return {
          error: `Incorrect password for Lead Instructor ${ADMIN_CREDENTIALS.name}.`,
        };
      }
      const adminUser = this.getUsers().find((u) => u.id === ADMIN_CREDENTIALS.id) || DEFAULT_USERS[0];
      const updatedAdmin = { ...adminUser, lastActive: 'Active now' };
      this.updateUser(updatedAdmin);
      this.setCurrentUser(updatedAdmin);

      // Ensure admin exists in Firestore online
      setDoc(
        doc(db, 'users', ADMIN_CREDENTIALS.id),
        {
          ...updatedAdmin,
          password: ADMIN_CREDENTIALS.password,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});

      return { user: updatedAdmin };
    }

    // 2. Query Firestore directly so account created on ANY device can be logged in immediately
    try {
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docData = snap.docs[0].data();
        const storedPass = docData.password;
        if (storedPass && storedPass !== password) {
          return { error: 'Incorrect password. Please verify your credentials.' };
        }

        const onlineUser: User = {
          id: docData.id || snap.docs[0].id,
          name: docData.name || 'Student',
          email: docData.email,
          role: (docData.role === 'admin' ? 'admin' : 'student') as User['role'],
          avatar: docData.avatar || '👨‍🎓',
          title: docData.title || '',
          studentId: docData.studentId || '',
          enrolledCourse: docData.enrolledCourse || '',
          bio: docData.bio || '',
          solvedProblemIds: Array.isArray(docData.solvedProblemIds) ? docData.solvedProblemIds : [],
          streak: typeof docData.streak === 'number' ? docData.streak : 1,
          lastActive: 'Active now',
          quizScore: docData.quizScore || undefined,
          submissionsCount: typeof docData.submissionsCount === 'number' ? docData.submissionsCount : 0,
        };

        const passMap = this.getPasswordMap();
        passMap[cleanEmail] = password;
        this.savePasswordMap(passMap);

        this.updateUser(onlineUser);
        this.setCurrentUser(onlineUser);
        return { user: onlineUser };
      }
    } catch (err) {
      console.warn('Firestore online login lookup notice:', err);
    }

    // 3. Fallback to cached user list
    const users = this.getUsers();
    const passMap = this.getPasswordMap();
    let existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      const storedPass = passMap[cleanEmail];
      if (storedPass && storedPass !== password) {
        return { error: 'Incorrect password. Please verify your credentials.' };
      }

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

  // Public Registration - STRICTLY STUDENT ROLE ONLY, SAVES TO FIRESTORE ONLINE
  static async registerStudent(
    name: string,
    email: string,
    password?: string,
    studentId?: string,
    courseChoice: 'c' | 'cpp' = 'c'
  ): Promise<{ user?: User; error?: string }> {
    initFirestoreSync();
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

    // Check if account already exists in online Firestore database
    try {
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return { error: 'An account with this email address already exists. Please log in.' };
      }
    } catch (err) {
      console.warn('Firestore check error during registration:', err);
    }

    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { error: 'An account with this email address already exists. Please log in.' };
    }

    const newUser: User = {
      id: `student-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

    // Save directly to Firestore online so it appears across all devices and to Admin instantly
    try {
      await setDoc(doc(db, 'users', newUser.id), {
        ...newUser,
        password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to write new user to Firestore:', err);
    }

    const nextUsers = [...users, newUser];
    this.saveUsers(nextUsers);

    // Save password
    const passMap = this.getPasswordMap();
    passMap[cleanEmail] = password;
    this.savePasswordMap(passMap);

    this.setCurrentUser(newUser);
    return { user: newUser };
  }

  // Admin-Only: Create Another Admin Account (saved to Firestore online)
  static createAdminAccount(
    creatorAdminId: string,
    adminData: { name: string; email: string; password: string; title?: string }
  ): { user?: User; error?: string } {
    initFirestoreSync();
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
      id: `admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

    // Save to Firestore online
    setDoc(doc(db, 'users', newAdmin.id), {
      ...newAdmin,
      password: adminData.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).catch((err) => console.warn('Firestore write admin warning:', err));

    const nextUsers = [...users, newAdmin];
    this.saveUsers(nextUsers);

    const passMap = this.getPasswordMap();
    passMap[cleanEmail] = adminData.password;
    this.savePasswordMap(passMap);

    return { user: newAdmin };
  }

  // Delete Account (removes from Firestore online)
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

    // Delete from Firestore online
    deleteDoc(doc(db, 'users', targetUserId)).catch((err) =>
      console.warn('Firestore delete user warning:', err)
    );

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

    // Sync to Firestore online
    setDoc(
      doc(db, 'users', updated.id),
      {
        ...updated,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch((err) => console.warn('Firestore user update notice:', err));

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

  // Submissions Management (synced with Firestore online)
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
    } catch {}
    this.saveSubmissions(INITIAL_SUBMISSIONS);
    return INITIAL_SUBMISSIONS;
  }

  static saveSubmissions(subs: SubmissionRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(subs));
    } catch {}
  }

  static recordSubmission(submission: Omit<SubmissionRecord, 'id' | 'timestamp'>): SubmissionRecord {
    const currentSubs = this.getSubmissions();
    const newRecord: SubmissionRecord = {
      ...submission,
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString(),
    };

    // Save to Firestore online
    setDoc(doc(db, 'submissions', newRecord.id), newRecord).catch((err) =>
      console.warn('Firestore submission write notice:', err)
    );

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

    // Sync to Firestore online
    updateDoc(doc(db, 'submissions', submissionId), {
      gradeScore,
      feedback,
      updatedAt: new Date().toISOString(),
    }).catch((err) => console.warn('Firestore grading write notice:', err));
  }

  // Custom Problems Created by Admin (synced with Firestore online)
  static getCustomProblems(): PracticeProblem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_PROBLEMS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  }

  static saveCustomProblems(problems: PracticeProblem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_PROBLEMS, JSON.stringify(problems));
    } catch {}
  }

  static addCustomProblem(problem: PracticeProblem): PracticeProblem {
    const current = this.getCustomProblems();
    const updated = [problem, ...current.filter((p) => p.id !== problem.id)];
    this.saveCustomProblems(updated);

    // Sync to Firestore online
    setDoc(doc(db, 'customProblems', problem.id), problem).catch((err) =>
      console.warn('Firestore custom problem write notice:', err)
    );

    return problem;
  }

  static deleteCustomProblem(problemId: string): void {
    const current = this.getCustomProblems();
    const updated = current.filter((p) => p.id !== problemId);
    this.saveCustomProblems(updated);

    // Delete from Firestore online
    deleteDoc(doc(db, 'customProblems', problemId)).catch((err) =>
      console.warn('Firestore custom problem delete notice:', err)
    );
  }

  // Password Reset Service (Forgot Password)
  static async resetPassword(
    email: string,
    newPassword: string,
    studentIdVerification?: string
  ): Promise<{ success: boolean; message: string }> {
    initFirestoreSync();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid registered email address.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    const passMap = this.getPasswordMap();

    // 1. If Lead Instructor Cyrus Admin Account
    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      passMap[cleanEmail] = newPassword;
      this.savePasswordMap(passMap);

      setDoc(
        doc(db, 'users', ADMIN_CREDENTIALS.id),
        {
          password: newPassword,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});

      return { success: true, message: 'Instructor Admin password updated successfully!' };
    }

    // 2. Query Firestore online for account
    let targetDocId: string | null = null;
    let storedStudentId: string | undefined = undefined;

    try {
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        targetDocId = snap.docs[0].id;
        storedStudentId = snap.docs[0].data().studentId;
      }
    } catch (err) {
      console.warn('Firestore query error during reset:', err);
    }

    if (!targetDocId) {
      const localUser = this.getUsers().find((u) => u.email.toLowerCase() === cleanEmail);
      if (localUser) {
        targetDocId = localUser.id;
        storedStudentId = localUser.studentId;
      }
    }

    if (!targetDocId) {
      return { success: false, message: 'No registered student account was found with that email.' };
    }

    if (studentIdVerification && studentIdVerification.trim()) {
      if (storedStudentId && storedStudentId.trim().toLowerCase() !== studentIdVerification.trim().toLowerCase()) {
        return { success: false, message: 'Student ID does not match records for this email.' };
      }
    }

    // Update in Firestore online
    try {
      await updateDoc(doc(db, 'users', targetDocId), {
        password: newPassword,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore password update notice:', err);
    }

    passMap[cleanEmail] = newPassword;
    this.savePasswordMap(passMap);
    return { success: true, message: 'Password reset successfully! You can now log in on any device.' };
  }

  // AI & Classroom Chat Message Center (synced with Firestore online)
  static getChatMessages(): ChatMessage[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAT_MESSAGES);
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        const dummyIds = new Set(['student-alex', 'student-sarah', 'student-marcus', 'student-elena', 'student-liam']);
        const filtered = parsed.filter(
          (m) => !dummyIds.has(m.senderId) && !dummyIds.has(m.recipientId || '') && !dummyIds.has(m.threadId)
        );
        return filtered;
      }
    } catch {}
    this.saveChatMessages(INITIAL_CHAT_MESSAGES);
    return INITIAL_CHAT_MESSAGES;
  }

  static saveChatMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CHAT_MESSAGES, JSON.stringify(messages));
    } catch {}
  }

  static sendChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const current = this.getChatMessages();
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Save to Firestore online
    setDoc(doc(db, 'chatMessages', newMsg.id), newMsg).catch((err) =>
      console.warn('Firestore chat write notice:', err)
    );

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
