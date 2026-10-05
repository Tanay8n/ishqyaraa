"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  MessageCircle,
  MapPin,
  Sparkles,
  CheckCheck,
  ChevronLeft,
  Search,
  Flame,
  Navigation,
  Info,
  X,
  GraduationCap,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { INITIAL_PROFILES, type Profile } from "@/lib/data";

interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
  "riya-20": [
    {
      id: "m1",
      sender: "them",
      text: "Hey Tanay! 🪷 So excited for Sharodiya! Are we still on for the Saptami night circuit around Maddox?",
      time: "6:15 PM",
    },
    {
      id: "m2",
      sender: "me",
      text: "100%! Planning to hit Ekdalia first at 6:30, then Singhi Park, and finish with rolls and lawn adda at Maddox.",
      time: "6:20 PM",
    },
    {
      id: "m3",
      sender: "them",
      text: "Perfect! I'll bring my vintage Fuji film camera to capture the dhunuchi dance lighting! 📸",
      time: "6:22 PM",
    },
  ],
  "sourav-22": [
    {
      id: "s1",
      sender: "them",
      text: "Bro, found a quiet bonedi bari in North Kolkata for Ashtami morning anjali. Zero queue at all!",
      time: "Yesterday",
    },
    {
      id: "s2",
      sender: "me",
      text: "That's clutch. Let's do that and then hit Sovabazar Rajbari.",
      time: "Yesterday",
    },
  ],
  "ananya-21": [
    {
      id: "a1",
      sender: "them",
      text: "Hey! Saw you love Tridhara & Chetla Agrani. Are you planning late night pandal hopping on Sasthi? 🪷",
      time: "2 days ago",
    },
  ],
  "debojyoti-23": [
    {
      id: "d1",
      sender: "them",
      text: "Dhunuchi dance battle at Bagbazar on Nabami! You down to come watch with me?",
      time: "3 days ago",
    },
  ],
  "sneha-20": [
    {
      id: "sn1",
      sender: "them",
      text: "Hey Tanay! What's your favorite bhog spot in South Kolkata?",
      time: "Oct 2",
    },
  ],
  "ishaan-21": [
    {
      id: "i1",
      sender: "them",
      text: "Suruchi Sangha's installation theme is unreal this year. We should coordinate a group visit!",
      time: "Oct 1",
    },
  ],
};

const ICEBREAKER_SUGGESTIONS = [
  "🪷 Up for Saptami Maddox Square adda?",
  "📍 What's your route for Ashtami?",
  "🍲 College Street anjali + bhog after?",
  "📸 Let's do dhunuchi dance photos!",
];

