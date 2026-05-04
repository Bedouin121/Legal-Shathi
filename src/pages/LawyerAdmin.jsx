import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, User, Search, Settings, FileText, Phone, MoreHorizontal, ArrowLeft, Bell, Loader2, Power, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { liveChatAPI } from "@/services/api";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace("/api", "");

export default function LawyerAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeSessionIdRef = useRef("");

  const [pendingRequests, setPendingRequests] = useState([]);
  const [assignedSessions, setAssignedSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [input, setInput] = useState("");
  const [isClaiming, setIsClaiming] = useState("");
  const [onlineLawyers, setOnlineLawyers] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});

  const activeSession = useMemo(
    () => assignedSessions.find((session) => session.id === activeSessionId) || pendingRequests.find((session) => session.id === activeSessionId) || null,
    [assignedSessions, pendingRequests, activeSessionId]
  );

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    if (user && user.role !== "lawyer" && user.role !== "admin") {
      toast.error("Unauthorized access. Lawyer privileges required.");
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    socketRef.current = io(SOCKET_URL, { auth: { token } });

    socketRef.current.emit("register_lawyer_online");

    socketRef.current.on("live_chat_request_created", ({ session, onlineLawyers: count }) => {
      setOnlineLawyers(count || 0);
      setPendingRequests((prev) => {
        if (prev.some((item) => item.id === session.id)) return prev;
        return [session, ...prev];
      });
      toast("New live chat request", {
        description: `${session.clientName} needs help now.`,
      });
    });

    socketRef.current.on("live_chat_request_claimed", ({ sessionId }) => {
      setPendingRequests((prev) => prev.filter((session) => session.id !== sessionId));
    });

    socketRef.current.on("live_chat_message", (message) => {
      setAssignedSessions((prev) =>
        prev.map((session) =>
          session.id === message.sessionId
            ? { ...session, messages: [...session.messages, message], lastMessageAt: message.createdAt || new Date().toISOString() }
            : session
        )
      );
      if (message.senderType === "client" && message.sessionId !== activeSessionIdRef.current) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sessionId]: (prev[message.sessionId] || 0) + 1,
        }));
      }
    });

    socketRef.current.on("live_chat_message_alert", ({ sessionId, preview, lastMessageAt }) => {
      setAssignedSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, lastMessageAt, lastPreview: preview } : session
        )
      );
    });

    socketRef.current.on("live_lawyer_presence", ({ onlineLawyers: count }) => {
      setOnlineLawyers(count || 0);
    });

    socketRef.current.on("live_chat_session_closed", ({ session }) => {
      setPendingRequests((prev) => prev.filter((item) => item.id !== session.id));
      setAssignedSessions((prev) => prev.filter((item) => item.id !== session.id));
      setUnreadCounts((prev) => {
        const next = { ...prev };
        delete next[session.id];
        return next;
      });
      if (activeSessionIdRef.current === session.id) {
        setActiveSessionId("");
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, navigate]);

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const data = await liveChatAPI.getLawyerQueue();
        setPendingRequests(data.pending || []);
        setAssignedSessions(data.assigned || []);
        setOnlineLawyers(data.onlineLawyers || 0);
        data.assigned?.forEach((session) => {
          socketRef.current?.emit("join_live_chat_room", session.roomId);
        });
        if (!activeSessionId && data.assigned?.length) {
          setActiveSessionId(data.assigned[0].id);
        }
      } catch (error) {
        toast.error(error.message || "Failed to load lawyer queue");
      }
    };

    if (user?.role === "lawyer" || user?.role === "admin") {
      loadQueue();
    }
  }, [user, activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  const openSession = (session) => {
    setActiveSessionId(session.id);
    setUnreadCounts((prev) => ({ ...prev, [session.id]: 0 }));
    socketRef.current?.emit("join_live_chat_room", session.roomId);
  };

  const toggleAvailability = () => {
    const next = !isAvailable;
    setIsAvailable(next);
    socketRef.current?.emit(next ? "register_lawyer_online" : "unregister_lawyer_online");
    toast(next ? "You are available for new requests." : "You are unavailable for new requests.");
  };

  const claimSession = async (sessionId) => {
    setIsClaiming(sessionId);
    try {
      const data = await liveChatAPI.claimSession(sessionId);
      setPendingRequests((prev) => prev.filter((session) => session.id !== sessionId));
      setAssignedSessions((prev) => [data.session, ...prev.filter((session) => session.id !== sessionId)]);
      openSession(data.session);
      toast.success("Consultation claimed successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to claim consultation");
    } finally {
      setIsClaiming("");
    }
  };

  const closeSession = async () => {
    if (!activeSession) return;
    try {
      const data = await liveChatAPI.closeSession(activeSession.id);
      setPendingRequests((prev) => prev.filter((session) => session.id !== data.session.id));
      setAssignedSessions((prev) => prev.filter((session) => session.id !== data.session.id));
      setActiveSessionId("");
      setUnreadCounts((prev) => {
        const next = { ...prev };
        delete next[data.session.id];
        return next;
      });
      toast.success("Consultation closed.");
    } catch (error) {
      toast.error(error.message || "Failed to close consultation");
    }
  };

  const sendMessage = (e) => {
    e?.preventDefault();
    if (!input.trim() || !activeSession || String(activeSession.assignedLawyerId) !== String(user?._id)) return;

    const outgoingText = input.trim();
    setInput("");
    socketRef.current?.emit(
      "send_live_chat_message",
      { sessionId: activeSession.id, text: outgoingText },
      (response) => {
        if (!response?.ok) {
          setInput(outgoingText);
          toast.error(response?.message || "Failed to send message");
        }
      }
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeSession || String(activeSession.assignedLawyerId) !== String(user?._id)) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      socketRef.current?.emit("send_live_chat_message", {
        sessionId: activeSession.id,
        text: "Sent an image",
        image: event.target?.result,
      });
    };
    reader.readAsDataURL(file);
  };

  if (user && user.role !== "lawyer" && user.role !== "admin") {
    return <div className="p-8 text-center text-red-500 font-bold">Unauthorized. Access restricted to lawyers only.</div>;
  }

  return (
    <div className="flex h-[100dvh] bg-slate-100 dark:bg-slate-950 font-sans overflow-hidden">
      <div
        className={`w-full md:w-[340px] lg:w-[400px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col flex-shrink-0 ${
          activeSession ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-100 tracking-tight">Live Consult Queue</h2>
              <p className="text-xs text-slate-500 mt-1" title="অনলাইন আইনজীবীর সংখ্যা">
                {onlineLawyers} lawyer(s) online
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant={isAvailable ? "default" : "outline"}
              onClick={toggleAvailability}
              className="gap-2"
              title={isAvailable ? "বাংলা: নতুন ক্লায়েন্ট রিকোয়েস্ট নিতে প্রস্তুত" : "বাংলা: আপাতত নতুন রিকোয়েস্ট নেবেন না"}
            >
              <Power className="h-4 w-4" />
              <span className="hidden xs:inline">{isAvailable ? "Available" : "Away"}</span>
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pending queue updates in real time"
              title="বাংলা: নতুন ক্লায়েন্ট রিকোয়েস্ট এখানে দেখা যাবে"
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-9 pr-4 text-sm"
              disabled
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2" title="বাংলা: ক্লায়েন্টের অপেক্ষমাণ অনুরোধ">
            <Bell className="h-3.5 w-3.5" /> Pending Requests
          </div>
          {pendingRequests.map((session) => (
            <div key={session.id} className="p-3 mx-2 my-1 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{session.clientName}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{session.issueSummary}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => claimSession(session.id)}
                  disabled={isClaiming === session.id}
                  title="বাংলা: এই ক্লায়েন্টের চ্যাট গ্রহণ করুন"
                >
                  {isClaiming === session.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim"}
                </Button>
              </div>
            </div>
          ))}

          <div className="px-3 py-2 mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider" title="বাংলা: আপনার নেওয়া সক্রিয় চ্যাট">
            My Active Sessions
          </div>
          {assignedSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => openSession(session)}
              className={`flex items-center gap-3 p-3 mx-2 my-1 rounded-xl cursor-pointer transition-all ${
                activeSessionId === session.id ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${activeSessionId === session.id ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"}`}>
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-sm truncate">{session.clientName}</h3>
                  {unreadCounts[session.id] > 0 && (
                    <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {unreadCounts[session.id]}
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate ${activeSessionId === session.id ? "text-primary-foreground/80" : "text-slate-500"}`}>
                  {session.lastPreview || session.issueSummary}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Button variant="outline" className="w-full justify-start text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
            <Settings className="mr-2 h-4 w-4" /> Dashboard Settings
          </Button>
        </div>
      </div>

      <div className={`${activeSession ? "flex" : "hidden md:flex"} flex-1 flex-col relative bg-[#f0f2f5] dark:bg-slate-950 min-w-0`}>
        {activeSession ? (
          <>
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 md:p-4 flex items-center justify-between shadow-sm z-10 flex-none">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden mr-1" onClick={() => setActiveSessionId("")} title="Back / ফিরে যান">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[180px] sm:max-w-none">{activeSession.clientName}</h2>
                  <p className="text-xs text-slate-500 line-clamp-1">{activeSession.status === "pending" ? "Pending claim" : activeSession.issueSummary}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex"><FileText className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex"><Phone className="h-4 w-4" /></Button>
                {activeSession.status === "active" && (
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={closeSession} title="Close consultation / পরামর্শ শেষ করুন">
                    <XCircle className="h-5 w-5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              <div className="text-center my-4">
                <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs px-4 py-1.5 rounded-full shadow-sm font-medium">
                  {activeSession.status === "pending" ? "Claim this request to begin chatting" : "Secure conversation active"}
                </span>
              </div>

              {activeSession.messages?.map((msg, idx) => {
                const isMe = msg.senderType === "lawyer";
                return (
                  <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-[65%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-2.5 shadow-sm relative ${isMe ? "bg-[#dcf8c6] dark:bg-primary text-slate-800 dark:text-white rounded-2xl rounded-tr-sm" : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700"}`}>
                        <p className="text-[15px] whitespace-pre-wrap">{msg.text}</p>
                        {msg.image && <img src={msg.image} alt="attached" className="mt-2 rounded-xl max-w-full" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-4 bg-[#f0f2f5] dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-none">
              {activeSession.status === "pending" ? (
                <Button className="w-full h-12" onClick={() => claimSession(activeSession.id)} disabled={isClaiming === activeSession.id}>
                  {isClaiming === activeSession.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim This Request"}
                </Button>
              ) : (
                <form onSubmit={sendMessage} className="flex gap-2 items-end max-w-5xl mx-auto">
                  <input type="file" id="admin-image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <Button type="button" variant="ghost" className="rounded-full h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" onClick={() => document.getElementById("admin-image-upload").click()} title="Attach image / ছবি যোগ করুন">
                    <ImageIcon className="h-6 w-6" />
                  </Button>
                  <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                      placeholder="Type legal advice..."
                      className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 max-h-32 min-h-[48px] text-sm md:text-base outline-none"
                      rows={1}
                    />
                  </div>
                  <Button type="submit" disabled={!input.trim()} className="rounded-full h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 bg-primary hover:bg-primary/90 text-white shadow-md disabled:opacity-50" title="Send / পাঠান">
                    <Send className="h-5 w-5 ml-1" />
                  </Button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-950 h-full">
            <div className="h-24 w-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-200 dark:border-slate-800">
              <Bell className="h-10 w-10 text-slate-300 dark:text-slate-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2 tracking-tight">Lawyer Dashboard</h2>
            <p className="max-w-md text-slate-500 dark:text-slate-400">
              Pending requests from users appear here in real time. Claim one to start a live consultation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
