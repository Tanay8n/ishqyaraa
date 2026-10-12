"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  MessageCircle,
  MapPin,
  Sparkles,
  ChevronLeft,
  Search,
  Flame,
  Navigation,
  Info,
  X,
  GraduationCap,
  CheckCircle2,
  MoreVertical,
  ShieldAlert,
  Ban,
  Smile,
  Check,
  AlertCircle,
  Heart,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useAppUser } from "@/components/AppUserContext";
import { loadConversationMessages, loadMyConversations, type AppConversation } from "@/lib/conversations";
import { blockUser, markConversationRead, recordReport, sendMessage } from "@/lib/interactions";

interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  createdAt: number;
  status?: "sent" | "delivered" | "read";
}

const ICEBREAKER_SUGGESTIONS = [
  "🪷 Up for Saptami Maddox Square adda?",
  "📍 What's your route for Ashtami?",
  "🍲 College Street anjali + bhog after?",
  "📸 Let's do dhunuchi dance photos!",
  "☕ Afternoon coffee adda at South City?",
];

const QUICK_EMOJIS = ["🪷", "❤️", "🔥", "😂", "☕", "🥟", "✨", "🙏"];

/* Double tick / Blue double tick component */
function MessageStatusTicks({ status = "read" }: { status?: "sent" | "delivered" | "read" }) {
  if (status === "sent") {
    return (
      <svg
        className="w-3.5 h-3.5 inline-block text-white/70"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
      </svg>
    );
  }

  const isRead = status === "read";
  return (
    <span
      className={`inline-flex items-center -space-x-1.5 ${
        isRead ? "text-cyan-300" : "text-white/70"
      }`}
      title={isRead ? "Read" : "Delivered"}
    >
      <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="2.5 8.5 5.5 11.5 11.5 4.5" />
      </svg>
      <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="5.5 8.5 8.5 11.5 14.5 4.5" />
      </svg>
    </span>
  );
}

