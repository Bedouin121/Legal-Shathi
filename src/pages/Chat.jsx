import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Loader2, AlertCircle, ArrowLeft, Trash2, Copy, Check, Brain, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";
import { chatAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import ProfileDropdown from "@/components/ProfileDropdown";

const SESSION_MEMORY_LIMIT = 10;

const SUGGESTED_QUESTIONS = [
  "What template do I need to sell my property?",
  "How do I register a business in Bangladesh?",
  "What's the difference between Power of Attorney and Guardianship?",
  "What documents do I need for marriage registration?",
  "Explain the termination process under Bangladesh labor law",
  "What is included in a standard rental agreement?",
];

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex gap-3 sm:gap-4 mb-6 group", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg",
        isUser ? "bg-primary" : "bg-gradient-to-br from-green-500 to-emerald-600"
      )}>
        {isUser
          ? <User className="h-4 w-4 text-white" />
          : <Bot className="h-5 w-5 text-white" />
        }
      </div>
      <div className={cn("flex flex-col max-w-[80%] sm:max-w-[72%]", isUser && "items-end")}>
        <span className="text-xs text-muted-foreground mb-1 px-1">
          {isUser ? "You" : "AI Shathi"}
        </span>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border text-foreground rounded-tl-sm"
        )}>
          {message.content}
        </div>
        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1.5 ml-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
          >
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-3 sm:gap-4 mb-6">
    <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
      <Bot className="h-5 w-5 text-white" />
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground mb-1 px-1">AI Shathi</span>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-4 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "আস্সালামু আলাইকুম! I'm AI Shathi, your dedicated legal assistant for Bangladesh.\n\nI can help you:\n• Choose the right legal template\n• Understand legal terms and processes\n• Navigate Bangladeshi law\n• Draft and review document needs\n\nHow can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [sessionMsgCount, setSessionMsgCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Track user+assistant message pairs for memory indicator (exclude initial greeting)
  const contextMessages = Math.min(Math.max(messages.length - 1, 0), SESSION_MEMORY_LIMIT);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (userText) => {
    const text = (userText || input).trim();
    if (!text || isLoading) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Add placeholder assistant message for streaming
    const assistantIndex = messages.length + 1;
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
        if (result.messageCount) setSessionMsgCount(Math.min(result.messageCount, SESSION_MEMORY_LIMIT));
      } else {
        await chatAPI.guestStream(text, messages, onChunk);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
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

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared! How can I help you with legal matters today?",
    }]);
    setChatId(null);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-display font-semibold text-foreground text-sm sm:text-base">AI Shathi</h1>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-xs text-muted-foreground">Legal AI · Online</span>
                  {contextMessages > 0 && (
                    <span className="hidden sm:flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 border border-primary/20">
                      <Brain className="h-3 w-3" />
                      {contextMessages}/{SESSION_MEMORY_LIMIT} in memory
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProfileDropdown />
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Suggested Questions (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-border bg-card/30 p-4 flex-shrink-0">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Suggested Questions
          </h3>
          <div className="flex flex-col gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={isLoading}
                className="text-left text-xs px-3 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/30 transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Session Memory Indicator */}
          <div className="mt-4 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/5 border border-primary/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Session Memory</span>
            </div>
            <div className="flex gap-1 mb-2 flex-wrap">
              {Array.from({ length: SESSION_MEMORY_LIMIT }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all",
                    i < contextMessages ? "bg-primary" : "bg-border"
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {contextMessages === 0
                ? "Start chatting — AI remembers your last 10 messages."
                : contextMessages >= SESSION_MEMORY_LIMIT
                ? "Memory full — oldest messages are rolling off."
                : `${contextMessages} of ${SESSION_MEMORY_LIMIT} messages in context`
              }
            </p>
            </p>
          </div>

          <div className="mt-auto pt-4 flex flex-col gap-3">
            {/* Find Lawyer CTA - Sidebar */}
            <Link 
              to="/find-lawyer" 
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-900 to-green-800 p-4 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/20 blur-xl pointer-events-none"></div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Scale className="h-4 w-4 text-emerald-100" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Find a Lawyer</h4>
                  <p className="text-[10px] text-emerald-100/80 mt-0.5">Need a human expert?</p>
                </div>
              </div>
            </Link>

            <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-primary/20 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">AI Shathi</span> is powered by GPT-4o mini and specializes in Bangladeshi law and legal templates.
              </p>
            </div>
          </div>
        </aside>

        {/* Messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Mobile Suggested Questions */}
          {messages.length === 1 && (
            <div className="lg:hidden px-4 pb-2">
              <div className="max-w-3xl mx-auto">
                <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="flex-shrink-0 text-xs px-3 py-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all whitespace-nowrap"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3 bg-secondary rounded-2xl border border-border px-4 py-3 focus-within:ring-1 focus-within:ring-primary transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about legal templates or Bangladeshi law..."
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 resize-none text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 max-h-32 overflow-y-auto leading-relaxed"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />
                  }
                </button>
              </div>
              <p className="text-center text-xs text-amber-600/80 mt-2">
                Ai may not fully be correct. Verify important legal information with a licensed lawyer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
