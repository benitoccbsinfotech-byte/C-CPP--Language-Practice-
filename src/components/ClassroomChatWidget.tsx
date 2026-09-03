import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, PracticeProblem } from '../types';
import { AuthService, ADMIN_CREDENTIALS } from '../services/authService';
import { AITutorService } from '../services/aiTutorService';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Crown,
  GraduationCap,
  X,
  Minimize2,
  Maximize2,
  Code2,
  Paperclip,
  Check,
  Copy,
  Trash2,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  MessageCircle,
  CornerDownRight,
  Lightbulb,
} from 'lucide-react';

interface ClassroomChatWidgetProps {
  currentUser: User | null;
  activeProblem?: PracticeProblem;
  currentCode?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
  onOpenLogin?: () => void;
}

const QUICK_PROMPTS = [
  'Why do we need pointers to swap variables in C?',
  'What causes a Segmentation Fault (SIGSEGV)?',
  'Difference between Stack memory and Heap memory?',
  'How to check if malloc returned NULL?',
  'Why do C strings need a null terminator \\0?',
];

export const ClassroomChatWidget: React.FC<ClassroomChatWidgetProps> = ({
  currentUser,
  activeProblem,
  currentCode,
  isOpen = true,
  onClose,
  isEmbedded = false,
  onOpenLogin,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => AuthService.getChatMessages());
  const [inputText, setInputText] = useState('');
  const [includeCode, setIncludeCode] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string>(
    currentUser?.role === 'admin' ? 'all' : (currentUser?.id || 'general')
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [targetStudentForAdmin, setTargetStudentForAdmin] = useState<string>('student-alex');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages
  const reloadMessages = () => {
    setMessages(AuthService.getChatMessages());
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedThread, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const allUsers = AuthService.getUsers();
  const students = allUsers.filter((u) => u.role === 'student');

  // Filter messages based on role and selected thread
  const filteredMessages = messages.filter((msg) => {
    if (!currentUser) {
      return msg.threadId === 'general';
    }
    if (currentUser.role === 'admin') {
      if (selectedThread === 'all') return true;
      if (selectedThread === 'general') return msg.threadId === 'general';
      return (
        msg.threadId === selectedThread ||
        msg.senderId === selectedThread ||
        msg.recipientId === selectedThread
      );
    } else {
      // Student view: see general broadcasts and their own thread
      return msg.threadId === 'general' || msg.threadId === currentUser.id || msg.senderId === currentUser.id || msg.recipientId === currentUser.id;
    }
  });

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      if (onOpenLogin) onOpenLogin();
      return;
    }
    if (!inputText.trim() && !includeCode) return;

    const codeSnippetToSend = includeCode && currentCode ? currentCode : undefined;
    const promptText = inputText.trim();
    setInputText('');
    setIncludeCode(false);

    if (currentUser.role === 'admin') {
      // Admin Cyrus sends reply to student or general announcement
      const targetStudent = students.find((s) => s.id === targetStudentForAdmin);
      const isGeneral = selectedThread === 'general';

      const threadId = isGeneral ? 'general' : (selectedThread !== 'all' ? selectedThread : targetStudentForAdmin);
      const newMsg = AuthService.sendChatMessage({
        threadId,
        senderId: ADMIN_CREDENTIALS.id,
        senderName: ADMIN_CREDENTIALS.name,
        senderRole: 'admin',
        senderAvatar: '👑',
        recipientId: isGeneral ? undefined : (targetStudent?.id || threadId),
        recipientName: isGeneral ? 'All Students' : (targetStudent?.name || 'Student'),
        content: promptText,
        codeSnippet: codeSnippetToSend,
        isInstructorReply: true,
        relatedProblemId: activeProblem?.id,
        relatedProblemTitle: activeProblem?.title,
      });

      reloadMessages();
    } else {
      // Student sends question to Cyrus & AI
      const newMsg = AuthService.sendChatMessage({
        threadId: currentUser.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: 'student',
        senderAvatar: currentUser.avatar,
        recipientId: ADMIN_CREDENTIALS.id,
        recipientName: ADMIN_CREDENTIALS.name,
        content: promptText,
        codeSnippet: codeSnippetToSend,
        relatedProblemId: activeProblem?.id,
        relatedProblemTitle: activeProblem?.title,
      });

      reloadMessages();

      // Trigger AI C Tutor response automatically for the student
      setIsAiLoading(true);
      try {
        const aiAnswer = await AITutorService.askTutor({
          prompt: promptText,
          code: codeSnippetToSend,
          problemTitle: activeProblem?.title,
          senderName: currentUser.name,
          senderRole: 'student',
        });

        AuthService.sendChatMessage({
          threadId: currentUser.id,
          senderId: 'ai-tutor',
          senderName: 'AI C Tutor',
          senderRole: 'ai',
          senderAvatar: '🤖',
          recipientId: currentUser.id,
          recipientName: currentUser.name,
          content: aiAnswer,
          isAI: true,
          relatedProblemId: activeProblem?.id,
          relatedProblemTitle: activeProblem?.title,
        });

        reloadMessages();
      } catch (err) {
        console.error('AI tutor error:', err);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  // Admin AI Draft Assistant
  const handleDraftWithAI = async (studentQuestion: string, codeSnippet?: string) => {
    setIsAiLoading(true);
    try {
      const aiDraft = await AITutorService.askTutor({
        prompt: studentQuestion,
        code: codeSnippet,
        problemTitle: activeProblem?.title,
        senderName: ADMIN_CREDENTIALS.name,
        senderRole: 'admin',
        isDraftForAdmin: true,
      });

      setInputText(aiDraft);
    } catch (err) {
      console.error('Failed to generate draft:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  if (!isOpen && !isEmbedded) return null;

  return (
    <div
      className={`${
        isEmbedded
          ? 'w-full h-full flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden'
          : `fixed bottom-4 right-4 z-40 w-[95vw] sm:w-[480px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden transition-all ${
              isMinimized ? 'h-16' : 'h-[620px] max-h-[85vh]'
            }`
      }`}
    >
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            {currentUser?.role === 'admin' ? <Crown className="w-5 h-5 text-amber-400" /> : <Bot className="w-5 h-5 text-emerald-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                {currentUser?.role === 'admin' ? 'Instructor Q&A & AI Reply Center' : 'AI C Tutor & Instructor Help'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800">
                {currentUser?.role === 'admin' ? 'CYRUS (Admin)' : 'Prof. Cyrus'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentUser?.role === 'admin'
                ? 'Review student questions & dispatch verified replies'
                : 'Instant 24/7 C guidance & direct link to Cyrus'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isEmbedded && (
            <button
              id="btn-toggle-minimize-chat"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          )}

          {onClose && (
            <button
              id="btn-close-chat-widget"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Thread / Filter Bar for Admin */}
          {currentUser?.role === 'admin' && (
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">Thread:</span>
              <button
                onClick={() => {
                  setSelectedThread('all');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedThread === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                All Messages
              </button>

              <button
                onClick={() => {
                  setSelectedThread('general');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedThread === 'general'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                📢 Class Announcement
              </button>

              {students.map((stu) => {
                const count = messages.filter((m) => m.threadId === stu.id && m.senderRole === 'student').length;
                return (
                  <button
                    key={stu.id}
                    onClick={() => {
                      setSelectedThread(stu.id);
                      setTargetStudentForAdmin(stu.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                      selectedThread === stu.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{stu.name}</span>
                    {count > 0 && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] flex items-center justify-center font-bold">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Prompts Carousel for Students */}
          {currentUser?.role === 'student' && (
            <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span>Ask:</span>
              </span>
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 text-[11px] whitespace-nowrap transition flex items-center gap-1"
                >
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/50">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <MessageSquare className="w-10 h-10 mb-2 opacity-30 text-emerald-400" />
                <p className="text-xs font-bold text-slate-400">No messages in this channel yet</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  {currentUser?.role === 'admin'
                    ? 'Use the input below to send an announcement or reply to your students.'
                    : 'Ask any question about C syntax, pointers, or click quick prompts above!'}
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = currentUser ? msg.senderId === currentUser.id : false;
                const isAI = msg.isAI || msg.senderRole === 'ai';
                const isInstructor = msg.isInstructorReply || msg.senderRole === 'admin';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col space-y-1 ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {/* Sender badge */}
                    <div className="flex items-center gap-1.5 px-1 text-[11px] text-slate-400">
                      {isInstructor ? (
                        <span className="flex items-center gap-1 font-bold text-purple-400">
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>CYRUS (Instructor)</span>
                        </span>
                      ) : isAI ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-400">
                          <Bot className="w-3 h-3" />
                          <span>AI C Tutor</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold text-slate-300">
                          <UserIcon className="w-3 h-3 text-slate-500" />
                          <span>{msg.senderName}</span>
                        </span>
                      )}

                      {msg.recipientName && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <CornerDownRight className="w-2.5 h-2.5" />
                          <span>{msg.recipientName}</span>
                        </span>
                      )}

                      <span className="text-[10px] text-slate-600 font-mono ml-1">{msg.timestamp}</span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2.5 shadow-md ${
                        isInstructor
                          ? 'bg-purple-950/40 border border-purple-500/40 text-purple-100 shadow-purple-950/30'
                          : isAI
                          ? 'bg-slate-900 border border-emerald-500/30 text-slate-200'
                          : isMe
                          ? 'bg-emerald-900/40 border border-emerald-500/40 text-emerald-100'
                          : 'bg-slate-900 border border-slate-800 text-slate-300'
                      }`}
                    >
                      {/* Context badge if attached to problem */}
                      {msg.relatedProblemTitle && (
                        <div className="px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1 w-fit">
                          <Code2 className="w-3 h-3 text-emerald-400" />
                          <span>Problem: {msg.relatedProblemTitle}</span>
                        </div>
                      )}

                      {/* Content Text */}
                      <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</div>

                      {/* Code Snippet Box */}
                      {msg.codeSnippet && (
                        <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden mt-2 font-mono text-[11px]">
                          <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Code2 className="w-3 h-3" />
                              <span>C Code Snippet</span>
                            </span>
                            <button
                              onClick={() => handleCopyCode(msg.codeSnippet!, msg.id)}
                              className="p-1 rounded text-slate-400 hover:text-white flex items-center gap-1 transition"
                            >
                              {copiedMsgId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 text-emerald-300 overflow-x-auto custom-scrollbar">
                            <code>{msg.codeSnippet}</code>
                          </pre>
                        </div>
                      )}

                      {/* Admin Quick Action: Draft AI reply to this question */}
                      {currentUser.role === 'admin' && msg.senderRole === 'student' && (
                        <div className="pt-2 border-t border-purple-800/30 flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setTargetStudentForAdmin(msg.senderId);
                              setSelectedThread(msg.threadId);
                              handleDraftWithAI(msg.content, msg.codeSnippet);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-800/50 hover:bg-purple-700 text-purple-200 text-[10px] font-bold flex items-center gap-1 transition"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Draft AI Reply</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isAiLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs w-fit animate-pulse">
                <Bot className="w-4 h-4 animate-spin text-emerald-400" />
                <span>AI Tutor is formulating C explanation & syntax breakdown...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input or Login Banner */}
          {!currentUser ? (
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-400">
                <p className="font-bold text-white">Guest Session</p>
                <p className="text-[11px] text-slate-400">Please log in to chat with Instructor CYRUS or ask the AI Tutor.</p>
              </div>
              {onOpenLogin && (
                <button
                  type="button"
                  id="btn-chat-open-login"
                  onClick={onOpenLogin}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shrink-0 shadow-md shadow-emerald-950/40"
                >
                  Log In / Register
                </button>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSendMessage}
              className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-2.5 shrink-0"
            >
              {/* Context Action Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {currentCode && (
                    <button
                      type="button"
                      onClick={() => setIncludeCode(!includeCode)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition ${
                        includeCode
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{includeCode ? 'Code Attached ✓' : 'Attach Editor Code'}</span>
                    </button>
                  )}

                  {currentUser?.role === 'admin' && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-500">Reply to:</span>
                      <select
                        value={targetStudentForAdmin}
                        onChange={(e) => setTargetStudentForAdmin(e.target.value)}
                        className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-purple-300 text-[11px] focus:outline-none"
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.studentId})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {currentUser?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => handleDraftWithAI(inputText || 'Explain pointer memory safety and free() best practices')}
                    className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800/60 text-[11px] font-bold flex items-center gap-1 transition"
                    title="Generate instructor answer with AI"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>AI Suggestion</span>
                  </button>
                )}
              </div>

              {/* Input Bar */}
              <div className="flex items-center gap-2">
                <textarea
                  id="input-chat-message"
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    currentUser?.role === 'admin'
                      ? 'Type instructor response or guidance as CYRUS...'
                      : 'Ask AI C Tutor or message Instructor Cyrus (e.g. Why did my pointer crash?)...'
                  }
                  className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 custom-scrollbar resize-none"
                />

                <button
                  type="submit"
                  id="btn-send-chat"
                  disabled={!inputText.trim() && !includeCode}
                  className={`p-3 rounded-2xl transition flex items-center justify-center shrink-0 ${
                    currentUser?.role === 'admin'
                      ? 'bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white shadow-md shadow-purple-950/50'
                      : 'bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};
