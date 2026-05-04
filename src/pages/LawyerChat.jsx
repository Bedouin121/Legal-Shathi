import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, Phone, Video, MoreVertical, ShieldCheck, ArrowLeft, Loader2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { liveChatAPI } from "@/services/api";
import { toast } from "sonner";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace("/api", "");

const createGuestId = () => {
  let current = localStorage.getItem("guest_room_id");
  if (!current) {
    current = `guest_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("guest_room_id", current);
  }
  return current;
};

export default function LawyerChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const guestId = useMemo(() => (user ? null : createGuestId()), [user]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [requestSummary, setRequestSummary] = useState("");
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [onlineLawyers, setOnlineLawyers] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    socketRef.current = io(SOCKET_URL, {
      auth: { token, guestId },
    });

    socketRef.current.on("live_chat_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on("live_chat_request_claimed", ({ sessionId, assignedLawyerName }) => {
      setSession((prev) => {
        if (!prev || prev.id !== sessionId) return prev;
        return { ...prev, status: "active", assignedLawyerName };
      });
      if (assignedLawyerName) {
        toast.success(`${assignedLawyerName} joined your consultation.`);
      }
    });

    socketRef.current.on("live_lawyer_presence", ({ onlineLawyers: count }) => {
      setOnlineLawyers(count || 0);
    });

    socketRef.current.on("live_chat_session_closed", () => {
      toast("The live consultation has been closed.");
      setSession(null);
      setMessages([]);
      setRequestSummary("");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [guestId]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await liveChatAPI.getMySession(guestId);
        setOnlineLawyers(data.onlineLawyers || 0);
        if (data.session) {
          setSession(data.session);
          setMessages(data.session.messages || []);
          socketRef.current?.emit("join_live_chat_room", data.session.roomId);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadSession();
  }, [guestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submitHelpRequest = async (e) => {
    e?.preventDefault();
    const summary = requestSummary.trim();
    if (!summary) return;

    setIsCreatingRequest(true);
    try {
      const data = await liveChatAPI.createRequest({
        guestId,
        guestName: user?.name || "Guest User",
        issueSummary: summary,
      });
      setSession(data.session);
      setMessages(data.session.messages || []);
      setOnlineLawyers(data.onlineLawyers || 0);
      socketRef.current?.emit("join_live_chat_room", data.session.roomId);
      toast.success("Your request has been sent to available lawyers.");
    } catch (error) {
      toast.error(error.message || "Failed to request a lawyer");
    } finally {
      setIsCreatingRequest(false);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!session || !input.trim() || !socketRef.current) return;

    const outgoingText = input.trim();
    setInput("");
    setIsSending(true);

    socketRef.current.emit(
      "send_live_chat_message",
      { sessionId: session.id, text: outgoingText },
      (response) => {
        setIsSending(false);
        if (!response?.ok) {
          setInput(outgoingText);
          toast.error(response?.message || "Failed to send message");
        }
      }
    );
  };

  const closeSession = async () => {
    if (!session) return;
    try {
      await liveChatAPI.closeSession(session.id, guestId);
      setSession(null);
      setMessages([]);
      setRequestSummary("");
      toast.success("Consultation closed.");
    } catch (error) {
      toast.error(error.message || "Failed to close consultation");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !session || !socketRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      socketRef.current.emit(
        "send_live_chat_message",
        {
          sessionId: session.id,
          text: "Sent an image",
          image: event.target?.result,
        },
        (response) => {
          if (!response?.ok) toast.error(response?.message || "Failed to send image");
        }
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <header className="flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full md:hidden" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center shadow-md">
              <ShieldCheck className="text-white h-5 w-5" />
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-slate-900 rounded-full ${onlineLawyers > 0 ? "bg-green-500" : "bg-slate-400"}`}></span>
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-white leading-tight">Live Legal Consult</h1>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              {onlineLawyers > 0 ? `${onlineLawyers} lawyer(s) online` : "No lawyers online right now"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-slate-500 rounded-full"><Phone className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-slate-500 rounded-full"><Video className="h-4 w-4" /></Button>
          {session && (
            <Button variant="ghost" size="icon" className="text-slate-500 rounded-full" onClick={closeSession} title="Close consultation / পরামর্শ শেষ করুন">
              <XCircle className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-slate-500 rounded-full"><MoreVertical className="h-4 w-4" /></Button>
        </div>
      </header>

      {!session ? (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form onSubmit={submitHelpRequest} className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Request a live lawyer</h2>
              <p className="text-sm text-slate-500 mt-2">
                Describe your issue briefly. Available lawyers will be notified, and the first one to accept can start chatting with you here.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                বাংলা: আপনার সমস্যাটি সংক্ষেপে লিখুন। অনলাইন আইনজীবীরা নোটিফিকেশন পাবেন।
              </p>
            </div>
            <textarea
              value={requestSummary}
              onChange={(e) => setRequestSummary(e.target.value)}
              placeholder="Example: I need help with a property dispute and land deed verification."
              className="w-full min-h-36 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button type="submit" disabled={!requestSummary.trim() || isCreatingRequest} className="w-full h-11">
              {isCreatingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : "Notify Available Lawyers"}
            </Button>
          </form>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-5">
            <div className="flex justify-center mb-2">
              <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="h-3 w-3" /> End-to-end encrypted session
              </div>
            </div>
            <div className="max-w-2xl mx-auto rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <div className="font-semibold">{session.status === "pending" ? "Waiting for a lawyer" : `Connected with ${session.assignedLawyerName}`}</div>
              <div className="mt-1">{session.issueSummary}</div>
            </div>

            {messages.map((msg, idx) => {
              const isMe = msg.senderType === "client";
              const isLawyer = msg.senderType === "lawyer";
              const showAvatar = isLawyer && (idx === 0 || messages[idx - 1]?.senderName !== msg.senderName);

              return (
                <div key={idx} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[92%] sm:max-w-[85%] md:max-w-[70%] gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    {isLawyer && (
                      <div className="flex-shrink-0 w-8 flex flex-col justify-end">
                        {showAvatar && (
                          <div className="h-8 w-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                            {msg.senderName?.slice(0, 2).toUpperCase() || "LW"}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {showAvatar && (
                        <span className="text-xs text-slate-500 mb-1 ml-1">{isLawyer ? msg.senderName : msg.senderType === "system" ? "System" : "You"}</span>
                      )}
                      <div className={`px-4 py-2.5 shadow-sm relative ${isMe ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700"}`}>
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        {msg.image && <img src={msg.image} alt="attached" className="mt-2 rounded-xl max-w-full md:max-w-sm" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex-none bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 md:p-4 sticky bottom-0 z-10">
            <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative flex items-end gap-2">
              <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />

              <Button type="button" variant="ghost" className="rounded-full h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => document.getElementById("image-upload").click()} title="Attach image / ছবি যোগ করুন">
                <ImageIcon className="h-5 w-5" />
              </Button>

              <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  placeholder={session.status === "pending" ? "You can add details while waiting..." : "Type your message securely..."}
                  className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 max-h-32 min-h-[48px] text-sm md:text-base"
                  rows={1}
                />
              </div>

              <Button type="submit" disabled={!input.trim() || isSending} className="rounded-full h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 bg-primary hover:bg-primary/90 text-white shadow-md disabled:opacity-50" title="Send / পাঠান">
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-1" />}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
