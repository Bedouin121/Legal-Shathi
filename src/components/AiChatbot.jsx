import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Minimize2, Maximize2, Bot, User, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const SUGGESTED_QUESTIONS = [
  "What template do I need to sell my property?",
  "How do I register a business in Bangladesh?",
  "What is included in a rental agreement?",
  "Can you explain Power of Attorney?",
];

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-primary" : "bg-gradient-to-br from-violet-500 to-blue-600"
      )}>
        {isUser
          ? <User className="h-4 w-4 text-white" />
          : <Bot className="h-4 w-4 text-white" />
        }
      </div>
      <div className={cn(
        "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
        isUser
          ? "bg-primary text-primary-foreground rounded-tr-sm"
          : "bg-secondary text-foreground rounded-tl-sm border border-border"
      )}>
        {message.content}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-3 mb-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-blue-600">
      <Bot className="h-4 w-4 text-white" />
    </div>
    <div className="bg-secondary border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  </div>
);

const AiChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "আস্সালামু আলাইকুম! I'm AI Shathi, your legal assistant. I can help you choose the right legal template, understand Bangladeshi law, and guide you through legal processes. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (userText) => {
    const text = (userText || input).trim();
    if (!text || isLoading) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Add a placeholder assistant message that we'll update as tokens stream in
    const assistantIndex = messages.length + 1; // +1 for the user message we just added
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const onChunk = (chunk, fullText) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIndex] = { role: "assistant", content: fullText };
          return updated;
        });
      };

      if (user) {
        const result = await chatAPI.sendMessageStream(text, chatId, onChunk);
        setChatId(result.chatId);
      } else {
        await chatAPI.guestStream(text, messages, onChunk);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      // Remove empty assistant message on error
      setMessages((prev) => prev.filter((_, i) => i !== assistantIndex || prev[i].content));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const chatWidth = isExpanded ? "w-[420px]" : "w-[360px]";
  const chatHeight = isExpanded ? "h-[600px]" : "h-[480px]";

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col rounded-2xl border border-border shadow-2xl shadow-black/50 overflow-hidden transition-all duration-300",
            "bg-card",
            "max-w-[calc(100vw-2rem)]",
            chatWidth,
            chatHeight
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Shathi</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <p className="text-xs text-white/80">Legal AI Assistant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:flex w-7 h-7 rounded-lg items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scroll-smooth">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2 mb-2">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 pb-2 flex-shrink-0">
              <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_QUESTIONS.slice(0, 2).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left text-xs px-3 py-2 rounded-lg border border-border text-foreground hover:bg-secondary hover:border-primary/40 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-border bg-card flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about legal templates..."
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none text-sm px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 max-h-24 overflow-y-auto"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 flex-shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />
                }
              </button>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-1.5 text-center">
              AI Shathi · Powered by OpenAI
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        id="ai-chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-2xl shadow-blue-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95",
          "bg-gradient-to-br from-blue-500 to-violet-600",
          isOpen && "rotate-90"
        )}
        aria-label="Open AI Chat"
      >
        {isOpen
          ? <X className="h-6 w-6 text-white" />
          : (
            <div className="relative">
              <Sparkles className="h-6 w-6 text-white" />
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
          )
        }
      </button>
    </>
  );
};

export default AiChatbot;
