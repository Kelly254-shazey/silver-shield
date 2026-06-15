import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  X, 
  Send, 
  Sparkles,
  User,
  Bot, 
  Minus, 
  MessageCircle,
  Paperclip, 
  Mic, 
} from "lucide-react";
import { apiFetch } from "../app/api";

/**
 * VISIBILITY OPTIONS:
 * 
 * 1. SCROLL DETECTION (DEFAULT) - Widget hides when near footer
 *    No additional props needed
 *
 * 2. ROUTE-BASED - Hide on specific routes:
 *    <AssistantWidget hiddenRoutes={['/admin', '/checkout']} />
 * 
 * 3. CUSTOM CONDITION - Pass a function:
 *    <AssistantWidget shouldShow={() => !isFooterVisible} />
 * 
 * 4. ALWAYS HIDE - Disable completely:
 *    <AssistantWidget disabled={true} />
 */

// Constants
const WELCOME_MESSAGE = {
  role: "assistant",
  text: "Greetings. I am the Silver Shield intelligence assistant. How can I guide you through our programs and impact initiatives today?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
};

const QUICK_ACTIONS = [
  "Programs", "Volunteer", "Donate", "Partnerships", "Contact Us", "FAQs", "Latest Projects"
];

const ERROR_MESSAGE = "I'm having trouble connecting to the knowledge base. Please try again in a moment.";

