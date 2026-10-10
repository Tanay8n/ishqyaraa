"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Camera, Heart } from "lucide-react";
import { useAppUser } from "@/components/AppUserContext";
import { resolvePhotoURLs, uploadProfilePhoto } from "@/lib/photos";
import { authAvatarUrl, authDisplayName } from "@/lib/supabase/user";
import {
  DEFAULT_PUJA,
  INTENTION_OPTIONS,
  INTEREST_SUGGESTIONS,
  MAX_PHOTOS,
  PROMPT_QUESTIONS,
  type Intention,
} from "@/lib/schema";

export function OnboardingForm() {
  const { user, publicProfile, privateDob, saveProfile } = useAppUser();
  const googleName = authDisplayName(user);
  const googlePhoto = authAvatarUrl(user);

  const [displayName, setDisplayName] = useState(publicProfile?.displayName || googleName);
  const [dateOfBirth, setDateOfBirth] = useState(privateDob || "");
  const [college, setCollege] = useState(publicProfile?.college || "");
  const [area, setArea] = useState(publicProfile?.area || "");
  const [bio, setBio] = useState(publicProfile?.bio || "");
  const [tagline, setTagline] = useState(publicProfile?.tagline || "");
  const [intention, setIntention] = useState<Intention>(publicProfile?.intention || "Friendship");
  const [interests, setInterests] = useState<string[]>(publicProfile?.interests || []);
  const [photoURLs, setPhotoURLs] = useState<string[]>(
    publicProfile?.photoURLs?.length ? publicProfile.photoURLs : googlePhoto ? [googlePhoto] : []
  );
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [crowdComfort, setCrowdComfort] = useState(publicProfile?.pujaPreferences.crowdComfort || DEFAULT_PUJA.crowdComfort);
  const [favoritePandalZone, setFavoritePandalZone] = useState(publicProfile?.pujaPreferences.favoritePandalZone || DEFAULT_PUJA.favoritePandalZone);
  const [foodPriority, setFoodPriority] = useState(publicProfile?.pujaPreferences.foodPriority || DEFAULT_PUJA.foodPriority);
  const [timing, setTiming] = useState(publicProfile?.pujaPreferences.timing || DEFAULT_PUJA.timing);
  const [prompt1, setPrompt1] = useState(publicProfile?.prompts?.[0]?.answer || "");
  const [prompt2, setPrompt2] = useState(publicProfile?.prompts?.[1]?.answer || "");
  const [prompt3, setPrompt3] = useState(publicProfile?.prompts?.[2]?.answer || "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    void resolvePhotoURLs(photoURLs).then((urls) => { if (active) setPhotoPreviews(urls); })
      .catch(() => { if (active) setPhotoPreviews(photoURLs.map((url) => url.startsWith("https://") ? url : "")); });
    return () => { active = false; };
  }, [photoURLs]);

  const maxDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().slice(0, 10);
  }, []);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]
    );
  };

  const onPickPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;
    if (photoURLs.length >= MAX_PHOTOS) {
      setError("You can add up to 4 photos.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const url = await uploadProfilePhoto(user.id, file);
      setPhotoURLs((prev) => [...prev, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await saveProfile({
        displayName,
        dateOfBirth,
        college,
        area,
        bio,
        tagline,
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
          { question: PROMPT_QUESTIONS[0], answer: prompt1 },
          { question: PROMPT_QUESTIONS[1], answer: prompt2 },
          { question: PROMPT_QUESTIONS[2], answer: prompt3 },
        ],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4 sm:p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xl space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 text-[#9e1b22] flex items-center justify-center">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9e1b22]">IshqYara</p>
            <h1 className="text-xl font-black text-stone-900">Create your profile</h1>
            <p className="text-xs text-stone-500">Required fields first. Puja prompts are optional.</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <label className="block">
            <span className="font-bold text-stone-700">Display name *</span>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
            />
          </label>

          <label className="block">
            <span className="font-bold text-stone-700">Date of birth * (kept private, 18+)</span>
            <input
              required
              type="date"
              max={maxDob}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="font-bold text-stone-700">College *</span>
              <input
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
              />
            </label>
            <label className="block">
              <span className="font-bold text-stone-700">Area *</span>
              <input
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
              />
            </label>
          </div>

          <label className="block">
            <span className="font-bold text-stone-700">Looking for *</span>
            <select
              value={intention}
              onChange={(e) => setIntention(e.target.value as Intention)}
              className="mt-1 w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
            >
              {INTENTION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="font-bold text-stone-700">Photos * (max {MAX_PHOTOS})</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {photoURLs.map((url, index) => (
                <img key={url} src={photoPreviews[index] || ""} alt="" className="w-16 h-16 rounded-xl object-cover border border-stone-200" />
              ))}
              {photoURLs.length < MAX_PHOTOS && (
                <label className="w-16 h-16 rounded-xl border border-dashed border-stone-300 bg-[#faf7f2] flex items-center justify-center cursor-pointer text-stone-500">
                  <Camera className="w-5 h-5" />
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPickPhoto} />
                </label>
              )}
            </div>
            {uploading && <p className="mt-1 text-stone-500">Uploading photo...</p>}
          </div>

          <label className="block">
            <span className="font-bold text-stone-700">Bio</span>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
            />
          </label>

          <label className="block">
            <span className="font-bold text-stone-700">Tagline</span>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300 text-stone-900"
            />
          </label>

          <div>
            <span className="font-bold text-stone-700">Interests</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {INTEREST_SUGGESTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
                    interests.includes(interest)
                      ? "bg-[#9e1b22] text-white border-[#9e1b22]"
                      : "bg-[#faf7f2] text-stone-700 border-stone-200"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="font-bold text-stone-700">Crowd comfort</span>
              <select value={crowdComfort} onChange={(e) => setCrowdComfort(e.target.value as typeof crowdComfort)} className="mt-1 w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300">
                <option>Loved Midnight Rush</option>
                <option>Quiet Afternoon Adda</option>
                <option>Balanced Explorer</option>
              </select>
            </label>
            <label className="block">
              <span className="font-bold text-stone-700">Favorite zone</span>
              <select value={favoritePandalZone} onChange={(e) => setFavoritePandalZone(e.target.value as typeof favoritePandalZone)} className="mt-1 w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300">
                <option>North Kolkata Heritage</option>
                <option>South Kolkata Theme</option>
                <option>Salt Lake & New Town</option>
                <option>Suburban Megastars</option>
              </select>
            </label>
            <label className="block">
              <span className="font-bold text-stone-700">Food priority</span>
              <select value={foodPriority} onChange={(e) => setFoodPriority(e.target.value as typeof foodPriority)} className="mt-1 w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300">
                <option>Puchka & Rolls First</option>
                <option>Moghlai & Biryani Feast</option>
                <option>Bhog & Sweet Craver</option>
              </select>
            </label>
            <label className="block">
              <span className="font-bold text-stone-700">Timing</span>
              <select value={timing} onChange={(e) => setTiming(e.target.value as typeof timing)} className="mt-1 w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300">
                <option>All-Nighter (11 PM - 6 AM)</option>
                <option>Sunset to Midnight (5 PM - 12 AM)</option>
                <option>Early Bird</option>
              </select>
            </label>
          </div>

          <div className="space-y-2 pt-1 border-t border-stone-100">
            <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">Optional Puja prompts</span>
            <input value={prompt1} onChange={(e) => setPrompt1(e.target.value)} placeholder={PROMPT_QUESTIONS[0]} className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300" />
            <input value={prompt2} onChange={(e) => setPrompt2(e.target.value)} placeholder={PROMPT_QUESTIONS[1]} className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300" />
            <input value={prompt3} onChange={(e) => setPrompt3(e.target.value)} placeholder={PROMPT_QUESTIONS[2]} className="w-full px-3 py-2 bg-[#faf7f2] rounded-xl border border-stone-300" />
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

        <p className="text-[11px] text-stone-500 text-center leading-relaxed">
          By completing your profile, you acknowledge that your profile details will be visible to other members in accordance with our{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-stone-700 underline hover:text-[#9e1b22]">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-stone-700 underline hover:text-[#9e1b22]">
            Terms of Service
          </a>.
        </p>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-[#9e1b22] to-[#c22830] disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Saving..." : "Save and start discovering 🪷"}
        </button>
      </form>
    </div>
  );
}
