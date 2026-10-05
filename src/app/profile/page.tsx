"use client";

import React, { useState } from "react";
import {
  User,
  MapPin,
  GraduationCap,
  Sparkles,
  Edit3,
  Heart,
  Camera,
  Flame,
  Clock,
  Utensils,
  CheckCircle2,
  X,
  Check,
  Shield,
  Settings,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { USER_CURRENT_PROFILE } from "@/lib/data";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(USER_CURRENT_PROFILE);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(profileData.name);
  const [editTagline, setEditTagline] = useState(profileData.tagline);
  const [editCollege, setEditCollege] = useState(profileData.college);
  const [editArea, setEditArea] = useState(profileData.area);
  const [editBio, setEditBio] = useState(profileData.bio);
  const [editPrompt1, setEditPrompt1] = useState(profileData.prompts[0]?.answer || "");
  const [editPrompt2, setEditPrompt2] = useState(profileData.prompts[1]?.answer || "");
  const [editPrompt3, setEditPrompt3] = useState(profileData.prompts[2]?.answer || "");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData({
      ...profileData,
      name: editName,
      tagline: editTagline,
      college: editCollege,
      area: editArea,
      bio: editBio,
      prompts: [
        {
          question: "My quintessential Durga Puja ritual is...",
          answer: editPrompt1,
        },
        {
          question: "Best pandal bhog in town...",
          answer: editPrompt2,
        },
        {
          question: "Pujor gaan on loop...",
          answer: editPrompt3,
        },
      ],
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setEditModalOpen(false);
    }, 1200);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-[#e7dfd5] bg-white shadow-sm">
          {/* Cover Festive Gradient */}
          <div className="h-36 sm:h-48 bg-gradient-to-r from-[#9e1b22] via-[#ea580c] to-[#d97706] relative">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/30">
                শারদীয়া 2026 Profile
              </span>
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="px-4 sm:px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-lg ring-2 ring-[#9e1b22]/30"
                />
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white">
                  ✓
                </span>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => setEditModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#9e1b22] to-[#b8232b] shadow-sm hover:shadow-md hover:shadow-[#9e1b22]/20 transition-all self-start sm:self-auto active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Core Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  {profileData.name}, {profileData.age}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-amber-500 fill-amber-500/20" />
              </div>

              <p className="text-xs sm:text-sm font-semibold text-[#9e1b22]">
                "{profileData.tagline}"
              </p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-600 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {profileData.area}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-stone-500" />
                  {profileData.college}
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Google Verified Student
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-stone-100">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#faf7f2] border border-[#e7dfd5]">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-[#9e1b22]">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-[#9e1b22] leading-tight">
                    {profileData.stats.matches}
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium">Matches</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Connection Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Bio & Connection Types */}
          <div className="md:col-span-7 space-y-6">
            {/* Bio Card */}
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                About Me
              </h3>
              <p className="text-stone-700 text-sm leading-relaxed">
                {profileData.bio}
              </p>
            </div>

            {/* Connection Preferences */}
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                Connection Preferences
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileData.lookingFor.map((intent) => (
                  <span
                    key={intent}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a] flex items-center gap-1.5"
                  >
                    <span>🪷</span>
                    <span>{intent}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Interests & Tags */}
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                Passions & Adda Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#faf7f2] text-stone-700 border border-[#e7dfd5]"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Puja Prompts & Preferences */}
          <div className="md:col-span-5 space-y-6">
            {/* Sharodiya Rhythm card */}
            <div className="bg-gradient-to-br from-[#fff3ed] to-[#fef2f2] rounded-3xl border border-[#fbd3ca] p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#9e1b22] uppercase tracking-wider">
                <Flame className="w-4 h-4 text-[#ea580c]" />
                <span>My Puja Rhythm</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white/80 rounded-xl border border-stone-200/80">
                  <div className="text-stone-400 text-[10px] uppercase font-bold">Crowd Tolerance</div>
                  <div className="font-bold text-stone-800 mt-0.5">{profileData.pujaPreferences.crowdComfort}</div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-stone-200/80">
                  <div className="text-stone-400 text-[10px] uppercase font-bold">Favorite Pandal Zone</div>
                  <div className="font-bold text-stone-800 mt-0.5">{profileData.pujaPreferences.favoritePandalZone}</div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-stone-200/80">
                  <div className="text-stone-400 text-[10px] uppercase font-bold">Food Priority</div>
                  <div className="font-bold text-stone-800 mt-0.5">{profileData.pujaPreferences.foodPriority}</div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-stone-200/80">
                  <div className="text-stone-400 text-[10px] uppercase font-bold">Timing</div>
                  <div className="font-bold text-stone-800 mt-0.5">{profileData.pujaPreferences.timing}</div>
                </div>
              </div>
            </div>

            {/* Puja Prompts from Prompt requirements */}
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                Puja Prompts
              </h3>

              {profileData.prompts.map((prompt, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e7dfd5] space-y-1.5">
                  <div className="text-xs font-bold text-[#9e1b22]">
                    {prompt.question}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 font-medium italic">
                    "{prompt.answer}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-5 border border-stone-200 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            {saveSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-stone-900">
                  Profile Updated! 🪷
                </h3>
                <p className="text-xs text-stone-500">
                  Your updated preferences and prompts are now saved.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">
                    Edit Your Profile
                  </h2>
                  <p className="text-xs text-stone-500">
                    Keep your Puja details fresh to find the best compatible partners.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Tagline / Vibe
                    </label>
                    <input
                      type="text"
                      value={editTagline}
                      onChange={(e) => setEditTagline(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        College / University
                      </label>
                      <input
                        type="text"
                        value={editCollege}
                        onChange={(e) => setEditCollege(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Neighborhood / Area
                      </label>
                      <input
                        type="text"
                        value={editArea}
                        onChange={(e) => setEditArea(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
                    />
                  </div>

                  {/* Prompts editing */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                      Sharodiya Prompts
                    </span>

                    <div>
                      <label className="block text-stone-600 font-semibold mb-1">
                        1. My quintessential Durga Puja ritual is...
                      </label>
                      <input
                        type="text"
                        value={editPrompt1}
                        onChange={(e) => setEditPrompt1(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-600 font-semibold mb-1">
                        2. Best pandal bhog in town...
                      </label>
                      <input
                        type="text"
                        value={editPrompt2}
                        onChange={(e) => setEditPrompt2(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-600 font-semibold mb-1">
                        3. Pujor gaan on loop...
                      </label>
                      <input
                        type="text"
                        value={editPrompt3}
                        onChange={(e) => setEditPrompt3(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#9e1b22] to-[#c22830]"
                  >
                    Save Changes 🪷
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