// Component
function AssistantWidget({ disabled = false, hiddenRoutes = [], shouldShow = null }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [quickActions, setQuickActions] = useState(QUICK_ACTIONS);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open && !minimized && messagesEndRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  // Handle visibility based on props and scroll
  useEffect(() => {
    // Disable completely if prop is set
    if (disabled) {
      setIsVisible(false);
      return;
    }

    // Check if current route is hidden
    if (hiddenRoutes.length > 0) {
      const currentPath = window.location.pathname;
      if (hiddenRoutes.some(route => currentPath.includes(route))) {
        setIsVisible(false);
        return;
      }
    }

    // Use custom visibility function if provided
    if (shouldShow !== null) {
      setIsVisible(shouldShow());
      return;
    }

    // Default: hide when scrolled near footer
    const handleScroll = () => {
      const scrollPos = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;
      const distanceToBottom = pageHeight - scrollPos;

      setIsVisible(distanceToBottom > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [disabled, hiddenRoutes, shouldShow]);

  // Handle message sending
  const handleSend = async (textOverride, isQuickAction = false) => {
    const textToSend = typeof textOverride === "string" ? textOverride : question;
    if (!textToSend.trim() || loading) return;

    const prompt = textToSend.trim(); // Ensure prompt is trimmed
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: prompt, timestamp }]);
    setLoading(true);

    try {
      const response = await apiFetch("/ai/chat", {
        method: "POST",
        body: { question: prompt }
      });

      setMessages((prev) => [
        ...prev,
        // Add the new assistant message
        {
          role: "assistant",
          text: response.data.answer,
          sources: response.data.sources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch  {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: ERROR_MESSAGE,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
      // If it was a quick action, remove it from the list
      if (isQuickAction) {
        setQuickActions(prev => prev.filter(action => action !== textOverride));
      }
      setQuestion(""); // Clear input after sending
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSend(question);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 z-[99999] flex flex-col items-end gap-4"
    >
      {/* Floating Trigger Button */}
      <motion.button
        type="button"
        aria-label={open ? "Close Assistant" : "Open Assistant"}
        onClick={() => {
          setOpen(prev => !prev);
          setMinimized(false); // Always un-minimize when clicking the button
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -8, 0],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className="w-16 h-16 rounded-full bg-brand-900 text-white flex items-center justify-center border-none cursor-pointer group relative overflow-hidden shadow-[0_20px_50px_rgba(91,33,182,0.35)] backdrop-blur-xl transition-all"
      >
        {/* Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-700 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity" />
        
        {/* Icon */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {open && !minimized ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={28} />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ rotate: 180 }} animate={{ rotate: 0 }} exit={{ rotate: -180 }}>
                <MessageCircle size={28} />
              </motion.div>
            )}
            {/* Modern AI Badge */}
            {!open && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-2 -right-2 bg-accent-600 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter z-20 shadow-sm"
              >
                AI
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: { type: "spring", stiffness: 350, damping: 25 } 
            }}
            exit={{ opacity: 0, y: 40, scale: 0.85, transition: { duration: 0.2, ease: "easeIn" } }}
            className="fixed bottom-0 left-0 right-0 w-full h-[80vh] rounded-t-[24px] md:absolute md:bottom-20 md:right-0 md:left-auto md:w-[380px] md:h-[650px] md:rounded-[24px] bg-white/95 backdrop-blur-lg shadow-premium border border-border-subtle flex flex-col overflow-hidden z-[100000]"
          >
            {/* Header */}
            <Header onMinimize={() => setMinimized(true)} onClose={() => setOpen(false)} />

            {/* Messages Section */}
            <MessagesList messages={messages} loading={loading} messagesEndRef={messagesEndRef} />
            {/* Input Section */}
            <InputSection 
              question={question}
              loading={loading}
              onKeyDown={handleKeyDown}
              onSend={handleSend}
              quickActions={quickActions}
              setQuestion={setQuestion}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Header Component
function Header({ onMinimize, onClose }) {
  return (
    <header className="h-16 bg-brand-900 px-6 text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10">
          <Sparkles size={20} className="text-accent-400" />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest m-0 leading-tight">Shield Intelligence</h4>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-tighter">Grounded in official docs</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <HeaderButton icon={<Minus size={18} />} onClick={onMinimize} />
        <HeaderButton icon={<X size={18} />} onClick={onClose} />
      </div>
    </header>
  );
}

// Header Button Component
function HeaderButton({ icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-white/10 rounded-lg transition-colors bg-transparent border-none cursor-pointer text-white/60 hover:text-white"
    >
      {icon}
    </button>
  );
}

// Messages List Component
function MessagesList({ messages, loading, messagesEndRef }) {
  return (
    <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6 bg-surface-200">
      {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))}

      {loading && <LoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}

// Single Message Component
function Message({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`} // Align messages to right for user, left for assistant
    >
      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
            isUser
              ? "bg-brand-800 text-white"
              : "bg-white text-brand-900 shadow-sm border border-border-subtle"
          }`}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Message Bubble */}
        <div
          className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
            isUser
              ? "bg-brand-900 text-white rounded-tr-none shadow-lg"
              : message.isError
              ? "bg-danger/10 text-danger border border-danger/20"
              : "bg-white text-text-600 rounded-tl-none shadow-sm border border-border-subtle"
          }`}
        >
          <p className="m-0">{message.text}</p>

          {/* Sources */}
          {message.sources?.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border-subtle flex flex-wrap gap-1">
              {message.sources.map((source) => (
                <span
                  key={source}
                  className="text-[8px] font-black uppercase tracking-tighter bg-surface-300 text-text-400 px-1.5 py-0.5 rounded"
                >
                  {source}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <span className="text-[8px] font-black text-text-400 uppercase mt-1 px-10">
        {message.timestamp}
      </span>
    </motion.div>
  );
}

// Loading Indicator Component
function LoadingIndicator() {
  const dotVariants = {
    animate: (i) => ({
      y: [0, -4, 0],
      transition: { repeat: Infinity, duration: 0.6, delay: i * 0.15 }
    })
  };

  return (
    <div className="flex gap-3 items-center text-text-400 mb-4">
      <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center border border-border-subtle">
        <Bot size={14} />
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={dotVariants}
            animate="animate"
            className="w-1 h-1 bg-text-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

// Input Section Component
function InputSection({ question, loading, onKeyDown, onSend, quickActions, setQuestion }) {
  return (
    <div className="p-6 bg-white border-t border-border-subtle flex-shrink-0">
      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-1">
        {quickActions.map((action) => (
          <button
            key={action}
            onClick={() => onSend(action, true)}
            className="whitespace-nowrap px-4 py-1.5 rounded-full bg-surface-100 border border-border-subtle text-[10px] font-black uppercase tracking-widest text-brand-800 hover:bg-brand-900 hover:text-white transition-all cursor-pointer flex-shrink-0"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="bg-surface-100 rounded-2xl p-1.5 flex items-center gap-1">
        <InputButton icon={<Paperclip size={18} />} />
        <input
          className="flex-grow bg-transparent border-none py-2 px-2 outline-none text-[13px] font-semibold text-text-900 placeholder:text-text-400"
          value={question}
          onChange={(e => setQuestion(e.target.value))}
          onKeyDown={onKeyDown}
          placeholder="How can I help you?"
          disabled={loading}
        />
        <InputButton icon={<Mic size={18} />} />
        <SendButton onClick={() => onSend()} disabled={loading || !question.trim()} />
      </div>
    </div>
  );
}

// Input Button Component
function InputButton({ icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2.5 text-text-400 hover:text-brand-900 transition-colors bg-transparent border-none cursor-pointer"
    >
      {icon}
    </button>
  );
}

// Send Button Component
function SendButton({ onClick, disabled }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className="w-10 h-10 bg-brand-900 text-white rounded-full flex items-center justify-center hover:bg-accent-600 transition-colors border-none cursor-pointer disabled:opacity-50 shadow-md"
    >
      <Send size={18} />
    </motion.button>
  );
}

export default AssistantWidget;