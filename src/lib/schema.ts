import type { Profile } from "@/lib/data";

export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_PHOTOS = 4;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type Intention = Profile["intention"];

export type PujaPreferences = Profile["pujaPreferences"];

export type Prompt = {
  question: string;
  answer: string;
};

/** Public, discovery-safe profile. No email, no date of birth. */
export type PublicProfileRecord = {
  displayName: string;
  age: number;
  college: string;
  area: string;
  bio: string;
  tagline: string;
  intention: Intention;
  lookingFor: Intention[];
  interests: string[];
  photoURLs: string[];
  pujaPreferences: PujaPreferences;
  prompts: Prompt[];
  profileComplete: boolean;
  collegeVerified: boolean;
  createdAt: number;
  updatedAt: number;
};

export function ageFromDateOfBirth(isoDate: string, now = new Date()): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return -1;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const dob = new Date(Date.UTC(year, month - 1, day));
  if (dob.getUTCFullYear() !== year || dob.getUTCMonth() !== month - 1 || dob.getUTCDate() !== day) return -1;

  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  let age = today.getUTCFullYear() - year;
  const monthDelta = today.getUTCMonth() - (month - 1);
  if (monthDelta < 0 || (monthDelta === 0 && today.getUTCDate() < day)) {
    age -= 1;
  }
  return age;
}

export function isAdult(isoDate: string): boolean {
  return ageFromDateOfBirth(isoDate) >= 18;
}

const INTENTION_WEIGHT = 18;
const INTEREST_WEIGHT = 8;
const PUJA_WEIGHT = 10;

export function computeCompatibility(
  me: Pick<PublicProfileRecord, "intention" | "interests" | "pujaPreferences" | "lookingFor">,
  them: Pick<PublicProfileRecord, "intention" | "interests" | "pujaPreferences">
): number {
  let score = 55;
  if (me.lookingFor?.includes(them.intention) || me.intention === them.intention) {
    score += INTENTION_WEIGHT;
  }
  const mine = new Set((me.interests || []).map((i) => i.toLowerCase()));
  const overlap = (them.interests || []).filter((i) => mine.has(i.toLowerCase())).length;
  score += Math.min(24, overlap * INTEREST_WEIGHT);
  const pujaKeys: (keyof PujaPreferences)[] = [
    "crowdComfort",
    "favoritePandalZone",
    "foodPriority",
    "timing",
  ];
  for (const key of pujaKeys) {
    if (me.pujaPreferences?.[key] && me.pujaPreferences[key] === them.pujaPreferences?.[key]) {
      score += PUJA_WEIGHT / 2;
    }
  }
  return Math.max(50, Math.min(99, Math.round(score)));
}

export function toUiProfile(
  uid: string,
  record: PublicProfileRecord,
  me?: PublicProfileRecord | null
): Profile {
  const photos = Array.isArray(record.photoURLs) ? record.photoURLs.filter((photo): photo is string => typeof photo === "string" && photo.startsWith("https://")) : [];
  const preferences = { ...DEFAULT_PUJA, ...(record.pujaPreferences || {}) };
  return {
    id: uid,
    name: typeof record.displayName === "string" ? record.displayName : "Student",
    age: Number.isFinite(record.age) ? record.age : 18,
    college: typeof record.college === "string" ? record.college : "",
    area: record.area || "",
    image: photos[0] || "",
    photos,
    bio: record.bio || "",
    intention: record.intention || "Friendship",
    compatibility: me ? computeCompatibility(me, record) : 70,
    interests: Array.isArray(record.interests) ? record.interests.filter((interest): interest is string => typeof interest === "string") : [],
    pujaPreferences: preferences,
    prompts: Array.isArray(record.prompts) ? record.prompts.filter((prompt) => prompt && typeof prompt.question === "string" && typeof prompt.answer === "string") : [],
    verified: Boolean(record.collegeVerified),
    distanceKm: 0,
  };
}

export const DEFAULT_PUJA: PujaPreferences = {
  crowdComfort: "Balanced Explorer",
  favoritePandalZone: "South Kolkata Theme",
  foodPriority: "Puchka & Rolls First",
  timing: "Sunset to Midnight (5 PM - 12 AM)",
};

export const INTENTION_OPTIONS: Intention[] = [
  "Dating",
  "Friendship",
  "Food Buddy",
  "Puja Buddy",
  "Photography Buddy",
];

export const INTEREST_SUGGESTIONS = [
  "Photography",
  "Food",
  "Pandal Hopping",
  "Indie Music",
  "Film Photography",
  "Heritage Walks",
  "Coffee",
  "Classical Dance",
  "Bengali Cuisine",
  "Fashion",
  "Literature",
  "Adda",
  "Live Music",
  "Street Photography",
  "Kathi Rolls",
];

export const PROMPT_QUESTIONS = [
  "My quintessential Durga Puja ritual is...",
  "Best pandal bhog in town...",
  "Pujor gaan on loop...",
];
