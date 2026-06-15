import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, User, Bot } from "lucide-react";
import { apiFetch } from "../app/api";

const welcomeMessage = {
  role: "assistant",
  text: "Greetings. I am the Silver Shield intelligence assistant. How can I guide you through our programs and impact initiatives today?",
};

function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSend = async () => {
    if (!question.trim() || loading) return;
    const prompt = question.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setLoading(true);

    try {
      const response = await apiFetch("/ai/chat", { method: "POST", body: { question: prompt } });
      setMessages((prev) => [...prev, { role: "assistant", text: response.data.answer, sources: response.data.sources || [] }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "I'm having trouble connecting to the knowledge base. Please try again in a moment.", isError: true }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <motion.button
        type="button"
        aria-label={open ? "Close Assistant" : "Open Assistant"}
        className="fixed bottom-10 right-10 w-16 h-16 rounded-2xl bg-brand-900 text-white shadow-premium z-sticky flex items-center justify-center border-none cursor-pointer group"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="absolute inset-0 bg-accent-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {open ? <X key="x" size={24} /> : <Sparkles key="ai" size={24} className="text-accent-400" />}
          </AnimatePresence>
        </div>
        
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
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 40, scale: 0.85, transformOrigin: "bottom right" }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } 
            }}
            exit={{ opacity: 0, y: 40, scale: 0.85, transition: { duration: 0.2, ease: "easeIn" } }}
            className="fixed bottom-32 right-10 w-[95vw] max-w-[440px] h-[600px] max-h-[75vh] bg-white rounded-2xl shadow-premium z-sticky border border-border-subtle flex flex-col overflow-hidden"
          >
            {/* Header */}
            <header className="bg-brand-900 p-8 text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-accent-600 rounded-full blur-[60px]" />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Sparkles size={24} className="text-accent-500" />
                </div>
                <div className="flex flex-col leading-tight">
                  <h4 className="text-sm font-black uppercase tracking-widest m-0 leading-tight">Shield Intelligence</h4>
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-tighter m-0">Grounded in official docs</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 text-white/40 hover:text-white transition-colors bg-transparent border-none cursor-pointer relative z-10"><X size={20}/></button>
            </header>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-8 flex flex-col gap-6 bg-surface-200">
              {messages.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-brand-800 text-white' : 'bg-white text-brand-900 shadow-sm border border-border-subtle'}`}>
                      {m.role === 'user' ? <User size={16}/> : <Bot size={16}/>}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-brand-900 text-white rounded-tr-none shadow-lg' 
                        : m.isError ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-white text-text-600 rounded-tl-none shadow-sm border border-border-subtle'
                    }`}>
                      <p className="m-0 leading-relaxed">{m.text}</p>
                      {m.sources?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border-subtle flex flex-wrap gap-1">
                          {m.sources.map(s => <span key={s} className="text-[8px] font-black uppercase tracking-tighter bg-surface-300 text-text-400 px-1.5 py-0.5 rounded">{s}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-3 items-center text-text-400">
                  <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center border border-border-subtle"><Bot size={16}/></div>
                  <div className="flex gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-text-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-text-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-text-400 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-border-subtle flex-shrink-0">
              <div className="relative">
                <input 
                  className="w-full bg-surface-200 border-none py-4 pl-6 pr-14 rounded-3xl focus:ring-2 focus:ring-brand-600 outline-none text-sm font-semibold"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSend()}
                  placeholder="Ask about programs..."
                  disabled={loading}
                />
                <button 
                  onClick={onSend}
                  disabled={loading || !question.trim()}
                  className="absolute right-2 top-2 w-10 h-10 bg-brand-900 text-white rounded-full flex items-center justify-center hover:bg-accent-600 transition-colors border-none cursor-pointer disabled:opacity-50 shadow-md"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[8px] font-black text-text-400 uppercase tracking-widest text-center mt-4 m-0">Safe • Encrypted • Grounded</p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

export default AssistantWidget;