function MessagesInner() {
  const searchParams = useSearchParams();
  const partnerParam = searchParams.get("partner");
  const matchParam = searchParams.get("matchId");
  const { user, publicProfile } = useAppUser();
  const [conversations, setConversations] = useState<AppConversation[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(partnerParam || "");

  // Responsive mobile view state: 'list' (conversation overview) or 'chat' (active room)
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    partnerParam || matchParam ? "chat" : "list"
  );

  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [messageError, setMessageError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showLocationBanner, setShowLocationBanner] = useState(false);
  const [showPartnerProfile, setShowPartnerProfile] = useState(false);
  const [profilePhotoIndex, setProfilePhotoIndex] = useState(0);

  // Safety & 3-dots menu state
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    let active = true;
    const supabase = createClient();
    const refresh = async () => {
      try {
        const values = await loadMyConversations(user.id, publicProfile);
        if (active) {
          setConversations(values);
          setMessageError(null);
        }
      } catch (error) {
        if (active) setMessageError(error instanceof Error ? error.message : "Could not load conversations.");
      }
    };
    void refresh();
    const channel = supabase
      .channel(`conversation-list-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversation_members", filter: `user_id=eq.${user.id}` },
        () => {
          void refresh();
        }
      )
      .subscribe();
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [user, publicProfile]);

  const selectedConversation =
    conversations.find((item) => item.matchId === matchParam || item.otherUid === partnerParam) ||
    conversations.find((item) => item.otherUid === selectedPartnerId) ||
    (!selectedPartnerId ? conversations[0] : undefined);

  const activePartnerId = selectedConversation?.otherUid || selectedPartnerId;
  const activeMatchId = selectedConversation?.matchId;
  const activePartner = selectedConversation?.profile;
  const activeChat = messages[activePartnerId] || [];

  // Load messages for active conversation
  useEffect(() => {
    if (!activeMatchId || !user) return;
    let active = true;
    const supabase = createClient();
    const refresh = async () => {
      try {
        const rows = await loadConversationMessages(activeMatchId, user.id);
        if (active) {
          // Compute read/seen status for ticks
          // If the other partner has sent a message after ours, or last_read is updated, marks as read (blue double tick)
          const lastThemIndex = rows.map((r) => r.sender).lastIndexOf("them");
          const enriched = rows.map((msg, index) => {
            if (msg.sender === "them") return msg;
            // If partner sent a message at or after this message, partner has definitely read it!
            const isRead = lastThemIndex >= index || index < rows.length - 1;
            return {
              ...msg,
              status: isRead ? ("read" as const) : ("delivered" as const),
            };
          });
          setMessages((current) => ({ ...current, [activePartnerId]: enriched }));
        }
      } catch (error) {
        if (active) setMessageError(error instanceof Error ? error.message : "Could not load messages.");
      }
    };
    void refresh();
    const channel = supabase
      .channel(`conversation-${activeMatchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeMatchId}` },
        () => {
          void refresh();
        }
      )
      .subscribe();
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [activeMatchId, activePartnerId, user]);

  // Mark conversation as read
  useEffect(() => {
    const matchId = selectedConversation?.matchId;
    if (matchId && user && mobileView === "chat") {
      markConversationRead(matchId).catch((error) =>
        setMessageError(error instanceof Error ? error.message : "Could not update unread status.")
      );
    }
  }, [selectedConversation?.matchId, user, mobileView]);

  const scrollToBottom = (smooth = true) => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [selectedPartnerId, mobileView]);

  useEffect(() => {
    if (activeChat.length > 0) {
      scrollToBottom(true);
    }
  }, [activeChat.length]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !user || !selectedConversation || isSending) return false;
    setIsSending(true);
    setMessageError(null);

    // Optimistic UI insert with single tick
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      createdAt: Date.now(),
      status: "sent",
    };
    setMessages((prev) => ({
      ...prev,
      [activePartnerId]: [...(prev[activePartnerId] || []), optimisticMsg],
    }));
    setInputText("");

    try {
      await sendMessage(selectedConversation.matchId, text);
      return true;
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : "Could not send message.");
      // Rollback optimistic
      setMessages((prev) => ({
        ...prev,
        [activePartnerId]: (prev[activePartnerId] || []).filter((m) => m.id !== tempId),
      }));
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const handleShareMeetingPoint = () => {
    void handleSendMessage(`📍 Shared Meeting Point: Gate 2, near Maddox Square lawn • Sharodiya 2026`).then(
      (sent) => {
        if (sent) {
          setShowLocationBanner(true);
          setTimeout(() => setShowLocationBanner(false), 3000);
        }
      }
    );
  };

  const handleReportUser = async () => {
    if (!reportReason.trim() || !activePartnerId) return;
    try {
      await recordReport(activePartnerId, reportReason.trim());
      setReportStatus("Report submitted. Thank you for keeping IshqYara safe.");
      setTimeout(() => {
        setShowReportModal(false);
        setReportStatus(null);
        setReportReason("");
      }, 1500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not submit report.");
    }
  };

  const handleBlockUser = async () => {
    if (!activePartnerId) return;
    try {
      await blockUser(activePartnerId);
      setShowBlockModal(false);
      setConversations((prev) => prev.filter((c) => c.otherUid !== activePartnerId));
      setMobileView("list");
      alert("User blocked. They will no longer be able to message you or view your profile.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not block user.");
    }
  };

  const filteredProfiles = conversations.filter(({ profile }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      profile.name.toLowerCase().includes(q) ||
      profile.area.toLowerCase().includes(q) ||
      profile.pujaPreferences.favoritePandalZone.toLowerCase().includes(q) ||
      profile.college.toLowerCase().includes(q)
    );
  });

  if (!activePartner) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto mt-16 rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-[#9e1b22] flex items-center justify-center">
            <MessageCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-black text-stone-900">Your conversations live here</h1>
          <p className="mt-2 text-sm text-stone-500 max-w-sm mx-auto">
            Once you have a mutual match on IshqYara, you can chat, share meeting points, and plan your pandal hopping together.
          </p>
          {messageError && <p role="alert" className="mt-3 text-sm text-rose-700 font-semibold">{messageError}</p>}
        </div>
      </AppShell>
    );
  }

  const partnerPhotos =
    activePartner.photos && activePartner.photos.length > 0 ? activePartner.photos : [activePartner.image];

  return (
    <AppShell hideMobileNav={mobileView === "chat"}>
      {/* Toast Notification */}
      {showLocationBanner && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-700 animate-in slide-in-from-top-2 duration-200">
          <Navigation className="w-4 h-4 text-emerald-300" />
          <span className="text-xs font-semibold">Pandal meeting point shared! 📍</span>
        </div>
      )}

      <div
        className={`bg-white ${
          mobileView === "chat"
            ? "h-dvh md:h-[calc(100vh-130px)] rounded-none md:rounded-3xl border-0 md:border"
            : "h-[calc(100dvh-5.5rem)] md:h-[calc(100vh-130px)] rounded-2xl md:rounded-3xl border"
        } border-[#e7dfd5] overflow-hidden shadow-xs flex flex-col lg:flex-row relative`}
      >
        {/* ============================================================ */}
        {/* LEFT PANEL: Conversation List */}
        {/* ============================================================ */}
        <div
          className={`${
            mobileView === "list" ? "flex" : "hidden"
          } lg:flex w-full lg:w-80 xl:w-96 border-r border-stone-200 flex-col bg-[#faf7f2]/50 h-full shrink-0`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-stone-200 bg-white/80 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
                  <span>Messages</span>
                  <span className="text-base">💬</span>
                </h2>
                <p className="text-[11px] text-stone-500 font-medium">
                  {conversations.length} mutual connections
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#9e1b22] bg-[#fbebee] px-2.5 py-1 rounded-full border border-red-200">
                Be Respectful
              </span>
            </div>

            {/* Conversation Search Bar */}
            <div className="mt-3 relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search matches or colleges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/20 focus:border-[#9e1b22]"
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 overscroll-contain">
            {filteredProfiles.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                No matching connections found for &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredProfiles.map((conversation) => {
                const profile = conversation.profile;
                const isSelected = conversation.otherUid === activePartnerId;
                const chatHistory = messages[conversation.otherUid] || [];
                const lastMsg =
                  chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;

                return (
                  <button
                    key={conversation.matchId}
                    type="button"
                    onClick={() => {
                      setSelectedPartnerId(conversation.otherUid);
                      setMobileView("chat");
                      window.history.replaceState(null, "", `/messages?matchId=${conversation.matchId}`);
                    }}
                    className={`w-full p-3.5 sm:p-4 flex items-center gap-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white shadow-xs border-l-4 border-l-[#9e1b22]"
                        : "hover:bg-white/80 active:bg-stone-100"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={profile.image}
                        alt={profile.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#9e1b22]/20"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-sm font-bold text-stone-900 truncate">
                            {profile.name}
                          </h4>
                          {profile.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500/20 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 font-medium shrink-0 ml-1">
                          {lastMsg ? lastMsg.time : "New"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="text-xs text-stone-500 truncate">
                          {lastMsg ? lastMsg.text : profile.bio || "Say hi to your match! 🪷"}
                        </p>
                        {lastMsg && lastMsg.sender === "me" && (
                          <span className="shrink-0">
                            <MessageStatusTicks status={lastMsg.status || "read"} />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-bold text-[#9e1b22] bg-[#fbebee] px-1.5 py-0.2 rounded-md">
                          {profile.compatibility}% Match
                        </span>
                        <span className="text-[10px] text-stone-500 truncate">
                          📍 {profile.area || profile.pujaPreferences.favoritePandalZone.split(" ")[0]}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT PANEL: Active Chat Room */}
        {/* ============================================================ */}
        <div
          className={`${
            mobileView === "chat" ? "flex" : "hidden"
          } lg:flex flex-1 flex-col bg-white h-full relative min-w-0`}
        >
          {/* Active Chat Header */}
          <div className="p-2.5 sm:p-3.5 border-b border-stone-200 flex items-center justify-between bg-white z-10 shadow-xs shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              {/* Back button for mobile */}
              <button
                type="button"
                onClick={() => {
                  setMobileView("list");
                  window.history.replaceState(null, "", "/messages");
                }}
                className="lg:hidden p-2 -ml-1 text-stone-700 hover:text-[#9e1b22] hover:bg-stone-100 rounded-xl flex items-center gap-0.5 transition-colors active:scale-95 cursor-pointer"
                title="Back to all conversations"
              >
                <ChevronLeft className="w-5 h-5 text-[#9e1b22]" />
                <span className="text-xs font-bold text-stone-800">Chats</span>
              </button>

              {/* Partner Avatar & Info */}
              <div
                onClick={() => setShowPartnerProfile(true)}
                className="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer group/partner p-1 rounded-xl hover:bg-stone-50 transition-colors"
                title="Click to view partner profile"
              >
                <div className="relative shrink-0">
                  <img
                    src={activePartner.image}
                    alt={activePartner.name}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover ring-2 ring-[#9e1b22]/20 group-hover/partner:ring-[#9e1b22]/50 transition-all"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base truncate group-hover/partner:text-[#9e1b22] transition-colors">
                      {activePartner.name}, {activePartner.age}
                    </h3>
                    {activePartner.verified && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-sky-500 fill-sky-500/20" />
                        <span className="hidden sm:inline">Verified</span>
                      </span>
                    )}
                    <span className="hidden sm:inline-flex text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full shrink-0">
                      {activePartner.intention}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 truncate">
                    <span className="text-stone-500 font-medium">{activePartner.college}</span>
                    <span>•</span>
                    <span className="truncate">{activePartner.area}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative">
              <button
                type="button"
                onClick={handleShareMeetingPoint}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-stone-700 hover:bg-amber-50 hover:text-amber-900 border border-stone-200 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Share Meeting Point at Pandal"
              >
                <MapPin className="w-4 h-4 text-[#ea580c]" />
                <span className="hidden sm:inline">Meet Point</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPartnerProfile(true)}
                className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                title="View partner details"
              >
                <Info className="w-4 h-4 text-stone-600" />
              </button>

              {/* 3-dots Menu for Safety (Report & Block) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                  title="More options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showOptionsMenu && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-stone-200 p-1.5 z-50 animate-in fade-in-50">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowReportModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-stone-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>Report User</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowBlockModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Ban className="w-4 h-4 text-rose-600" />
                      <span>Block User</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div
            ref={chatScrollContainerRef}
            className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 bg-[#faf7f2]/30 overscroll-contain"
          >
            {/* Context Banner */}
            <div className="text-center my-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-2xs">
                <span>🪷</span>
                <span>
                  Matched for {activePartner.pujaPreferences.favoritePandalZone} • Sharodiya 2026
                </span>
              </span>
            </div>

            {/* Messages List */}
            {activeChat.map((msg) => {
              const isMe = msg.sender === "me";
              const isLocationMsg = msg.text.startsWith("📍 Shared Meeting Point:");

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in-50 duration-150`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-md rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm shadow-xs ${
                      isLocationMsg
                        ? "bg-amber-100/90 text-amber-950 border border-amber-300 font-medium rounded-br-xs"
                        : isMe
                        ? "bg-gradient-to-r from-[#9e1b22] to-[#c22830] text-white rounded-br-xs"
                        : "bg-white text-stone-800 border border-stone-200/90 rounded-bl-xs"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`text-[10px] mt-1.5 flex items-center justify-end gap-1.5 ${
                        isMe
                          ? isLocationMsg
                            ? "text-amber-800"
                            : "text-white/80"
                          : "text-stone-400"
                      }`}
                    >
                      <span>{msg.time}</span>
                      {/* Double Ticks / Blue double ticks for sender */}
                      {isMe && !isLocationMsg && (
                        <MessageStatusTicks status={msg.status || "read"} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Icebreakers Bar */}
          <div className="px-3 sm:px-4 py-2 bg-stone-50 border-t border-stone-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Ask:</span>
            </span>
            {ICEBREAKER_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(suggestion)}
                className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-amber-300 transition-colors shadow-2xs active:scale-95 cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Quick Emojis Bar */}
          <div className="px-3 sm:px-4 py-1.5 bg-white border-t border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-stone-400 shrink-0">React:</span>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSendMessage(emoji)}
                className="text-sm hover:scale-125 transition-transform cursor-pointer px-1 py-0.5 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          {messageError && (
            <p role="alert" className="px-4 py-2 text-xs text-rose-700 bg-rose-50 border-t border-rose-100 font-semibold">
              {messageError}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 sm:p-3.5 border-t border-stone-200 flex items-center gap-2 bg-white sticky bottom-0 shrink-0 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
          >
            <input
              type="text"
              placeholder={`Message ${activePartner.name.split(" ")[0]} about Puja plans...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-[#faf7f2] rounded-2xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/30 focus:border-[#9e1b22]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#9e1b22] to-[#c22830] hover:from-[#88171d] hover:to-[#ac2128] disabled:opacity-40 text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer font-bold text-xs"
              title="Send message"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* QUICK IN-CHAT PARTNER PROFILE MODAL */}
      {showPartnerProfile && (
        <div
          onClick={() => setShowPartnerProfile(false)}
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-md max-h-[90dvh] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)]"
          >
            <div className="sm:hidden w-full flex justify-center pt-2 pb-1 bg-stone-900 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-white/40" />
            </div>

            <button
              onClick={() => setShowPartnerProfile(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo View */}
            <div className="relative aspect-[4/5] w-full shrink-0 bg-stone-950 overflow-hidden">
              <img
                src={partnerPhotos[profilePhotoIndex] || activePartner.image}
                alt={activePartner.name}
                className="w-full h-full object-cover"
              />
              {partnerPhotos.length > 1 && (
                <div className="absolute top-3 inset-x-3 flex gap-1 z-10">
                  {partnerPhotos.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setProfilePhotoIndex(i)}
                      className={`h-1 flex-1 rounded-full cursor-pointer transition-colors ${
                        i === profilePhotoIndex ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xl font-black text-stone-900">
                      {activePartner.name}, {activePartner.age}
                    </h3>
                    {activePartner.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500/20" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9e1b22] font-bold mt-0.5">{activePartner.college}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-50 text-[#9e1b22] text-xs font-bold border border-red-200">
                  {activePartner.intention}
                </span>
              </div>

              {activePartner.bio && (
                <p className="text-xs text-stone-700 bg-[#faf7f2] p-3 rounded-2xl border border-stone-200 leading-relaxed italic">
                  &ldquo;{activePartner.bio}&rdquo;
                </p>
              )}

              {/* Prompts */}
              {activePartner.prompts && activePartner.prompts.length > 0 && (
                <div className="space-y-2">
                  {activePartner.prompts.map((p, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                      <div className="text-[10px] font-bold text-[#9e1b22] uppercase tracking-wider">
                        {p.question}
                      </div>
                      <div className="text-xs font-medium text-stone-800">
                        {p.answer}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REPORT USER MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-stone-200 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-stone-900">Report {activePartner.name}</h3>
            <p className="text-xs text-stone-600">
              Your report is completely confidential and helps keep IshqYara safe.
            </p>

            {reportStatus ? (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {reportStatus}
              </div>
            ) : (
              <>
                <div className="space-y-1.5 text-left">
                  {[
                    "Harassment or offensive behavior",
                    "Fake profile or impersonation",
                    "Inappropriate photos or content",
                    "Spam or commercial advertising",
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setReportReason(reason)}
                      className={`w-full p-2.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                        reportReason === reason
                          ? "bg-[#9e1b22] text-white border-[#9e1b22]"
                          : "bg-[#faf7f2] text-stone-700 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!reportReason}
                    onClick={handleReportUser}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-xs font-bold text-white shadow-sm cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* BLOCK USER MODAL */}
      {showBlockModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-stone-200 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ban className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-stone-900">Block {activePartner.name}?</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              They will be unmatched immediately, won&apos;t be able to message you, and won&apos;t see your profile on IshqYara.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBlockUser}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm cursor-pointer"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<AppShell><div className="p-8 text-center text-xs text-stone-500">Loading messages...</div></AppShell>}>
      <MessagesInner />
    </Suspense>
  );
}
