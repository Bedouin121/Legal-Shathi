import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Loader2, AlertCircle, ArrowLeft, Trash2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const SYSTEM_PROMPT = `You are "AI Shathi", an expert AI legal assistant for the Legal Shathi platform in Bangladesh. 
Your role is to help users:
- Understand legal documents and templates
- Choose the right legal template for their needs
- Explain legal terms in simple Bengali or English
- Guide users through legal processes in Bangladesh
- Answer questions about Bangladeshi law (family law, property law, business law, employment law, etc.)

Always be helpful, empathetic, and clear. If a question is outside your legal expertise or requires a licensed lawyer, recommend consulting a professional. 
Respond in the same language as the user (Bengali or English). Keep responses concise and actionable.`;

const SUGGESTED_QUESTIONS = [
  "What template do I need to sell my property?",
  "How do I register a business in Bangladesh?",
  "What's the difference between Power of Attorney and Guardianship?",
  "What documents do I need for marriage registration?",
  "Explain the termination process under Bangladesh labor law",
  "What is included in a standard rental agreement?",
];

const ChatMessage = ({ message, onCopy }) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex gap-3 sm:gap-4 mb-6 group", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg",
        isUser ? "bg-primary" : "bg-gradient-to-br from-violet-500 to-blue-600"
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
    <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg">
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
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "আস্সালামু আলাইকুম! I'm AI Shathi, your dedicated legal assistant for Bangladesh.\n\nI can help you:\n• Choose the right legal template\n• Understand legal terms and processes\n• Navigate Bangladeshi law\n• Draft and review document needs\n\nHow can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || "");
  const [showApiKeyInput, setShowApiKeyInput] = useState(!import.meta.env.VITE_OPENAI_API_KEY);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (userText) => {
    const text = (userText || input).trim();
    if (!text || isLoading) return;
    if (!apiKey) { setShowApiKeyInput(true); return; }

    const userMessage = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...newMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "API request failed");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.choices[0].message.content }]);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-display font-semibold text-foreground text-sm sm:text-base">AI Shathi</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-xs text-muted-foreground">Legal AI · Online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              API Key
            </button>
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* API Key Banner */}
        {showApiKeyInput && (
          <div className="px-4 sm:px-6 pb-4 pt-1 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">
              Enter your OpenAI API key. It's stored in your browser session only and never sent to our servers.
            </p>
            <div className="flex gap-2 max-w-lg">
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={() => { if (apiKey.startsWith("sk-")) setShowApiKeyInput(false); }}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        )}
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
          <div className="mt-auto pt-4 border-t border-border">
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
                  disabled={isLoading || showApiKeyInput}
                  className="flex-1 resize-none text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 max-h-32 overflow-y-auto leading-relaxed"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading || showApiKeyInput}
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />
                  }
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground/50 mt-2">
                AI Shathi can make mistakes. Verify important legal information with a licensed lawyer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
