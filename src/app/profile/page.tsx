"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Camera,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Navigation,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppUser } from "@/components/AppUserContext";
import { resolvePhotoURLs, uploadProfilePhoto } from "@/lib/photos";
import type { ProfileDraft } from "@/lib/profile-store";
import {
  DEFAULT_PUJA,
  GENDER_OPTIONS,
  INTERESTED_IN_OPTIONS,
  INTENTION_OPTIONS,
  INTEREST_SUGGESTIONS,
  MAX_PHOTOS,
  PROMPT_QUESTIONS,
  type Intention,
  type PujaPreferences,
} from "@/lib/schema";

import { SelfieVerificationModal } from "@/components/SelfieVerificationModal";

export default function ProfilePage() {
  const { uiProfile: profileData, publicProfile, privateDob, saveProfile, refreshProfile, matchCount, user } = useAppUser();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Avatar direct upload state
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [editArea, setEditArea] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editGender, setEditGender] = useState<string>("Man");
  const [editInterestedIn, setEditInterestedIn] = useState<string>("Women");
  const [editIntention, setEditIntention] = useState<Intention>("Friendship");
  const [editLookingFor, setEditLookingFor] = useState<Intention[]>([]);
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editPujaPreferences, setEditPujaPreferences] = useState<PujaPreferences>(DEFAULT_PUJA);
  const [editPrompt1, setEditPrompt1] = useState("");
  const [editPrompt2, setEditPrompt2] = useState("");
  const [editPrompt3, setEditPrompt3] = useState("");

  // Photos state in edit modal (up to 6)
  const [editPhotoURLs, setEditPhotoURLs] = useState<string[]>([]);
  const [editPhotoPreviews, setEditPhotoPreviews] = useState<string[]>([]);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const editSlotFileInputRef = useRef<HTMLInputElement>(null);
  const targetSlotRef = useRef<number>(0);

  // Location detection in edit modal
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [locationDetectMsg, setLocationDetectMsg] = useState<string | null>(null);

  // Resolve photo previews for modal
  useEffect(() => {
    let active = true;
    if (!editPhotoURLs.length) {
      setEditPhotoPreviews([]);
      return;
    }
    void resolvePhotoURLs(editPhotoURLs)
      .then((urls) => {
        if (active) setEditPhotoPreviews(urls);
      })
      .catch(() => {
        if (active) {
          setEditPhotoPreviews(
            editPhotoURLs.map((url) => (url.startsWith("https://") || url.startsWith("blob:") ? url : ""))
          );
        }
      });
    return () => {
      active = false;
    };
  }, [editPhotoURLs]);

  const openEditor = () => {
    if (!profileData || !publicProfile) return;
    setEditName(profileData.name);
    setEditTagline(publicProfile.tagline || "");
    setEditCollege(profileData.college);
    setEditArea(profileData.area);
    setEditBio(profileData.bio);
    const pref = publicProfile.pujaPreferences || DEFAULT_PUJA;
    setEditGender((pref as any).gender || "Man");
    setEditInterestedIn((pref as any).interestedIn || "Women");
    setEditIntention(publicProfile.intention);
    setEditLookingFor(publicProfile.lookingFor?.length ? publicProfile.lookingFor : [...INTENTION_OPTIONS]);
    setEditInterests(publicProfile.interests || []);
    setEditPujaPreferences(pref);
    setEditPrompt1(profileData.prompts[0]?.answer || publicProfile.prompts[0]?.answer || "");
    setEditPrompt2(profileData.prompts[1]?.answer || publicProfile.prompts[1]?.answer || "");
    setEditPrompt3(profileData.prompts[2]?.answer || publicProfile.prompts[2]?.answer || "");
    setEditPhotoURLs(publicProfile.photoURLs || []);
    setSaveError(null);
    setLocationDetectMsg(null);
    setEditModalOpen(true);
  };

  // Direct quick-update of avatar from main profile view
  const handleDirectAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !publicProfile || !privateDob) return;
    e.target.value = "";

    setIsUpdatingAvatar(true);
    setAvatarSuccessMsg(null);
    try {
      const newUrl = await uploadProfilePhoto(user.id, file);
      // Put new photo at index 0 (main profile picture)
      const currentList = publicProfile.photoURLs || [];
      const updatedPhotos = [newUrl, ...currentList.slice(0, MAX_PHOTOS - 1)];

      const draft: ProfileDraft = {
        displayName: publicProfile.displayName,
        dateOfBirth: privateDob,
        college: publicProfile.college,
        area: publicProfile.area,
        bio: publicProfile.bio,
        tagline: publicProfile.tagline,
        intention: publicProfile.intention,
        lookingFor: publicProfile.lookingFor,
        interests: publicProfile.interests,
        photoURLs: updatedPhotos,
        pujaPreferences: publicProfile.pujaPreferences,
        prompts: [
          { question: PROMPT_QUESTIONS[0], answer: profileData?.prompts[0]?.answer || "" },
          { question: PROMPT_QUESTIONS[1], answer: profileData?.prompts[1]?.answer || "" },
          { question: PROMPT_QUESTIONS[2], answer: profileData?.prompts[2]?.answer || "" },
        ],
      };
      await saveProfile(draft);
      setAvatarSuccessMsg("Profile picture updated!");
      setTimeout(() => setAvatarSuccessMsg(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not update profile picture");
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  // Trigger file upload for a specific slot in edit modal
  const triggerSlotPick = (slotIndex: number) => {
    targetSlotRef.current = slotIndex;
    if (editSlotFileInputRef.current) {
      editSlotFileInputRef.current.value = "";
      editSlotFileInputRef.current.click();
    }
  };

  const handleSlotPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const slotIndex = targetSlotRef.current;
    setUploadingSlot(slotIndex);

    try {
      const uploadedUrl = await uploadProfilePhoto(user.id, file);
      setEditPhotoURLs((prev) => {
        const next = [...prev];
        if (slotIndex < next.length) {
          next[slotIndex] = uploadedUrl;
        } else {
          next.push(uploadedUrl);
        }
        return next;
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not upload photo");
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleSetMainPic = (index: number) => {
    if (index === 0 || index >= editPhotoURLs.length) return;
    setEditPhotoURLs((prev) => {
      const next = [...prev];
      const [chosen] = next.splice(index, 1);
      next.unshift(chosen);
      return next;
    });
  };

  const handleRemoveSlotPhoto = (index: number) => {
    setEditPhotoURLs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovePhoto = (from: number, to: number) => {
    if (to < 0 || to >= editPhotoURLs.length) return;
    setEditPhotoURLs((prev) => {
      const next = [...prev];
      const temp = next[from];
      next[from] = next[to];
      next[to] = temp;
      return next;
    });
  };

  const toggleInterest = (interest: string) => {
    setEditInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleLookingFor = (intent: Intention) => {
    setEditLookingFor((prev) =>
      prev.includes(intent)
        ? prev.length > 1
          ? prev.filter((i) => i !== intent)
          : prev
        : [...prev, intent]
    );
  };

  const autoDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationDetectMsg("Geolocation not supported by your browser.");
      return;
    }
    setLocationDetecting(true);
    setLocationDetectMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          let placeName = "Kolkata";
          if (res.ok) {
            const data = await res.json();
            const candidate = data.locality || data.city || data.principalSubdivision;
            if (candidate) {
              placeName =
                data.city && data.locality && data.locality !== data.city
                  ? `${data.locality}, ${data.city}`
                  : candidate;
            }
          }
          setEditArea(placeName);
          setLocationDetectMsg(`Detected: ${placeName}`);
        } catch {
          setEditArea("Kolkata");
          setLocationDetectMsg("Detected: Kolkata");
        } finally {
          setLocationDetecting(false);
        }
      },
      (err) => {
        setLocationDetecting(false);
        setLocationDetectMsg(
          err.code === err.PERMISSION_DENIED
            ? "Permission denied. Please type your area manually."
            : "Could not retrieve location."
        );
      },
      { timeout: 8000 }
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicProfile || !privateDob) {
      setSaveError("Your private profile details are not available. Please refresh and try again.");
      return;
    }
    if (!editLookingFor.length) {
      setSaveError("Choose at least one connection preference.");
      return;
    }
    if (!editPhotoURLs.length) {
      setSaveError("Please keep at least one profile photo.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const draft: ProfileDraft = {
      displayName: editName.trim(),
      dateOfBirth: privateDob,
      college: editCollege.trim(),
      area: editArea.trim(),
      bio: editBio.trim(),
      tagline: editTagline.trim(),
      intention: editIntention,
      lookingFor: editLookingFor,
      interests: editInterests,
      photoURLs: editPhotoURLs,
      pujaPreferences: {
        ...editPujaPreferences,
        gender: editGender,
        interestedIn: editInterestedIn,
      },
      prompts: [
        { question: PROMPT_QUESTIONS[0], answer: editPrompt1.trim() },
        { question: PROMPT_QUESTIONS[1], answer: editPrompt2.trim() },
        { question: PROMPT_QUESTIONS[2], answer: editPrompt3.trim() },
      ],
    };

    if (user) {
      try {
        localStorage.setItem(`ishqyara_gender_${user.id}`, editGender);
        localStorage.setItem(`ishqyara_interested_in_${user.id}`, editInterestedIn);
      } catch {}
    }

    try {
      await saveProfile(draft);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setEditModalOpen(false);
      }, 1200);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profileData || !publicProfile) {
    return (
      <AppShell>
        <div className="p-10 text-center text-sm text-stone-500">Loading your profile…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Hidden file input for fast avatar updates */}
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleDirectAvatarUpload}
      />

      {/* Hidden file input for slot photos in edit modal */}
      <input
        ref={editSlotFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleSlotPhotoSelected}
      />

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
                IshqYara
              </span>
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="px-4 sm:px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
              {/* Avatar with Camera Update Button */}
              <div className="relative group self-start">
                <img
                  src={profileData.image}
                  alt={profileData.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-lg ring-2 ring-[#9e1b22]/30"
                />

                {/* Direct Avatar Update Overlay Trigger */}
                <button
                  type="button"
                  title="Update profile picture"
                  disabled={isUpdatingAvatar}
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2.5 bg-[#9e1b22] hover:bg-[#83141a] text-white rounded-full shadow-lg border-2 border-white transition-all active:scale-90 cursor-pointer"
                >
                  {isUpdatingAvatar ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-[#9e1b22]" />
                  <span>Update Picture</span>
                </button>

                <button
                  onClick={openEditor}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#9e1b22] to-[#b8232b] shadow-sm hover:shadow-md hover:shadow-[#9e1b22]/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Avatar Update Toast Feedback */}
            {avatarSuccessMsg && (
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{avatarSuccessMsg}</span>
              </div>
            )}

            {/* Core Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  {profileData.name}, {profileData.age}
                </h1>
                {profileData.verified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 fill-sky-500/20" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSelfieModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>Get Verified</span>
                  </button>
                )}
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
                <span className="flex items-center gap-1 font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                  Interested In : {(publicProfile.pujaPreferences as any)?.interestedIn || "Women"}
                </span>
                {profileData?.verified || publicProfile.collegeVerified ? (
                  <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Selfie & College Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSelfieModal(true)}
                    className="flex items-center gap-1 font-semibold text-[#9e1b22] bg-red-50 hover:bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Verify with Selfie (Required to Like)
                  </button>
                )}
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

              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#faf7f2] border border-[#e7dfd5]">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-stone-800 leading-tight">
                    {profileData.photos?.length || 1} / {MAX_PHOTOS}
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium">Photos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photos Gallery Card */}
        {profileData.photos && profileData.photos.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#9e1b22]" />
                <span>My Photos ({profileData.photos.length})</span>
              </h3>
              <button
                type="button"
                onClick={openEditor}
                className="text-xs font-bold text-[#9e1b22] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Photos</span>
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {profileData.photos.map((photo, i) => (
                <div
                  key={i}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-stone-200 group"
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-[#9e1b22] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bio & Connection Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="md:col-span-7 space-y-6">
            {/* Bio Card */}
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                About Me
              </h3>
              <p className="text-stone-700 text-sm leading-relaxed">
                {profileData.bio || "No bio added yet."}
              </p>
            </div>

            {/* Connection Preferences */}
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                Looking For
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

            {/* Puja Prompts (Always displays updated prompt questions) */}
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                  Festival Prompts
                </h3>
                <button
                  type="button"
                  onClick={openEditor}
                  className="text-xs font-bold text-[#9e1b22] hover:underline"
                >
                  Edit Prompts
                </button>
              </div>

              {profileData.prompts.map((prompt, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e7dfd5] space-y-1.5">
                  <div className="text-xs font-bold text-[#9e1b22]">
                    {PROMPT_QUESTIONS[i] || prompt.question}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 font-medium italic">
                    {prompt.answer ? `“${prompt.answer}”` : <span className="text-stone-400 not-italic">No answer added yet.</span>}
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
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 border border-stone-200 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {saveSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-stone-900">
                  Profile Updated!
                </h3>
                <p className="text-xs text-stone-500">
                  Your updated preferences, photos, and prompts are now saved.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-stone-900">
                    Edit Your Profile
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Update your photos, Sharodiya prompts, and companion vibes.
                  </p>
                </div>

                {saveError && (
                  <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 font-semibold">
                    {saveError}
                  </p>
                )}

                {/* 1. PHOTO MANAGEMENT (Tinder 6-Grid Style) */}
                <div className="space-y-2 pb-4 border-b border-stone-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Profile Photos ({editPhotoURLs.length} / {MAX_PHOTOS})
                    </label>
                    <span className="text-[11px] text-stone-500">
                      1st photo is your main profile picture
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
                      const hasPhoto = index < editPhotoURLs.length;
                      const previewUrl = editPhotoPreviews[index] || editPhotoURLs[index];
                      const isUploading = uploadingSlot === index;

                      if (hasPhoto) {
                        return (
                          <div
                            key={`edit-slot-${index}`}
                            className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 shadow-xs transition-all ${
                              index === 0
                                ? "border-[#9e1b22] ring-2 ring-[#9e1b22]/30"
                                : "border-stone-200"
                            }`}
                          >
                            <img
                              src={previewUrl || ""}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {index === 0 && (
                              <span className="absolute top-1 left-1 bg-[#9e1b22] text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full z-10">
                                Main
                              </span>
                            )}

                            {/* Permanent mobile & desktop touch action buttons */}
                            <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1">
                              <button
                                type="button"
                                title="Remove photo"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSlotPhoto(index);
                                }}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/95 hover:bg-rose-50 text-rose-600 shadow-md border border-stone-200 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                              >
                                <X className="w-3 h-3 stroke-[2.5]" />
                              </button>
                            </div>

                            <div className="absolute bottom-1.5 right-1.5 z-20 flex items-center gap-1">
                              <button
                                type="button"
                                title="Change photo"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerSlotPick(index);
                                }}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/95 hover:bg-[#9e1b22] hover:text-white text-stone-800 shadow-md border border-stone-200 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                              >
                                <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                            </div>

                            {index > 0 && (
                              <div className="absolute bottom-1.5 left-1.5 z-20 flex items-center gap-1">
                                <button
                                  type="button"
                                  title="Make this your main profile picture"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetMainPic(index);
                                  }}
                                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/95 hover:bg-amber-50 text-amber-600 shadow-md border border-stone-200 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                                >
                                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-500/20" />
                                </button>
                              </div>
                            )}

                            {/* Desktop extended hover controls (reordering) */}
                            <div className="hidden sm:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex-col justify-between p-1 pointer-events-none">
                              <div className="flex items-center justify-between pointer-events-auto">
                                {index > 0 ? (
                                  <button
                                    type="button"
                                    title="Make profile picture"
                                    onClick={() => handleSetMainPic(index)}
                                    className="p-1 rounded-full bg-white text-amber-600 hover:bg-amber-50 cursor-pointer"
                                  >
                                    <Star className="w-3 h-3" />
                                  </button>
                                ) : <span />}
                                <button
                                  type="button"
                                  title="Remove"
                                  onClick={() => handleRemoveSlotPhoto(index)}
                                  className="p-1 rounded-full bg-white text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => triggerSlotPick(index)}
                                className="mx-auto px-2 py-0.5 bg-white rounded-full text-[9px] font-bold text-stone-900 shadow-sm flex items-center gap-1 cursor-pointer pointer-events-auto"
                              >
                                <Camera className="w-2.5 h-2.5 text-[#9e1b22]" />
                                <span>Change</span>
                              </button>

                              <div className="flex items-center justify-between pointer-events-auto">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMovePhoto(index, index - 1)}
                                  className="p-1 rounded-full bg-white/80 text-stone-800 disabled:opacity-30 cursor-pointer"
                                >
                                  <ArrowLeft className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === editPhotoURLs.length - 1}
                                  onClick={() => handleMovePhoto(index, index + 1)}
                                  className="p-1 rounded-full bg-white/80 text-stone-800 disabled:opacity-30 cursor-pointer"
                                >
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={`empty-${index}`}
                          type="button"
                          disabled={uploadingSlot !== null}
                          onClick={() => triggerSlotPick(editPhotoURLs.length)}
                          className="aspect-[3/4] rounded-2xl border-2 border-dashed border-stone-300 bg-[#faf7f2] hover:border-[#9e1b22] hover:bg-red-50/20 flex flex-col items-center justify-center transition-all cursor-pointer group"
                        >
                          {isUploading ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-[#9e1b22]" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-white border border-stone-200 group-hover:bg-[#9e1b22] group-hover:text-white flex items-center justify-center text-stone-500 transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[11px] text-stone-500">
                    <span>Click Change or + to upload. Star promotes to main profile picture.</span>
                    <button
                      type="button"
                      onClick={() => triggerSlotPick(0)}
                      className="text-[#9e1b22] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Update Main Pic</span>
                    </button>
                  </div>
                </div>

                {/* 2. BASIC PROFILE DETAILS */}
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        required
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        College / University
                      </label>
                      <input
                        type="text"
                        required
                        value={editCollege}
                        onChange={(e) => setEditCollege(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-stone-700">
                          Location
                        </label>
                        <button
                          type="button"
                          onClick={autoDetectLocation}
                          className="text-[#9e1b22] font-bold text-[10px] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Navigation className="w-2.5 h-2.5" />
                          <span>{locationDetecting ? "Detecting..." : "Auto-detect"}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={editArea}
                        onChange={(e) => setEditArea(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
                      />
                      {locationDetectMsg && (
                        <p className="mt-1 text-[10px] text-stone-500 font-semibold">{locationDetectMsg}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      rows={2}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
                    />
                  </div>

                  {/* Who are you interested in seeing? */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Who are you interested in seeing?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {INTERESTED_IN_OPTIONS.map((option) => {
                        const isSelected = editInterestedIn === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setEditInterestedIn(option)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                              isSelected
                                ? "border-[#9e1b22] bg-red-50 text-[#9e1b22] ring-2 ring-[#9e1b22]"
                                : "border-stone-300 bg-[#faf7f2] text-stone-700 hover:border-stone-400"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Your Gender
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {GENDER_OPTIONS.map((option) => {
                        const isSelected = editGender === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setEditGender(option)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                              isSelected
                                ? "border-[#9e1b22] bg-red-50 text-[#9e1b22] ring-2 ring-[#9e1b22]"
                                : "border-stone-300 bg-[#faf7f2] text-stone-700 hover:border-stone-400"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Looking For / Connection Preferences */}
                  <fieldset className="space-y-1.5">
                    <legend className="font-bold text-stone-700">Looking for (Connections)</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {INTENTION_OPTIONS.map((intent) => {
                        const isSelected = editLookingFor.includes(intent);
                        return (
                          <button
                            key={intent}
                            type="button"
                            onClick={() => toggleLookingFor(intent)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#9e1b22] text-white border-[#9e1b22] shadow-xs"
                                : "bg-[#faf7f2] text-stone-700 border-stone-300 hover:border-stone-400"
                            }`}
                          >
                            {intent}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Interests */}
                  <fieldset className="space-y-1.5">
                    <legend className="font-bold text-stone-700">Interests ({editInterests.length})</legend>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 bg-[#faf7f2] rounded-xl border border-stone-200">
                      {INTEREST_SUGGESTIONS.map((interest) => {
                        const isSelected = editInterests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#9e1b22] text-white border-[#9e1b22]"
                                : "bg-white text-stone-700 border-stone-300 hover:border-[#9e1b22]"
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Puja Preferences */}
                  <fieldset className="space-y-2 pt-2 border-t border-stone-100">
                    <legend className="font-bold text-stone-700">Puja Preferences</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {([
                        ["crowdComfort", "Crowd comfort", ["Loved Midnight Rush", "Quiet Afternoon Adda", "Balanced Explorer"]],
                        ["favoritePandalZone", "Favorite pandal zone", ["North Kolkata Heritage", "South Kolkata Theme", "Salt Lake & New Town", "Local Area"]],
                        ["foodPriority", "Food priority", ["Puchka & Rolls First", "Moghlai & Biryani Feast", "Bhog & Sweet Craver"]],
                        ["timing", "Puja timing", ["All-Nighter (11 PM - 6 AM)", "Sunset to Midnight (5 PM - 12 AM)", "Early Bird"]],
                      ] as const).map(([key, label, options]) => (
                        <label key={key} className="block font-semibold text-stone-600">
                          {label}
                          <select
                            value={editPujaPreferences[key]}
                            onChange={(e) =>
                              setEditPujaPreferences((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className="mt-1 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3 py-2 text-stone-900"
                          >
                            {options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* 3. FESTIVAL PROMPTS (Updated prompt questions) */}
                  <div className="space-y-3 pt-3 border-t border-stone-100">
                    <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Festival Prompts (Updated Questions)</span>
                    </span>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        1. {PROMPT_QUESTIONS[0]}
                      </label>
                      <input
                        type="text"
                        placeholder="Your answer..."
                        value={editPrompt1}
                        onChange={(e) => setEditPrompt1(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        2. {PROMPT_QUESTIONS[1]}
                      </label>
                      <input
                        type="text"
                        placeholder="Your answer..."
                        value={editPrompt2}
                        onChange={(e) => setEditPrompt2(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        3. {PROMPT_QUESTIONS[2]}
                      </label>
                      <input
                        type="text"
                        placeholder="Your answer..."
                        value={editPrompt3}
                        onChange={(e) => setEditPrompt3(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || uploadingSlot !== null}
                    className="px-6 py-2.5 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-[#9e1b22] to-[#c22830] hover:from-[#88171d] hover:to-[#ac2128] shadow-md shadow-[#9e1b22]/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Selfie Verification Modal */}
      {user && (
        <SelfieVerificationModal
          userId={user.id}
          isOpen={showSelfieModal}
          onClose={() => setShowSelfieModal(false)}
          onVerified={() => {
            void refreshProfile();
          }}
        />
      )}
    </AppShell>
  );
}