function MessagesInner() {
  const searchParams = useSearchParams();
  const partnerParam = searchParams.get("partner");

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    partnerParam && INITIAL_PROFILES.some((p) => p.id === partnerParam)
      ? partnerParam
      : "riya-20"
  );

  // Responsive mobile view state: 'list' (conversation overview) or 'chat' (active room)
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    partnerParam ? "chat" : "list"
  );

  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(DEFAULT_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [showLocationBanner, setShowLocationBanner] = useState(false);
  const [showPartnerProfile, setShowPartnerProfile] = useState(false);
  const [profilePhotoIndex, setProfilePhotoIndex] = useState(0);

  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync when search parameter changes (e.g. user clicked "Chat Now" on Matches)
  useEffect(() => {
    if (partnerParam && INITIAL_PROFILES.some((p) => p.id === partnerParam)) {
      setSelectedPartnerId(partnerParam);
      setMobileView("chat");
    }
  }, [partnerParam]);

  const activePartner =
    INITIAL_PROFILES.find((p) => p.id === selectedPartnerId) || INITIAL_PROFILES[0];
  const activeChat = messages[selectedPartnerId] || [];

  // Direct container scroll to avoid whole-window scrolling jumps on mobile
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

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "me",
      text: text,
      time: "Just now",
    };

    setMessages((prev) => ({
      ...prev,
      [selectedPartnerId]: [...(prev[selectedPartnerId] || []), newMessage],
    }));

    setInputText("");
    setIsTyping(true);

    // Realistic automated response simulation based on Kolkata Puja context
    setTimeout(() => {
      setIsTyping(false);
      const contextualReplies = [
        `Sounds fantastic! Let’s meet near the main gate around ${activePartner.pujaPreferences.timing.toLowerCase()}! 🪷`,
        `Count me in! Also we have to grab rolls near ${activePartner.area}! 🍲`,
        `Yay! Can't wait for ${activePartner.pujaPreferences.favoritePandalZone} circuit with you! ✨`,
        `Done! I’ll ping you on WhatsApp once I reach the pandal entrance gate! 📍`,
      ];
      const randomReply =
        contextualReplies[Math.floor(Math.random() * contextualReplies.length)];

      const replyMessage: ChatMessage = {
        id: `r-${Date.now()}`,
        sender: "them",
        text: randomReply,
        time: "Just now",
      };

      setMessages((prev) => ({
        ...prev,
        [selectedPartnerId]: [...(prev[selectedPartnerId] || []), replyMessage],
      }));
    }, 1200);
  };

  const handleShareMeetingPoint = () => {
    handleSendMessage(`📍 Shared Meeting Point: Gate 2, near Maddox Square lawn • Sharodiya 2026`);
    setShowLocationBanner(true);
    setTimeout(() => setShowLocationBanner(false), 3000);
  };

  // Filter conversations
  const filteredProfiles = INITIAL_PROFILES.filter((profile) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      profile.name.toLowerCase().includes(q) ||
      profile.area.toLowerCase().includes(q) ||
      profile.pujaPreferences.favoritePandalZone.toLowerCase().includes(q) ||
      profile.college.toLowerCase().includes(q)
    );
  });

  const partnerPhotos = activePartner.photos && activePartner.photos.length > 0
    ? activePartner.photos
    : [activePartner.image];

  return (
    <AppShell hideMobileNav={mobileView === "chat"}>
      {/* Location Share Notification Toast */}
      {showLocationBanner && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-700 animate-in slide-in-from-top-2 duration-200">
          <Navigation className="w-4 h-4 text-emerald-300" />
          <span className="text-xs font-semibold">Pandal meeting point shared! 📍</span>
        </div>
      )}

      {/* Main Chat Outer Container: Full bleed on mobile active chat, responsive bordered container on desktop/list */}
      <div
        className={`bg-white ${
          mobileView === "chat"
            ? "h-full md:h-[calc(100vh-130px)] rounded-none md:rounded-3xl border-0 md:border"
            : "h-[calc(100dvh-5.5rem)] md:h-[calc(100vh-130px)] rounded-2xl md:rounded-3xl border"
        } border-[#e7dfd5] overflow-hidden shadow-xs flex flex-col lg:flex-row relative`}
      >
        {/* ============================================================ */}
        {/* LEFT PANEL: Conversation List (Visible on desktop lg: OR mobile 'list' view) */}
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
                  {INITIAL_PROFILES.length} pandal companion connections
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#9e1b22] bg-[#fbebee] px-2.5 py-1 rounded-full border border-red-200">
                শারদীয়া Live
              </span>
            </div>

            {/* Conversation Search Bar */}
            <div className="mt-3 relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search matches or pandal zones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-200 text-base sm:text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/20 focus:border-[#9e1b22]"
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
              filteredProfiles.map((profile) => {
                const isSelected = profile.id === selectedPartnerId;
                const chatHistory = messages[profile.id] || [];
                const lastMsg =
                  chatHistory.length > 0
                    ? chatHistory[chatHistory.length - 1]
                    : null;
                const isRiya = profile.id === "riya-20";

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      setSelectedPartnerId(profile.id);
                      setMobileView("chat");
                      window.history.replaceState(null, "", `/messages?partner=${profile.id}`);
                    }}
                    className={`w-full p-3.5 sm:p-4 flex items-center gap-3 text-left transition-all ${
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
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {profile.name}
                        </h4>
                        <span className="text-[10px] text-stone-400 font-medium shrink-0 ml-1">
                          {lastMsg ? lastMsg.time : isRiya ? "6:22 PM" : "Yesterday"}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 truncate mt-0.5">
                        {lastMsg ? lastMsg.text : profile.bio}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-bold text-[#9e1b22] bg-[#fbebee] px-1.5 py-0.2 rounded-md">
                          {profile.compatibility}% Match
                        </span>
                        <span className="text-[10px] text-stone-500 truncate">
                          🪷 {profile.pujaPreferences.favoritePandalZone.split(" ")[0]}
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
        {/* RIGHT PANEL: Active Chat Window (Visible on desktop lg: OR mobile 'chat' view) */}
        {/* ============================================================ */}
        <div
          className={`${
            mobileView === "chat" ? "flex" : "hidden"
          } lg:flex flex-1 flex-col bg-white h-full relative min-w-0`}
        >
          {/* Active Chat Header with responsive controls */}
          <div className="p-2.5 sm:p-3.5 border-b border-stone-200 flex items-center justify-between bg-white z-10 shadow-xs shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              {/* Back Button: switches back to list view on mobile/tablet */}
              <button
                type="button"
                onClick={() => {
                  setMobileView("list");
                  window.history.replaceState(null, "", "/messages");
                }}
                className="lg:hidden p-2 -ml-1 text-stone-700 hover:text-[#9e1b22] hover:bg-stone-100 rounded-xl flex items-center gap-0.5 transition-colors active:scale-95 touch-manipulation"
                title="Back to all conversations"
                aria-label="Back to conversations"
              >
                <ChevronLeft className="w-5 h-5 text-[#9e1b22]" />
                <span className="text-xs font-bold text-stone-800">Chats</span>
              </button>

              {/* Clickable Profile Info Header trigger */}
              <div
                onClick={() => setShowPartnerProfile(true)}
                className="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer group/partner p-1 rounded-xl hover:bg-stone-50 transition-colors"
                title="Click to view full partner profile & puja details"
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
                    <span className="hidden sm:inline-flex text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full shrink-0">
                      {activePartner.intention}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 truncate">
                    <span className="text-emerald-600 font-medium">● Online</span>
                    <span>•</span>
                    <span className="truncate">{activePartner.area}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Partner Profile Details Button */}
              <button
                type="button"
                onClick={() => setShowPartnerProfile(true)}
                className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="View partner details & pandal preferences"
                aria-label="View profile info"
              >
                <Info className="w-4 h-4 text-stone-600" />
              </button>

              <button
                type="button"
                onClick={handleShareMeetingPoint}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-stone-700 hover:bg-amber-50 hover:text-amber-900 border border-transparent hover:border-amber-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Share Meeting Point at Pandal"
              >
                <MapPin className="w-4 h-4 text-[#ea580c]" />
                <span className="hidden sm:inline">Meet at Gate</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-xl border border-amber-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{activePartner.compatibility}%</span>
              </div>
            </div>
          </div>

          {/* Chat Messages Scroll Container */}
          <div
            ref={chatScrollContainerRef}
            className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3.5 bg-[#faf7f2]/30 overscroll-contain"
          >
            {/* Festive Context Banner */}
            <div className="text-center my-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 bg-white px-3.5 py-1 rounded-full border border-stone-200/80 shadow-2xs">
                <span>🪷</span>
                <span>
                  Matched for {activePartner.pujaPreferences.favoritePandalZone} • Sharodiya 2026
                </span>
              </span>
            </div>

            {activeChat.map((msg) => {
              const isMe = msg.sender === "me";
              const isLocationMsg = msg.text.startsWith("📍 Shared Meeting Point:");

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in-50 duration-150`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-md rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm shadow-2xs ${
                      isLocationMsg
                        ? "bg-amber-100/90 text-amber-950 border border-amber-300 font-medium rounded-br-xs"
                        : isMe
                        ? "bg-[#9e1b22] text-white rounded-br-xs"
                        : "bg-white text-stone-800 border border-stone-200 rounded-bl-xs"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${
                        isMe
                          ? isLocationMsg
                            ? "text-amber-800"
                            : "text-white/70"
                          : "text-stone-400"
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-white/80" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Partner Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start items-center gap-2">
                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-xs px-3.5 py-2.5 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 bg-[#9e1b22] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#9e1b22] rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#9e1b22] rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Icebreaker suggestions */}
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
                className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 text-stone-700 hover:text-stone-900 border border-stone-200/90 hover:border-amber-300 transition-colors shadow-2xs active:scale-95 touch-manipulation"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Chat Input Bar with 16px mobile font to prevent iOS zoom */}
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
              className="flex-1 px-3.5 py-2.5 bg-[#faf7f2] rounded-2xl border border-stone-200 text-base sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/30 focus:border-[#9e1b22]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#9e1b22] to-[#c22830] hover:from-[#83161c] hover:to-[#9e1b22] disabled:opacity-40 text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5 shrink-0 touch-manipulation"
              title="Send message"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold">Send</span>
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
            {/* Visual handle for mobile */}
            <div className="sm:hidden w-full flex justify-center pt-2 pb-1 bg-stone-900 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-white/40" />
            </div>

            {/* Header Photo */}
            <div className="relative aspect-[16/10] w-full bg-stone-900 shrink-0">
              <img
                src={partnerPhotos[profilePhotoIndex] || activePartner.image}
                alt={activePartner.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setShowPartnerProfile(false)}
                className="absolute top-4 right-4 w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 shadow-md"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {partnerPhotos.length > 1 && (
                <div className="absolute bottom-3 left-4 right-4 flex gap-1 z-10">
                  {partnerPhotos.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfilePhotoIndex(idx)}
                      className={`h-1.5 rounded-full flex-1 transition-all ${
                        idx === profilePhotoIndex ? "bg-white shadow-xs" : "bg-white/40"
                      }`}
                      aria-label={`Photo ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Scrollable details */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-stone-900 overscroll-contain">
              <div className="border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black">
                    {activePartner.name}, {activePartner.age}
                  </h2>
                  {activePartner.verified && (
                    <CheckCircle2 className="w-5 h-5 text-sky-500 fill-sky-500/20" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mt-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#ea580c]" />
                    {activePartner.area}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <GraduationCap className="w-3.5 h-3.5 text-stone-500" />
                    {activePartner.college}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-[#9e1b22] font-bold border border-red-200">
                    {activePartner.intention}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Bio
                </h4>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic bg-[#faf7f2] p-3 rounded-xl border border-[#e7dfd5]">
                  &ldquo;{activePartner.bio}&rdquo;
                </p>
              </div>

              {/* Puja Preferences */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span>Pandal Hop Plan</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white/90 rounded-xl border border-amber-200/60">
                    <div className="text-stone-400 text-[9px] uppercase font-bold">Zone</div>
                    <div className="font-bold text-stone-800 text-[11px] mt-0.5">{activePartner.pujaPreferences.favoritePandalZone}</div>
                  </div>
                  <div className="p-2 bg-white/90 rounded-xl border border-amber-200/60">
                    <div className="text-stone-400 text-[9px] uppercase font-bold">Timing</div>
                    <div className="font-bold text-stone-800 text-[11px] mt-0.5">{activePartner.pujaPreferences.timing}</div>
                  </div>
                  <div className="p-2 bg-white/90 rounded-xl border border-amber-200/60">
                    <div className="text-stone-400 text-[9px] uppercase font-bold">Food Priority</div>
                    <div className="font-bold text-stone-800 text-[11px] mt-0.5">{activePartner.pujaPreferences.foodPriority}</div>
                  </div>
                  <div className="p-2 bg-white/90 rounded-xl border border-amber-200/60">
                    <div className="text-stone-400 text-[9px] uppercase font-bold">Crowd Tolerance</div>
                    <div className="font-bold text-stone-800 text-[11px] mt-0.5">{activePartner.pujaPreferences.crowdComfort}</div>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Interests
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activePartner.interests.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#faf7f2] text-stone-700 border border-[#e7dfd5]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowPartnerProfile(false)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#9e1b22] text-white shadow-sm hover:bg-[#83161c] transition-colors"
                >
                  Continue Chatting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex items-center justify-center h-[50vh]">
            <div className="flex items-center gap-2 text-stone-500 text-sm">
              <span className="w-2 h-2 rounded-full bg-[#9e1b22] animate-ping" />
              <span>Loading messages...</span>
            </div>
          </div>
        </AppShell>
      }
    >
      <MessagesInner />
    </Suspense>
  );
}
