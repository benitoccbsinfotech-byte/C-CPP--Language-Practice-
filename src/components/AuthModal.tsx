import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { AuthService, ADMIN_CREDENTIALS } from '../services/authService';
import { C_PRACTICE_PROBLEMS } from '../data/cProblems';
import { CPP_PRACTICE_PROBLEMS } from '../data/cppProblems';
import { ALL_ACHIEVEMENT_BADGES, getEarnedBadges } from '../utils/achievementBadges';
import { UserAvatar, isPhotoAvatar } from './UserAvatar';
import {
  ShieldCheck,
  GraduationCap,
  X,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  KeyRound,
  IdCard,
  BookOpen,
  ArrowRight,
  Info,
  LogOut,
  UserCheck,
  CheckCircle2,
  Edit3,
  Sparkles,
  Trophy,
  Save,
  Quote,
  Flame,
  Award,
  RotateCcw,
  Check,
  Smile,
  Camera,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
} from 'lucide-react';

const PRESET_AVATARS = [
  '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎓', '👩‍🎓',
  '⚡', '🚀', '🧠', '🤖', '💻',
  '🎯', '👾', '🛡️', '💎', '💡',
  '🔬', '⚙️', '☕', '🏆', '🔥',
];

const PRESET_PHOTOS = [
  {
    label: 'Student with Laptop',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
  },
  {
    label: 'Developer at Desk',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&auto=format&fit=crop&q=80',
  },
  {
    label: 'CS Scholar',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&auto=format&fit=crop&q=80',
  },
  {
    label: 'Engineering Student',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80',
  },
  {
    label: 'Tech Enthusiast',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&auto=format&fit=crop&q=80',
  },
  {
    label: 'Software Engineer',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
  },
  {
    label: 'Systems Researcher',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80',
  },
  {
    label: 'Junior Programmer',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&auto=format&fit=crop&q=80',
  },
];

