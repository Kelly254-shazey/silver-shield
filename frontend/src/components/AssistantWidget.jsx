import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { apiFetch } from "../app/api";

const welcomeMessage = {
  role: "assistant",
  text: "Welcome to Silver Shield. I answer using approved Documentation Center content on programs, impact, donations, and volunteering.",
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
    if (!question.trim() || loading) {
      return;
    }

    const prompt = question.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setLoading(true);

    try {
      const response = await apiFetch("/ai/chat", {
        method: "POST",
        body: { question: prompt },
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: response.data.answer,
          sources: response.data.sources || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: error.message || "I am unable to answer right now. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        className="assistant-fab"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open Silver Shield Assistant"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Ask
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.section
            className="assistant-panel glass-premium"
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ duration: 0.25 }}
          >
            <header className="assistant-header">
              <div className="assistant-title">
                <h4>Silver Shield Assistant</h4>
                <p>Get quick, grounded answers</p>
              </div>
              <button
                type="button"
                className="assistant-close"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
              >
                x
              </button>
            </header>

            <div className="assistant-messages">
              {messages.map((message, index) => (
                <motion.article
                  key={`${message.role}-${index}`}
                  className={`assistant-bubble ${message.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="bubble-content">
                    <p>{message.text}</p>
                    {message.sources?.length > 0 && (
                      <small className="bubble-sources">
                        Sources: {message.sources.join(", ")}
                      </small>
                    )}
                  </div>
                </motion.article>
              ))}

              {loading && (
                <motion.article
                  className="assistant-bubble assistant loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </motion.article>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="assistant-input-row">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    onSend();
                  }
                }}
                placeholder="Ask about programs, impact, donations..."
                disabled={loading}
              />
              <motion.button
                type="button"
                className="btn btn-primary"
                onClick={onSend}
                disabled={loading || !question.trim()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? "..." : "Send"}
              </motion.button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

export default AssistantWidget;
