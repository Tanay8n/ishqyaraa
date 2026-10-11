"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  Heart,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  HelpCircle,
  MapPin,
  Navigation,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAppUser } from "@/components/AppUserContext";
import { resolvePhotoURLs, uploadProfilePhoto } from "@/lib/photos";
import { authAvatarUrl, authDisplayName } from "@/lib/supabase/user";
import {
  DEFAULT_PUJA,
  INTENTION_OPTIONS,
  INTEREST_SUGGESTIONS,
  MAX_PHOTOS,
  PROMPT_QUESTIONS,
  isAdult,
  ageFromDateOfBirth,
  type Intention,
} from "@/lib/schema";

const GENDER_OPTIONS = ["Man", "Woman", "Non-binary / More"] as const;
const INTERESTED_IN_OPTIONS = ["Women", "Men", "Everyone"] as const;

export function OnboardingForm() {
  const { user, publicProfile, privateDob, saveProfile } = useAppUser();
  const googleName = authDisplayName(user);
  const googlePhoto = authAvatarUrl(user);

  // Form Fields
  const [displayName, setDisplayName] = useState(publicProfile?.displayName || googleName || "");
  const [email] = useState(user?.email || "Google Account");

  // Birthday split into Month / Day / Year like Tinder
  const parsedDob = useMemo(() => {
    if (!privateDob) return { month: "", day: "", year: "" };
    const parts = privateDob.split("-");
    if (parts.length === 3) {
      return { year: parts[0], month: parts[1], day: parts[2] };
    }
    return { month: "", day: "", year: "" };
  }, [privateDob]);

  const [birthMonth, setBirthMonth] = useState(parsedDob.month);
  const [birthDay, setBirthDay] = useState(parsedDob.day);
  const [birthYear, setBirthYear] = useState(parsedDob.year);

  // Gender & Preferences
  const [gender, setGender] = useState<string>("Man");
  const [showGenderOnProfile, setShowGenderOnProfile] = useState(true);
  const [interestedIn, setInterestedIn] = useState<string>("Women");

  // IshqYara essentials
  const [college, setCollege] = useState(publicProfile?.college || "");
  const [area, setArea] = useState(publicProfile?.area || "");
  const [intention, setIntention] = useState<Intention>(publicProfile?.intention || "Dating");
  const [showIntentPicker, setShowIntentPicker] = useState(false);

  // Optional fields
  const [bio, setBio] = useState(publicProfile?.bio || "");
  const [tagline, setTagline] = useState(publicProfile?.tagline || "");
  const [interests, setInterests] = useState<string[]>(publicProfile?.interests || []);
  const [showInterestsPicker, setShowInterestsPicker] = useState(false);

  // Durga Puja festival preferences
  const [showPujaSection, setShowPujaSection] = useState(false);
  const [crowdComfort, setCrowdComfort] = useState(publicProfile?.pujaPreferences.crowdComfort || DEFAULT_PUJA.crowdComfort);
  const [favoritePandalZone, setFavoritePandalZone] = useState(publicProfile?.pujaPreferences.favoritePandalZone || DEFAULT_PUJA.favoritePandalZone);
  const [foodPriority, setFoodPriority] = useState(publicProfile?.pujaPreferences.foodPriority || DEFAULT_PUJA.foodPriority);
  const [timing, setTiming] = useState(publicProfile?.pujaPreferences.timing || DEFAULT_PUJA.timing);
  const [prompt1, setPrompt1] = useState(publicProfile?.prompts?.[0]?.answer || "");
  const [prompt2, setPrompt2] = useState(publicProfile?.prompts?.[1]?.answer || "");
  const [prompt3, setPrompt3] = useState(publicProfile?.prompts?.[2]?.answer || "");

  // Photos state (up to 6 slots)
  const [photoURLs, setPhotoURLs] = useState<string[]>(
    publicProfile?.photoURLs?.length ? publicProfile.photoURLs : googlePhoto ? [googlePhoto] : []
  );
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Status
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Location detection & permission primer modal state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const requestDeviceLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationFeedback({
        type: "error",
        message: "Geolocation is not supported by your browser. Please type your area manually.",
      });
      return;
    }

    setLocationLoading(true);
    setLocationFeedback(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
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
          setArea(placeName);
          setLocationFeedback({
            type: "success",
            message: `Location set to ${placeName}!`,
          });
          setTimeout(() => {
            setShowLocationModal(false);
            setLocationLoading(false);
            setLocationFeedback(null);
          }, 1100);
        } catch {
          setArea("Kolkata");
          setLocationFeedback({
            type: "success",
            message: "Location detected as Kolkata!",
          });
          setTimeout(() => {
            setShowLocationModal(false);
            setLocationLoading(false);
            setLocationFeedback(null);
          }, 1100);
        }
      },
      (error) => {
        setLocationLoading(false);
        let errorMsg = "Could not get location. You can enter your neighborhood manually.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission wasn't granted. No worries, simply type your area below!";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Location request timed out. Please enter your area manually.";
        }
        setLocationFeedback({
          type: "error",
          message: errorMsg,
        });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Hidden file input for triggering updates
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetSlotRef = useRef<number>(0);

  // Resolve signed photo URLs
  useEffect(() => {
    let active = true;
    void resolvePhotoURLs(photoURLs)
      .then((urls) => {
        if (active) setPhotoPreviews(urls);
      })
      .catch(() => {
        if (active) {
          setPhotoPreviews(
            photoURLs.map((url) => (url.startsWith("https://") || url.startsWith("blob:") ? url : ""))
          );
        }
      });
    return () => {
      active = false;
    };
  }, [photoURLs]);

  // Compute ISO DOB from Month / Day / Year
  const dateOfBirth = useMemo(() => {
    if (!birthYear || !birthMonth || !birthDay) return "";
    const m = birthMonth.toString().padStart(2, "0");
    const d = birthDay.toString().padStart(2, "0");
    return `${birthYear}-${m}-${d}`;
  }, [birthYear, birthMonth, birthDay]);

  const calculatedAge = useMemo(() => {
    if (!dateOfBirth) return null;
    const age = ageFromDateOfBirth(dateOfBirth);
    return age >= 0 ? age : null;
  }, [dateOfBirth]);

  const isAgeValid = useMemo(() => {
    if (!dateOfBirth) return null;
    return isAdult(dateOfBirth);
  }, [dateOfBirth]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]
    );
  };

  // Trigger file selection for a specific slot (either adding or replacing/updating)
  const triggerPhotoPick = (slotIndex: number) => {
    targetSlotRef.current = slotIndex;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handlePhotoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const slotIndex = targetSlotRef.current;
    setUploadingSlot(slotIndex);
    setError(null);

    try {
      let finalUrl = "";
      if (user) {
        // Upload to Supabase Storage
        finalUrl = await uploadProfilePhoto(user.id, file);
      } else {
        // Fallback for local preview / mock dev
        finalUrl = URL.createObjectURL(file);
      }

      setPhotoURLs((prev) => {
        const next = [...prev];
        if (slotIndex < next.length) {
          // Replace existing photo at this slot (e.g. updating profile picture)
          next[slotIndex] = finalUrl;
        } else {
          // Add to next available slot
          next.push(finalUrl);
        }
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload photo. Please try again.");
    } finally {
      setUploadingSlot(null);
    }
  };

  // Set a specific photo as the primary profile picture (Slot #0)
  const handleSetAsProfilePic = (index: number) => {
    if (index === 0 || index >= photoURLs.length) return;
    setPhotoURLs((prev) => {
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });
  };

  // Remove photo from a slot
  const handleRemovePhoto = (index: number) => {
    setPhotoURLs((prev) => prev.filter((_, i) => i !== index));
  };

  // Reorder photos (move left or right)
  const handleMovePhoto = (from: number, to: number) => {
    if (to < 0 || to >= photoURLs.length) return;
    setPhotoURLs((prev) => {
      const next = [...prev];
      const temp = next[from];
      next[from] = next[to];
      next[to] = temp;
      return next;
    });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex || targetIndex >= photoURLs.length) {
      setDraggedIndex(null);
      return;
    }
    setPhotoURLs((prev) => {
      const next = [...prev];
      const [item] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
    setDraggedIndex(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError("Please enter your display name.");
      return;
    }
    if (!dateOfBirth || !isAdult(dateOfBirth)) {
      setError("Please enter a valid date of birth. IshqYara is strictly for adults aged 18+.");
      return;
    }
    if (!college.trim()) {
      setError("Please add your college or university.");
      return;
    }
    if (!area.trim()) {
      setError("Please add your Kolkata neighborhood or area.");
      return;
    }
    if (photoURLs.length === 0) {
      setError("Please upload at least 1 photo for your profile.");
      return;
    }

    setSaving(true);
    try {
      await saveProfile({
        displayName: displayName.trim(),
        dateOfBirth,
        college: college.trim(),
        area: area.trim(),
        bio: bio.trim(),
        tagline: tagline.trim(),
        intention,
        lookingFor: [intention],
        interests,
        photoURLs,
        pujaPreferences: {
          crowdComfort,
          favoritePandalZone,
          foodPriority,
          timing,
        },
        prompts: [
          { question: PROMPT_QUESTIONS[0], answer: prompt1.trim() },
          { question: PROMPT_QUESTIONS[1], answer: prompt2.trim() },
          { question: PROMPT_QUESTIONS[2], answer: prompt3.trim() },
        ],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-900 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Location Permission Primer Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-stone-200 relative text-center">
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                setShowLocationModal(false);
                setLocationFeedback(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pulsing Pin Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#9e1b22] relative mb-4">
              <span className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-30" />
              <MapPin className="w-8 h-8 fill-current relative z-10" />
            </div>

            <h3 className="text-xl font-black text-stone-900 tracking-tight">
              Enable Location
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              IshqYara uses your approximate location to calculate distance to Puja pandals and match you with nearby students in Kolkata.
            </p>

            {/* Trust & Privacy Points */}
            <div className="bg-[#faf7f2] rounded-2xl p-3 text-left space-y-2 border border-stone-200/60 my-4">
              <div className="flex items-start gap-2 text-[11px] text-stone-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Your exact live GPS address is never shown to others.</span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-stone-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Helps you discover buddies in your specific pandal zone.</span>
              </div>
            </div>

            {/* Feedback status */}
            {locationFeedback && (
              <div
                className={`p-2.5 rounded-xl text-xs font-bold mb-3 ${
                  locationFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {locationFeedback.message}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={locationLoading}
                onClick={requestDeviceLocation}
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-[#9e1b22] to-[#c22830] hover:from-[#88171d] hover:to-[#ac2128] shadow-md shadow-[#9e1b22]/20 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {locationLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Detecting Location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    <span>Allow Location Access</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLocationModal(false);
                  setLocationFeedback(null);
                }}
                className="w-full py-2.5 rounded-2xl font-bold text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Enter Manually Instead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for photo uploads/replacements */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handlePhotoSelected}
      />

      <div className="max-w-5xl mx-auto">
        {/* Top Header / Branding */}
        <header className="mb-8 flex items-center justify-between border-b border-stone-200/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shadow-[#9e1b22]/20 flex items-center justify-center bg-white border border-stone-200">
              <Image
                src="/logo.png"
                alt="IshqYara Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                Dil se, Ishq Tak.
              </span>
              <p className="text-xs font-bold text-[#9e1b22]">IshqYara • Puja Partner</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-stone-500">Step 1 of 1</span>
        </header>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Create account
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Set up your profile to connect with companions, squad members, and fellow students.
          </p>
        </div>

        {/* Main 2-Column Responsive Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-stone-200/90 shadow-xl p-6 sm:p-8 lg:p-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* LEFT COLUMN: Profile Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  First Name <span className="text-[#9e1b22]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditya"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#faf7f2] rounded-2xl border border-stone-300 text-stone-900 font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/30 focus:border-[#9e1b22] transition-all text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Email <span className="text-[#9e1b22]">*</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-3 bg-stone-100/80 rounded-2xl border border-stone-200 text-stone-600 font-medium text-sm cursor-not-allowed select-none"
                />
              </div>

              {/* Birthday (Month / Day / Year) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Birthday <span className="text-[#9e1b22]">*</span>
                  </label>
                  {calculatedAge !== null && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isAgeValid
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : "bg-rose-50 text-rose-700 border border-rose-200/60"
                      }`}
                    >
                      {isAgeValid ? `Age: ${calculatedAge} (18+)` : `Age: ${calculatedAge} (Must be 18+)`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="block text-[11px] font-semibold text-stone-500 mb-1">Month</span>
                    <input
                      type="number"
                      required
                      min={1}
                      max={12}
                      placeholder="MM"
                      value={birthMonth}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 2);
                        setBirthMonth(val);
                      }}
                      className="w-full text-center px-3 py-2.5 bg-[#faf7f2] rounded-2xl border border-stone-300 text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/30 focus:border-[#9e1b22] text-sm"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-stone-500 mb-1">Day</span>
                    <input
                      type="number"
                      required
                      min={1}
                      max={31}
                      placeholder="DD"
                      value={birthDay}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 2);
                        setBirthDay(val);
                      }}
                      className="w-full text-center px-3 py-2.5 bg-[#faf7f2] rounded-2xl border border-stone-300 text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/30 focus:border-[#9e1b22] text-sm"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-stone-500 mb-1">Year</span>
                    <input
                      type="number"
                      required
                      min={1900}
                      max={new Date().getFullYear() - 18}
                      placeholder="YYYY"
                      value={birthYear}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 4);
                        setBirthYear(val);
                      }}
                      className="w-full text-center px-3 py-2.5 bg-[#faf7f2] rounded-2xl border border-stone-300 text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/30 focus:border-[#9e1b22] text-sm"
                    />
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-stone-500">
                  Your birth date is kept private and used solely to verify age.
                </p>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Gender <span className="text-[#9e1b22]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {GENDER_OPTIONS.map((option) => {
                    const isSelected = gender === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setGender(option)}
                        className={`py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all text-center cursor-pointer ${
                          isSelected
                            ? "border-[#9e1b22] bg-[#9e1b22] text-white shadow-sm"
                            : "border-stone-300 bg-[#faf7f2] text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* Show gender checkbox */}
                <label className="mt-2.5 flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showGenderOnProfile}
                    onChange={(e) => setShowGenderOnProfile(e.target.checked)}
                    className="w-4 h-4 rounded text-[#9e1b22] border-stone-300 focus:ring-[#9e1b22] accent-[#9e1b22]"
                  />
                  <span className="text-xs text-stone-600 font-medium">
                    Show my gender on my profile
                  </span>
                </label>
              </div>

              {/* Interested In */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Interested In <span className="text-[#9e1b22]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {INTERESTED_IN_OPTIONS.map((option) => {
                    const isSelected = interestedIn === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setInterestedIn(option)}
                        className={`py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all text-center cursor-pointer ${
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

              {/* Looking for / Relationship Intent */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Looking for <span className="text-[#9e1b22]">*</span>
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowIntentPicker(!showIntentPicker)}
                    className="w-full py-2.5 px-4 rounded-2xl border border-stone-300 bg-[#faf7f2] hover:border-stone-400 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-800 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#9e1b22] fill-current" />
                      <span>{intention}</span>
                    </span>
                    <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
                      {showIntentPicker ? "Close" : "+ Change Intent"}
                      {showIntentPicker ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>

                  {showIntentPicker && (
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 grid grid-cols-2 gap-2 animate-in fade-in duration-150">
                      {INTENTION_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setIntention(option);
                            setShowIntentPicker(false);
                          }}
                          className={`p-2 rounded-xl text-xs font-bold text-left transition-all ${
                            intention === option
                              ? "bg-[#9e1b22] text-white"
                              : "bg-white text-stone-700 border border-stone-200 hover:border-[#9e1b22]"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* College & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    College / University <span className="text-[#9e1b22]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jadavpur University"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#faf7f2] rounded-2xl border border-stone-300 text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/30 focus:border-[#9e1b22]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Location <span className="text-[#9e1b22]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(true)}
                      className="text-[11px] font-bold text-[#9e1b22] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Auto-detect</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Salt Lake, Ballygunge"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-[#faf7f2] rounded-2xl border border-stone-300 text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/30 focus:border-[#9e1b22]"
                    />
                    <button
                      type="button"
                      title="Detect location"
                      onClick={() => setShowLocationModal(true)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-[#9e1b22] transition-colors cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* OPTIONAL DIVIDER (Matches Tinder design) */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <span className="relative bg-white px-4 text-xs font-bold uppercase tracking-wider text-stone-400">
                  Optional
                </span>
              </div>

              {/* Bio & Tagline */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  About Me / Bio
                </label>
                <textarea
                  rows={2}
                  placeholder="Share a bit about what makes you smile, your adda style, or your Puja vibe..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf7f2] rounded-2xl border border-stone-300 text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/30 focus:border-[#9e1b22]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Tagline / Vibe
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maddox Square lawn enthusiast"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf7f2] rounded-2xl border border-stone-300 text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/30 focus:border-[#9e1b22]"
                />
              </div>

              {/* Interests Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Interests ({interests.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowInterestsPicker(!showInterestsPicker)}
                    className="text-xs font-bold text-[#9e1b22] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{showInterestsPicker ? "Done" : "+ Add Interests"}</span>
                  </button>
                </div>

                {interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {interests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9e1b22] text-white shadow-xs"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className="hover:opacity-75 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {showInterestsPicker && (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <p className="text-[11px] font-semibold text-stone-500 mb-2">
                      Choose what you love:
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {INTEREST_SUGGESTIONS.map((interest) => {
                        const isSelected = interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
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
                  </div>
                )}
              </div>

              {/* Collapsible Puja Preferences */}
              <div className="rounded-2xl border border-stone-200 overflow-hidden bg-[#faf7f2]/50">
                <button
                  type="button"
                  onClick={() => setShowPujaSection(!showPujaSection)}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-stone-800 hover:bg-stone-100/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Durga Puja Preferences & Prompts (Optional)</span>
                  </span>
                  {showPujaSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showPujaSection && (
                  <div className="p-4 pt-0 space-y-3 text-xs border-t border-stone-200 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Crowd comfort</label>
                        <select
                          value={crowdComfort}
                          onChange={(e) => setCrowdComfort(e.target.value as typeof crowdComfort)}
                          className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 font-medium"
                        >
                          <option>Loved Midnight Rush</option>
                          <option>Quiet Afternoon Adda</option>
                          <option>Balanced Explorer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Favorite Zone</label>
                        <select
                          value={favoritePandalZone}
                          onChange={(e) => setFavoritePandalZone(e.target.value as typeof favoritePandalZone)}
                          className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 font-medium"
                        >
                          <option>North Kolkata Heritage</option>
                          <option>South Kolkata Theme</option>
                          <option>Salt Lake & New Town</option>
                          <option>Local Area</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Food Priority</label>
                        <select
                          value={foodPriority}
                          onChange={(e) => setFoodPriority(e.target.value as typeof foodPriority)}
                          className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 font-medium"
                        >
                          <option>Puchka & Rolls First</option>
                          <option>Moghlai & Biryani Feast</option>
                          <option>Bhog & Sweet Craver</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Timing</label>
                        <select
                          value={timing}
                          onChange={(e) => setTiming(e.target.value as typeof timing)}
                          className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 font-medium"
                        >
                          <option>All-Nighter (11 PM - 6 AM)</option>
                          <option>Sunset to Midnight (5 PM - 12 AM)</option>
                          <option>Early Bird</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                        Festival Prompts
                      </span>
                      <input
                        value={prompt1}
                        onChange={(e) => setPrompt1(e.target.value)}
                        placeholder={PROMPT_QUESTIONS[0]}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300"
                      />
                      <input
                        value={prompt2}
                        onChange={(e) => setPrompt2(e.target.value)}
                        placeholder={PROMPT_QUESTIONS[1]}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300"
                      />
                      <input
                        value={prompt3}
                        onChange={(e) => setPrompt3(e.target.value)}
                        placeholder={PROMPT_QUESTIONS[2]}
                        className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Profile Photos (Tinder 6-Grid Style) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Profile photos <span className="text-[#9e1b22]">*</span>
                  </label>
                  <span className="text-xs font-semibold text-stone-500">
                    {photoURLs.length} / {MAX_PHOTOS}
                  </span>
                </div>

                {/* 6-Slot Photo Grid */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
                    const hasPhoto = index < photoURLs.length;
                    const previewUrl = photoPreviews[index] || photoURLs[index];
                    const isUploadingThis = uploadingSlot === index;
                    const isMainProfilePic = index === 0 && hasPhoto;

                    if (hasPhoto) {
                      return (
                        <div
                          key={`slot-${index}`}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(index)}
                          className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all shadow-sm ${
                            isMainProfilePic
                              ? "border-[#9e1b22] ring-2 ring-[#9e1b22]/30"
                              : "border-stone-200 hover:border-stone-400"
                          }`}
                        >
                          {/* Image */}
                          <img
                            src={previewUrl || ""}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover select-none"
                          />

                          {/* Profile Picture badge on slot #0 */}
                          {isMainProfilePic && (
                            <div className="absolute top-1.5 left-1.5 z-10 bg-[#9e1b22] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>Main Pic</span>
                            </div>
                          )}

                          {/* Overlay Controls */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            {/* Top row actions: Reorder & Delete */}
                            <div className="flex items-center justify-between">
                              {index > 0 ? (
                                <button
                                  type="button"
                                  title="Make this your main profile picture"
                                  onClick={() => handleSetAsProfilePic(index)}
                                  className="p-1 rounded-full bg-white text-amber-600 hover:bg-amber-50 shadow-xs cursor-pointer"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span />
                              )}
                              <button
                                type="button"
                                title="Remove photo"
                                onClick={() => handleRemovePhoto(index)}
                                className="p-1 rounded-full bg-white text-rose-600 hover:bg-rose-50 shadow-xs cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Center: Update / Replace photo button */}
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => triggerPhotoPick(index)}
                                className="px-2.5 py-1 bg-white/95 text-stone-900 rounded-full text-[10px] font-bold shadow-md hover:bg-white flex items-center gap-1 cursor-pointer"
                              >
                                <Camera className="w-3 h-3 text-[#9e1b22]" />
                                <span>Update</span>
                              </button>
                            </div>

                            {/* Bottom row actions: Move left/right */}
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                disabled={index === 0}
                                title="Move left"
                                onClick={() => handleMovePhoto(index, index - 1)}
                                className="p-1 rounded-full bg-white/80 text-stone-800 disabled:opacity-30 hover:bg-white cursor-pointer"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={index === photoURLs.length - 1}
                                title="Move right"
                                onClick={() => handleMovePhoto(index, index + 1)}
                                className="p-1 rounded-full bg-white/80 text-stone-800 disabled:opacity-30 hover:bg-white cursor-pointer"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Replace corner button */}
                          <button
                            type="button"
                            title="Update photo"
                            onClick={() => triggerPhotoPick(index)}
                            className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 text-stone-800 hover:bg-[#9e1b22] hover:text-white shadow-md flex items-center justify-center transition-colors cursor-pointer group-hover:hidden"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    }

                    // Empty Slot
                    return (
                      <button
                        key={`empty-${index}`}
                        type="button"
                        disabled={uploadingSlot !== null}
                        onClick={() => triggerPhotoPick(photoURLs.length)}
                        className={`group relative aspect-[3/4] rounded-2xl border-2 border-dashed border-stone-300 bg-[#faf7f2]/80 hover:bg-[#faf7f2] hover:border-[#9e1b22]/70 flex flex-col items-center justify-center transition-all cursor-pointer ${
                          uploadingSlot !== null ? "opacity-60 cursor-wait" : ""
                        }`}
                      >
                        {isUploadingThis ? (
                          <div className="flex flex-col items-center gap-1 text-[#9e1b22]">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span className="text-[10px] font-bold">Uploading</span>
                          </div>
                        ) : (
                          <>
                            {index === 0 && (
                              <span className="absolute top-2 text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                                Main
                              </span>
                            )}
                            <div className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow-xs flex items-center justify-center text-stone-600 group-hover:bg-[#9e1b22] group-hover:text-white group-hover:border-[#9e1b22] transition-colors">
                              <Plus className="w-4 h-4" />
                            </div>
                            {/* Floating plus in bottom right matching screenshot */}
                            <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-white border border-stone-200 shadow-xs flex items-center justify-center text-stone-700 group-hover:bg-[#9e1b22] group-hover:text-white group-hover:border-[#9e1b22] transition-all">
                              <Plus className="w-3 h-3" />
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Helper text matching Tinder design */}
                <div className="mt-4 space-y-1 text-center">
                  <p className="text-[11px] font-semibold text-stone-600">
                    Hold, drag and drop or use arrow keys to reorder your photos
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Upload at least 1 photo to start. The 1st photo is your main profile picture.
                  </p>
                </div>

                {/* Quick Profile Picture Update Button */}
                {photoURLs.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-stone-100 flex justify-center">
                    <button
                      type="button"
                      onClick={() => triggerPhotoPick(0)}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-[#9e1b22]" />
                      <span>Update Main Profile Picture</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Status and Errors */}
              <div className="mt-6 space-y-3">
                {error && (
                  <div
                    role="alert"
                    className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <p className="text-[11px] text-stone-500 text-center leading-relaxed">
                  By continuing, you agree to IshqYara&apos;s{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-stone-700 underline hover:text-[#9e1b22]"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-stone-700 underline hover:text-[#9e1b22]"
                  >
                    Terms of Service
                  </a>
                  .
                </p>

                {/* Large Centered Continue Button */}
                <button
                  type="submit"
                  disabled={saving || uploadingSlot !== null}
                  className="w-full py-3.5 rounded-full font-black text-sm sm:text-base text-white bg-gradient-to-r from-[#9e1b22] to-[#c22830] hover:from-[#88171d] hover:to-[#ac2128] shadow-lg shadow-[#9e1b22]/20 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving your profile...</span>
                    </>
                  ) : (
                    <span>Continue 🪷</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