// Helper to downscale and compress client-side uploaded photos to crisp 256x256 JPEGs
function compressAndResizeImage(file: File, maxDim = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload a valid image file (PNG, JPG, WEBP, GIF).'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // 0.85 quality jpeg compresses 256x256 image down to 15-25 KB for safe localStorage persistence
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Could not read image file.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

const TITLE_SUGGESTIONS = [
  'BS Computer Science Sophomore',
  'Computer Engineering Freshman',
  'Systems & Kernel Aspirant',
  'Modern C++ Game Developer',
  'Junior C Programmer',
];

const MOTTO_SUGGESTIONS = [
  'Target: Pwede ka na mag 2nd year! 🎓',
  "Pointers don't scare me, segfaults do. ⚡",
  'Writing clean, memory-safe C and C++ daily.',
  'Demystifying low-level systems & kernel architecture.',
];

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser: User | null;
  onUserChange: (user: User) => void;
  onLogout?: () => void;
  isMandatory?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onLogout,
  isMandatory = false,
}) => {
  // View tabs when logged in: 'profile' (edit profile & bio) or 'switch' (switch/login account)
  const [currentViewTab, setCurrentViewTab] = useState<'profile' | 'switch'>('profile');

  // Login / Register state
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [studentId, setStudentId] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<'c' | 'cpp'>('c');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile Customization state
  const [editName, setEditName] = useState<string>('');
  const [editAvatar, setEditAvatar] = useState<string>('👨‍💻');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editBio, setEditBio] = useState<string>('');
  const [editStudentId, setEditStudentId] = useState<string>('');
  const [editCourse, setEditCourse] = useState<string>('');
  const [customAvatarInput, setCustomAvatarInput] = useState<string>('');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Photo & Avatar selection sub-mode
  const [avatarMode, setAvatarMode] = useState<'photo' | 'emoji'>('photo');
  const [photoUrlInput, setPhotoUrlInput] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account Deletion & Management State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [accountDeletedMsg, setAccountDeletedMsg] = useState<string | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<User[]>([]);
  const [userToDeleteInSwitch, setUserToDeleteInSwitch] = useState<User | null>(null);

  const refreshAvailableAccounts = () => {
    setAvailableAccounts(AuthService.getUsers());
  };

  // Synchronize profile form values when currentUser or modal opens
  useEffect(() => {
    refreshAvailableAccounts();
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditAvatar(currentUser.avatar || '👨‍💻');
      setEditTitle(currentUser.title || '');
      setEditBio(currentUser.bio || '');
      setEditStudentId(currentUser.studentId || '');
      setEditCourse(currentUser.enrolledCourse || 'CS201: C Systems Programming & Architecture');
      setAvatarMode(isPhotoAvatar(currentUser.avatar) ? 'photo' : 'emoji');
      setCurrentViewTab('profile');
    } else {
      setCurrentViewTab('switch');
    }
    setProfileSuccess(null);
    setProfileError(null);
    setDeleteConfirmOpen(false);
  }, [currentUser, isOpen]);

  const handleSelfDeleteAccount = () => {
    if (!currentUser) return;
    const res = AuthService.deleteUser(currentUser.id, currentUser.id);
    if (!res.success) {
      setProfileError(res.error || 'Failed to delete account.');
      setDeleteConfirmOpen(false);
      return;
    }
    setAccountDeletedMsg(`Your account (${currentUser.name}) has been permanently deleted.`);
    setDeleteConfirmOpen(false);
    refreshAvailableAccounts();
    if (onLogout) {
      onLogout();
    }
    setTimeout(() => {
      setAccountDeletedMsg(null);
      if (onClose) onClose();
    }, 1200);
  };

  const handleDeleteUserInSwitch = (targetUser: User) => {
    const callerId = currentUser?.id || targetUser.id;
    const res = AuthService.deleteUser(callerId, targetUser.id);
    if (!res.success) {
      setError(res.error || 'Failed to delete account.');
      setUserToDeleteInSwitch(null);
      return;
    }
    setSuccessMessage(`Account for "${targetUser.name}" successfully deleted.`);
    setUserToDeleteInSwitch(null);
    refreshAvailableAccounts();
    if (currentUser?.id === targetUser.id && onLogout) {
      onLogout();
    }
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }
    setIsProcessingPhoto(true);
    setProfileError(null);
    try {
      const compressedDataUrl = await compressAndResizeImage(file, 256);
      setEditAvatar(compressedDataUrl);
      setAvatarMode('photo');
      setProfileSuccess('Profile photo uploaded and optimized! Click "Save Profile & Bio" below.');
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to process selected image.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!photoUrlInput.trim()) {
      setProfileError('Please enter a valid image web URL.');
      return;
    }
    const url = photoUrlInput.trim();
    setEditAvatar(url);
    setAvatarMode('photo');
    setProfileSuccess('Image URL applied to preview! Click "Save Profile & Bio" below.');
  };

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setProfileSuccess(null);
    setProfileError(null);

    if (!editName.trim()) {
      setProfileError('Display name cannot be blank.');
      return;
    }

    const res = AuthService.updateUserProfile(currentUser.id, {
      name: editName.trim(),
      avatar: editAvatar.trim() || '👨‍💻',
      title: editTitle.trim(),
      bio: editBio.trim(),
      studentId: editStudentId.trim(),
      enrolledCourse: editCourse.trim(),
    });

    if (res.error) {
      setProfileError(res.error);
      return;
    }

    if (res.user) {
      onUserChange(res.user);
      setProfileSuccess('Profile and bio successfully updated!');
      setTimeout(() => setProfileSuccess(null), 3500);
    }
  };

  const handleGrantMastery = () => {
    if (!currentUser) return;
    const updated = AuthService.grantCurriculumMastery(currentUser.id);
    if (updated) {
      onUserChange(updated);
      setProfileSuccess('🎓 Mastered all 29 C & C++ challenges! "pwede kana mag 2nd year" badge unlocked!');
      setTimeout(() => setProfileSuccess(null), 4000);
    }
  };

  const handleResetMastery = () => {
    if (!currentUser) return;
    const updated = AuthService.resetCurriculumSolves(currentUser.id);
    if (updated) {
      onUserChange(updated);
      setProfileSuccess('Curriculum solves reset to baseline.');
      setTimeout(() => setProfileSuccess(null), 3000);
    }
  };

  const handleSwitchMode = (mode: 'signin' | 'register' | 'forgot') => {
    setAuthMode(mode);
    setError(null);
    setSuccessMessage(null);
    // Explicitly reset all form inputs so credentials (like admin account) NEVER leak or prefill into registration
    setEmail('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setStudentId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (authMode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!password || password.length < 4) {
        setError('Password must be at least 4 characters long.');
        return;
      }

      const result = AuthService.registerStudent(
        name,
        cleanEmail,
        password,
        studentId,
        selectedCourse
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.user) {
        onUserChange(result.user);
        if (onClose) onClose();
      }
    } else if (authMode === 'forgot') {
      if (!password || password.length < 4) {
        setError('New password must be at least 4 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }

      const res = AuthService.resetPassword(cleanEmail, password, studentId);
      if (!res.success) {
        setError(res.message);
        return;
      }

      setSuccessMessage(res.message);
      setAuthMode('signin');
      setEmail(cleanEmail);
      setPassword('');
      setConfirmPassword('');
    } else {
      // Standard Login
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      const result = AuthService.login(cleanEmail, password);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.user) {
        onUserChange(result.user);
        if (onClose) onClose();
      }
    }
  };

  // Check user solves and 2nd year badge status for live preview
  const currentSolves = currentUser?.solvedProblemIds || [];
  const cCount = C_PRACTICE_PROBLEMS.filter((p) => currentSolves.includes(p.id)).length;
  const cppCount = CPP_PRACTICE_PROBLEMS.filter((p) => currentSolves.includes(p.id)).length;
  const isMasterEarned =
    C_PRACTICE_PROBLEMS.length > 0 &&
    CPP_PRACTICE_PROBLEMS.length > 0 &&
    cCount >= C_PRACTICE_PROBLEMS.length &&
    cppCount >= CPP_PRACTICE_PROBLEMS.length;

  const earnedBadgesList = getEarnedBadges(currentSolves);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        if (!isMandatory && onClose) onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/90 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {currentUser ? <UserIcon className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {currentUser
                    ? currentViewTab === 'profile'
                      ? 'Student Profile & Bio'
                      : 'Account & Authentication'
                    : authMode === 'register'
                    ? 'Student Registration'
                    : authMode === 'forgot'
                    ? 'Reset Password'
                    : 'Sign In to Studio'}
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {currentUser ? (currentUser.role === 'admin' ? 'Faculty Admin' : 'Student Account') : 'C & C++ Studio'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentUser
                  ? currentViewTab === 'profile'
                    ? 'Customize your avatar, bio motto, display name, and academic details'
                    : `Active as ${currentUser.name} (${currentUser.email})`
                  : authMode === 'register'
                  ? 'Create a verified student workspace account'
                  : authMode === 'forgot'
                  ? 'Recover access by setting a new password'
                  : 'Sign in to access code execution, quizzes & lab control'}
              </p>
            </div>
          </div>

          {!isMandatory && onClose && (
            <button
              id="btn-close-auth-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-950">
          {/* Tabs when Logged In */}
          {currentUser && (
            <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold">
              <button
                type="button"
                id="btn-modal-tab-profile"
                onClick={() => {
                  setCurrentViewTab('profile');
                  setProfileSuccess(null);
                  setProfileError(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition ${
                  currentViewTab === 'profile'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Customize Profile & Bio</span>
              </button>
              <button
                type="button"
                id="btn-modal-tab-switch"
                onClick={() => {
                  setCurrentViewTab('switch');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition ${
                  currentViewTab === 'switch'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Switch / Sign In</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: PROFILE & BIO CUSTOMIZATION (When Logged In) */}
          {/* ========================================================================= */}
          {currentUser && currentViewTab === 'profile' && (
            <div className="space-y-5">
              {/* Feedback Banners */}
              {profileSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <Info className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* LIVE PROFILE CARD PREVIEW */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Live Profile Preview</span>
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  <UserAvatar
                    avatar={editAvatar || currentUser.avatar}
                    name={editName || currentUser.name}
                    className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-700 text-3xl shrink-0 shadow-md"
                    fallbackEmoji="👨‍💻"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white truncate">
                        {editName || currentUser.name}
                      </h3>
                      {editStudentId && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {editStudentId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {editTitle || currentUser.title || 'Undergraduate Student'}
                    </p>
                    <p className="text-[11px] text-emerald-400/90 font-mono mt-0.5">
                      {editCourse || currentUser.enrolledCourse}
                    </p>
                  </div>
                </div>

                {/* Bio Quotation Bubble */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs">
                  <div className="flex items-start gap-2">
                    <Quote className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="italic text-slate-300">
                      {editBio.trim() ? (
                        editBio
                      ) : (
                        <span className="text-slate-500 not-italic">
                          No bio set yet. Write your personal motto or programming goal below!
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Badge Showcase & Pwede Ka Na Mag 2nd Year Status */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-400 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>Earned Badges ({earnedBadgesList.length})</span>
                    </span>
                    <span className="font-mono text-slate-400">
                      Solved: <strong className="text-emerald-400">{currentSolves.length}</strong> problems
                    </span>
                  </div>

                  {/* Highlights the "pwede kana mag 2nd year" badge */}
                  <div
                    className={`p-2.5 rounded-xl border transition ${
                      isMasterEarned
                        ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-amber-400/60 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎓</span>
                        <div>
                          <span className="font-bold text-xs">pwede kana mag 2nd year</span>
                          <p className="text-[10px] text-slate-400">
                            {isMasterEarned
                              ? 'Mastered all C (21/21) and C++ (8/8) challenges! Ready for 2nd year!'
                              : `C Solved: ${cCount}/${C_PRACTICE_PROBLEMS.length} • C++ Solved: ${cppCount}/${CPP_PRACTICE_PROBLEMS.length}`}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          isMasterEarned
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {isMasterEarned ? 'EARNED 🎓' : 'LOCKED'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PROFILE CUSTOMIZATION FORM */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Profile Photo & Avatar Suite */}
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Profile Photo & Avatar</span>
                    </label>

                    {/* Mode Toggle: Photo vs Emoji */}
                    <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold">
                      <button
                        type="button"
                        id="btn-avatar-mode-photo"
                        onClick={() => setAvatarMode('photo')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                          avatarMode === 'photo'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Photo</span>
                      </button>
                      <button
                        type="button"
                        id="btn-avatar-mode-emoji"
                        onClick={() => setAvatarMode('emoji')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                          avatarMode === 'emoji'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Smile className="w-3 h-3" />
                        <span>Emoji</span>
                      </button>
                    </div>
                  </div>

                  {/* Hidden native file input for photos */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  {avatarMode === 'photo' ? (
                    <div className="space-y-3">
                      {/* Upload Dropzone */}
                      <div
                        id="dropzone-profile-photo"
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDropFile}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer transition flex flex-col items-center justify-center text-center group ${
                          isDragOver
                            ? 'border-emerald-400 bg-emerald-950/30'
                            : 'border-slate-700/80 hover:border-emerald-500/60 bg-slate-950/70 hover:bg-slate-950'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-white">
                          {isProcessingPhoto ? 'Optimizing photo...' : 'Click to upload your photo or drag & drop'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Supports PNG, JPG, WEBP, GIF (auto-resized for fast loading)
                        </p>
                      </div>

                      {/* Active Custom Photo Indicator with Controls */}
                      {isPhotoAvatar(editAvatar) && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <UserAvatar
                              avatar={editAvatar}
                              name={editName}
                              className="w-8 h-8 rounded-lg border border-slate-700 shadow-sm"
                            />
                            <span className="text-[11px] text-emerald-300 font-bold truncate">Photo active in preview</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Change</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditAvatar('👨‍💻');
                                setAvatarMode('emoji');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] font-bold border border-rose-800/40 transition flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3 text-rose-400" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Web URL Photo Input */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-slate-500" />
                          <span>Or paste image URL (GitHub, Gravatar, Unsplash):</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={photoUrlInput}
                            onChange={(e) => setPhotoUrlInput(e.target.value)}
                            placeholder="https://images.unsplash.com/... or GitHub profile URL"
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleApplyUrl}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shrink-0"
                          >
                            Apply URL
                          </button>
                        </div>
                      </div>

                      {/* Curated Coder & Student Photo Presets */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Quick-select student & developer portraits:</span>
                        </span>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                          {PRESET_PHOTOS.map((photo, i) => (
                            <button
                              key={i}
                              type="button"
                              title={photo.label}
                              onClick={() => {
                                setEditAvatar(photo.url);
                                setPhotoUrlInput('');
                              }}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition hover:scale-105 active:scale-95 ${
                                editAvatar === photo.url
                                  ? 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg'
                                  : 'border-slate-800 hover:border-slate-600'
                              }`}
                            >
                              <img
                                src={photo.url}
                                alt={photo.label}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              {editAvatar === photo.url && (
                                <span className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-emerald-300 font-bold" />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Emoji Selection Grid */
                    <div className="space-y-2">
                      <div className="grid grid-cols-10 gap-1.5 p-2 rounded-2xl bg-slate-950 border border-slate-800">
                        {PRESET_AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setEditAvatar(emoji);
                              setCustomAvatarInput('');
                            }}
                            className={`h-8 rounded-xl text-base flex items-center justify-center transition hover:scale-110 active:scale-95 ${
                              editAvatar === emoji
                                ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-sm'
                                : 'hover:bg-slate-800 border border-transparent'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      {/* Custom Emoji / Text Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="Or type custom emoji (e.g. 🪐, 🎖️, 🦁)"
                          value={customAvatarInput}
                          onChange={(e) => {
                            setCustomAvatarInput(e.target.value);
                            if (e.target.value.trim()) {
                              setEditAvatar(e.target.value.trim());
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Display Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Display Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Student ID & Academic Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <IdCard className="w-3.5 h-3.5 text-slate-500" />
                      <span>Student ID</span>
                    </label>
                    <input
                      type="text"
                      value={editStudentId}
                      onChange={(e) => setEditStudentId(e.target.value)}
                      placeholder="e.g. STU-2026-101"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                      <span>Academic Title / Role</span>
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="e.g. Undergraduate CS Student"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Quick Title Suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500">Quick titles:</span>
                  {TITLE_SUGGESTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditTitle(t)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Student Bio & Learning Goals */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Student Bio & Motto</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      {editBio.length}/250 characters
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={250}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Share your coding goals, current focus (e.g. Target: Pwede ka na mag 2nd year! 🎓), or favorite programming concepts..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Quick Motto Ideas */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500">Inspiration:</span>
                  {MOTTO_SUGGESTIONS.map((motto) => (
                    <button
                      key={motto}
                      type="button"
                      onClick={() => setEditBio(motto)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 transition"
                    >
                      "{motto}"
                    </button>
                  ))}
                </div>

                {/* Enrolled Course Track */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>Enrolled Course Track</span>
                  </label>
                  <select
                    value={editCourse}
                    onChange={(e) => setEditCourse(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CS201: C Systems Programming & Architecture">
                      CS201: C Systems Programming & Architecture
                    </option>
                    <option value="CS202: Modern C++ (Object-Oriented & STL)">
                      CS202: Modern C++ (Object-Oriented & STL)
                    </option>
                    <option value="CS201 & CS202: Dual Track (C & C++ Systems Mastery)">
                      CS201 & CS202: Dual Track (C & C++ Systems Mastery)
                    </option>
                  </select>
                </div>

                {/* Save Profile Changes Button */}
                <button
                  type="submit"
                  id="btn-save-profile-bio"
                  className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile & Bio</span>
                </button>
              </form>

              {/* SIMULATE CURRICULUM MASTERY (Quick testing for 'pwede kana mag 2nd year' badge) */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                    <span>Curriculum Badge Testing</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Quick Test Tool</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Want to verify the <strong className="text-amber-300">"pwede kana mag 2nd year"</strong> badge immediately without submitting all 29 challenges manually?
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    id="btn-simulate-curriculum-mastery"
                    onClick={handleGrantMastery}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>🎓 Unlock All C & C++ (Grant 2nd Year Badge)</span>
                  </button>
                  <button
                    type="button"
                    id="btn-reset-curriculum-mastery"
                    onClick={handleResetMastery}
                    title="Reset solves back to starter state"
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* DANGER ZONE: Permanent Account Deletion */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <Trash2 className="w-4 h-4" />
                    <span>Danger Zone: Delete Account</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-500/80 uppercase font-bold">Permanent Action</span>
                </div>

                {accountDeletedMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{accountDeletedMsg}</span>
                  </div>
                )}

                {currentUser.id === ADMIN_CREDENTIALS.id ? (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>The Master Lead Instructor account (CYRUS) is protected and cannot be deleted.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Permanently delete your account (<strong className="text-white">{currentUser.name}</strong>). All your submissions, quiz scores, and saved settings will be wiped.
                    </p>

                    {deleteConfirmOpen ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-rose-800/60 space-y-2.5 animate-in fade-in">
                        <p className="text-xs font-bold text-rose-300">
                          Are you sure you want to permanently delete this account?
                        </p>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            id="btn-confirm-self-delete"
                            onClick={handleSelfDeleteAccount}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm"
                          >
                            Yes, Permanently Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        id="btn-trigger-delete-account"
                        onClick={() => setDeleteConfirmOpen(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Account</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SWITCH ACCOUNT / SIGN IN / REGISTER */}
          {/* ========================================================================= */}
          {(!currentUser || currentViewTab === 'switch') && (
            <div className="space-y-4">
              {/* Active Logged-In User Card */}
              {currentUser && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Current Active Session
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <UserAvatar
                      avatar={currentUser.avatar}
                      name={currentUser.name}
                      className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-2xl shrink-0 shadow-sm"
                      fallbackEmoji="👤"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{currentUser.name}</h3>
                      <p className="text-xs text-slate-400 font-mono truncate">{currentUser.email}</p>
                      {currentUser.studentId && (
                        <p className="text-[10px] text-slate-500 font-mono">ID: {currentUser.studentId}</p>
                      )}
                    </div>
                  </div>

                  {/* Log Out Action */}
                  {onLogout && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">Ready to end this session?</span>
                      <button
                        type="button"
                        id="btn-modal-logout"
                        onClick={() => {
                          onLogout();
                          if (onClose) onClose();
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 hover:text-white text-xs font-bold transition shadow-sm"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Log Out Now</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mode Switch Tabs when not logged in */}
              {!currentUser && (
                <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    id="btn-tab-signin"
                    onClick={() => handleSwitchMode('signin')}
                    className={`py-2 px-3 rounded-xl transition ${
                      authMode === 'signin'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    id="btn-tab-register"
                    onClick={() => handleSwitchMode('register')}
                    className={`py-2 px-3 rounded-xl transition ${
                      authMode === 'register'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Register Student
                  </button>
                </div>
              )}

              {/* Available Accounts Quick Switcher & Manager */}
              {availableAccounts.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Available Accounts on this Device</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {availableAccounts.length} {availableAccounts.length === 1 ? 'account' : 'accounts'}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {availableAccounts.map((u) => {
                      const isCurrent = currentUser?.id === u.id;
                      const isMasterAdmin = u.id === ADMIN_CREDENTIALS.id;
                      const isDeletingThis = userToDeleteInSwitch?.id === u.id;

                      return (
                        <div
                          key={u.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition ${
                            isCurrent
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <UserAvatar
                              avatar={u.avatar}
                              name={u.name}
                              className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-sm shrink-0"
                              fallbackEmoji={u.role === 'admin' ? '👑' : '👤'}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white truncate">{u.name}</span>
                                {isMasterAdmin && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold">
                                    Admin
                                  </span>
                                )}
                                {isCurrent && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isDeletingThis ? (
                              <div className="flex items-center gap-1 animate-in fade-in">
                                <button
                                  type="button"
                                  onClick={() => setUserToDeleteInSwitch(null)}
                                  className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-300 font-bold hover:bg-slate-700 transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  id={`btn-confirm-delete-switch-${u.id}`}
                                  onClick={() => handleDeleteUserInSwitch(u)}
                                  className="px-2 py-1 rounded-lg bg-rose-600 text-[10px] text-white font-bold hover:bg-rose-500 transition shadow-sm"
                                >
                                  Confirm
                                </button>
                              </div>
                            ) : (
                              <>
                                {!isCurrent && (
                                  <button
                                    type="button"
                                    id={`btn-quick-switch-to-${u.id}`}
                                    onClick={() => {
                                      AuthService.setCurrentUser(u);
                                      onUserChange(u);
                                      setSuccessMessage(`Switched active session to ${u.name}`);
                                      setTimeout(() => {
                                        setSuccessMessage(null);
                                        if (onClose) onClose();
                                      }, 600);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                                  >
                                    Switch
                                  </button>
                                )}

                                {!isMasterAdmin && (
                                  <button
                                    type="button"
                                    id={`btn-delete-account-switch-${u.id}`}
                                    onClick={() => setUserToDeleteInSwitch(u)}
                                    title={`Delete account for ${u.name}`}
                                    className="p-1 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 hover:text-rose-200 border border-rose-900/40 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                {currentUser
                  ? 'Or Switch / Sign in to Another Account:'
                  : authMode === 'register'
                  ? 'Register Student Profile:'
                  : authMode === 'forgot'
                  ? 'Reset Your Account Password:'
                  : 'Enter Credentials:'}
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Registration Notice */}
            {authMode === 'register' && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Public registration is strictly for <strong className="text-emerald-300">Students</strong>. Admin accounts are managed directly by Lead Instructor CYRUS.
                </span>
              </div>
            )}

            {/* Forgot Password Guidance */}
            {authMode === 'forgot' && (
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-[11px] text-blue-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Enter your registered account email and specify a new password to immediately restore studio access.
                </span>
              </div>
            )}

            {/* Name (if registering) */}
            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Full Name</span>
                </label>
                <input
                  id="input-auth-name"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. Juan Dela Cruz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Email Address</span>
              </label>
              <input
                id="input-auth-email"
                type="email"
                required
                autoComplete="off"
                placeholder={authMode === 'register' ? "student@university.edu" : "name@university.edu"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Student ID (if registering or forgot) */}
            {authMode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-slate-500" />
                    <span>Student ID Number (Optional)</span>
                  </label>
                  <input
                    id="input-auth-studentid"
                    type="text"
                    autoComplete="off"
                    placeholder="STU-2026-101"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>Primary Course Enrollment</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCourse('c')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                        selectedCourse === 'c'
                          ? 'bg-emerald-950/40 border-emerald-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs font-mono">
                        C
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">CS201: C Systems</p>
                        <p className="text-[10px] text-slate-400">Pointers & Memory</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCourse('cpp')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                        selectedCourse === 'cpp'
                          ? 'bg-blue-950/40 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs font-mono">
                        C++
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">CS202: Modern C++</p>
                        <p className="text-[10px] text-slate-400">OOP & STL</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Student ID verification (Optional for forgot password) */}
            {authMode === 'forgot' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Student ID (If registered with one)</span>
                </label>
                <input
                  id="input-forgot-studentid"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. STU-2026-101 (Optional)"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{authMode === 'forgot' ? 'New Password' : 'Password'}</span>
                </label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    id="btn-forgot-password"
                    onClick={() => handleSwitchMode('forgot')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="input-auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={authMode === 'register' || authMode === 'forgot' ? 'new-password' : 'current-password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (if forgot password) */}
            {authMode === 'forgot' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Confirm New Password</span>
                </label>
                <input
                  id="input-forgot-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-auth-submit"
              className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
            >
              <span>
                {authMode === 'register'
                  ? 'Complete Registration & Enter'
                  : authMode === 'forgot'
                  ? 'Update & Reset Password'
                  : 'Sign In & Access Studio'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Switch Mode Links */}
            <div className="text-center pt-2 space-y-1">
              {authMode === 'forgot' ? (
                <button
                  type="button"
                  id="btn-back-to-signin"
                  onClick={() => handleSwitchMode('signin')}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  Remembered your password? Back to sign in
                </button>
              ) : authMode === 'register' ? (
                <button
                  type="button"
                  id="btn-toggle-to-signin"
                  onClick={() => handleSwitchMode('signin')}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  Already have an account? Sign in here
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-toggle-to-register"
                  onClick={() => handleSwitchMode('register')}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  New student? Register a student account
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>

    {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-slate-400">CS201 / CS202 Lab Network</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Instructor: CYRUS</span>
        </div>
      </div>
    </div>
  );
};


