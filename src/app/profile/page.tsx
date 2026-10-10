"use client";

import React, { useState } from "react";
import {
  MapPin,
  GraduationCap,
  Edit3,
  Heart,
  Flame,
  CheckCircle2,
  X,
  Shield,
  Settings,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppUser } from "@/components/AppUserContext";
import type { ProfileDraft } from "@/lib/profile-store";
import { DEFAULT_PUJA, INTENTION_OPTIONS, INTEREST_SUGGESTIONS, type Intention, type PujaPreferences } from "@/lib/schema";

export default function ProfilePage() {
  const { uiProfile: profileData, publicProfile, privateDob, saveProfile, matchCount } = useAppUser();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [editArea, setEditArea] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editIntention, setEditIntention] = useState<Intention>("Friendship");
  const [editLookingFor, setEditLookingFor] = useState<Intention[]>([]);
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editPujaPreferences, setEditPujaPreferences] = useState<PujaPreferences>(DEFAULT_PUJA);
  const [editPrompt1, setEditPrompt1] = useState("");
  const [editPrompt2, setEditPrompt2] = useState("");
  const [editPrompt3, setEditPrompt3] = useState("");

  const openEditor = () => {
    if (!profileData || !publicProfile) return;
    setEditName(profileData.name);
    setEditTagline(publicProfile.tagline || "");
    setEditCollege(profileData.college);
    setEditArea(profileData.area);
    setEditBio(profileData.bio);
    setEditIntention(publicProfile.intention);
    setEditLookingFor(publicProfile.lookingFor || []);
    setEditInterests(publicProfile.interests || []);
    setEditPujaPreferences(publicProfile.pujaPreferences || DEFAULT_PUJA);
    setEditPrompt1(profileData.prompts[0]?.answer || "");
    setEditPrompt2(profileData.prompts[1]?.answer || "");
    setEditPrompt3(profileData.prompts[2]?.answer || "");
    setSaveError(null);
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicProfile || !privateDob) { setSaveError("Your private profile details are not available. Please refresh and try again."); return; }
    if (!editLookingFor.length) { setSaveError("Choose at least one connection preference."); return; }
    setIsSaving(true);
    setSaveError(null);
    const draft: ProfileDraft = {
      displayName: editName,
      dateOfBirth: privateDob,
      college: editCollege,
      area: editArea,
      bio: editBio,
      tagline: editTagline,
      intention: editIntention,
      lookingFor: editLookingFor,
      interests: editInterests,
      photoURLs: publicProfile.photoURLs,
      pujaPreferences: editPujaPreferences,
      prompts: [
        { question: "My quintessential Durga Puja ritual is...", answer: editPrompt1 },
        { question: "Best pandal bhog in town...", answer: editPrompt2 },
        { question: "Pujor gaan on loop...", answer: editPrompt3 },
      ],
    };
    try {
      await saveProfile(draft);
      setSaveSuccess(true);
      setTimeout(() => { setSaveSuccess(false); setEditModalOpen(false); }, 1200);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your profile.");
    } finally { setIsSaving(false); }
  };

  if (!profileData || !publicProfile) return <AppShell><div className="p-10 text-center text-sm text-stone-500">Loading your profile…</div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-[#e7dfd5] bg-white shadow-sm">
          {/* Cover Festive Gradient */}
          <div className="h-36 sm:h-48 bg-gradient-to-r from-[#9e1b22] via-[#ea580c] to-[#d97706] relative">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("open-settings", { detail: { tab: "userInfo" } })
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Account Settings"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/30 hidden sm:inline-block">
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
                  src={profileData.image}
                  alt={profileData.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-lg ring-2 ring-[#9e1b22]/30"
                />
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white">
                  ✓
                </span>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={openEditor}
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
                &ldquo;{publicProfile.tagline}&rdquo;
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
                <span className={`flex items-center gap-1 font-semibold ${publicProfile.collegeVerified ? "text-emerald-700" : "text-stone-500"}`}>
                  <Shield className={`w-3.5 h-3.5 ${publicProfile.collegeVerified ? "text-emerald-600" : "text-stone-400"}`} />
                  {publicProfile.collegeVerified ? "College verified" : "Signed in with Google"}
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
                    {matchCount}
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
                {publicProfile.lookingFor.map((intent) => (
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
                    &ldquo;{prompt.answer}&rdquo;
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

                {saveError && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{saveError}</p>}

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

                  <div className="space-y-3 border-t border-stone-100 pt-3">
                    <div>
                      <label htmlFor="edit-intention" className="block font-bold text-stone-700 mb-1">My connection intention</label>
                      <select id="edit-intention" value={editIntention} onChange={(event) => setEditIntention(event.target.value as Intention)} className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3 py-2 text-stone-900">
                        {INTENTION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>
                    <fieldset>
                      <legend className="mb-2 font-bold text-stone-700">I&apos;m looking for</legend>
                      <div className="flex flex-wrap gap-2">
                        {INTENTION_OPTIONS.map((option) => {
                          const selected = editLookingFor.includes(option);
                          return <button key={option} type="button" aria-pressed={selected} onClick={() => setEditLookingFor((current) => selected ? current.filter((item) => item !== option) : [...current, option])} className={`rounded-full border px-3 py-1.5 font-semibold ${selected ? "border-[#9e1b22] bg-red-50 text-[#9e1b22]" : "border-stone-300 bg-white text-stone-600"}`}>{option}</button>;
                        })}
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend className="mb-2 font-bold text-stone-700">Interests</legend>
                      <div className="flex flex-wrap gap-2">
                        {INTEREST_SUGGESTIONS.map((interest) => {
                          const selected = editInterests.includes(interest);
                          return <button key={interest} type="button" aria-pressed={selected} onClick={() => setEditInterests((current) => selected ? current.filter((item) => item !== interest) : current.length < 12 ? [...current, interest] : current)} className={`rounded-full border px-3 py-1.5 font-semibold ${selected ? "border-amber-400 bg-amber-50 text-amber-900" : "border-stone-300 bg-white text-stone-600"}`}>{interest}</button>;
                        })}
                      </div>
                    </fieldset>
                    <fieldset className="space-y-2">
                      <legend className="font-bold text-stone-700">Puja preferences</legend>
                      {([
                        ["crowdComfort", "Crowd comfort", ["Loved Midnight Rush", "Quiet Afternoon Adda", "Balanced Explorer"]],
                        ["favoritePandalZone", "Favorite pandal zone", ["North Kolkata Heritage", "South Kolkata Theme", "Salt Lake & New Town", "Suburban Megastars"]],
                        ["foodPriority", "Food priority", ["Puchka & Rolls First", "Moghlai & Biryani Feast", "Bhog & Sweet Craver"]],
                        ["timing", "Puja timing", ["All-Nighter (11 PM - 6 AM)", "Sunset to Midnight (5 PM - 12 AM)", "Early Bird"]],
                      ] as const).map(([key, label, options]) => (
                        <label key={key} className="block font-semibold text-stone-600">{label}
                          <select value={editPujaPreferences[key]} onChange={(event) => setEditPujaPreferences((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3 py-2 text-stone-900">
                            {options.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                      ))}
                    </fieldset>
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
                    disabled={isSaving}
                    className="px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#9e1b22] to-[#c22830]"
                  >
                    {isSaving ? "Saving…" : "Save Changes 🪷"}
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
