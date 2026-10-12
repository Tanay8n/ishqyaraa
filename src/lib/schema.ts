import type { Profile } from "@/lib/data";

export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_PHOTOS = 6;
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

export const KOLKATA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Central Kolkata
  "park street": { lat: 22.5516, lng: 88.3524 },
  "central kolkata": { lat: 22.5645, lng: 88.3524 },
  "esplanade": { lat: 22.5645, lng: 88.3524 },
  "dharmatala": { lat: 22.5645, lng: 88.3524 },
  "sealdah": { lat: 22.567, lng: 88.3712 },
  "college street": { lat: 22.5744, lng: 88.3629 },
  "bowbazar": { lat: 22.5683, lng: 88.3615 },
  "camac street": { lat: 22.548, lng: 88.352 },

  // South Kolkata
  "south kolkata": { lat: 22.515, lng: 88.35 },
  "ballygunge": { lat: 22.528, lng: 88.3656 },
  "gariahat": { lat: 22.5186, lng: 88.3683 },
  "maddox square": { lat: 22.525, lng: 88.358 },
  "bhowanipore": { lat: 22.5297, lng: 88.3446 },
  "bhawanipur": { lat: 22.5297, lng: 88.3446 },
  "kalighat": { lat: 22.518, lng: 88.344 },
  "hazra": { lat: 22.522, lng: 88.345 },
  "alipore": { lat: 22.5312, lng: 88.3283 },
  "new alipore": { lat: 22.5115, lng: 88.3275 },
  "jadavpur": { lat: 22.4988, lng: 88.3718 },
  "santoshpur": { lat: 22.497, lng: 88.384 },
  "dhakuria": { lat: 22.5085, lng: 88.3667 },
  "lake gardens": { lat: 22.505, lng: 88.355 },
  "tollygunge": { lat: 22.5002, lng: 88.3468 },
  "kudghat": { lat: 22.485, lng: 88.345 },
  "ranikuthi": { lat: 22.486, lng: 88.358 },
  "behala": { lat: 22.4986, lng: 88.3129 },
  "thakurpukur": { lat: 22.4633, lng: 88.305 },
  "taratala": { lat: 22.513, lng: 88.315 },
  "kasba": { lat: 22.5134, lng: 88.397 },
  "ruby": { lat: 22.514, lng: 88.402 },
  "anandapur": { lat: 22.518, lng: 88.412 },
  "garia": { lat: 22.4633, lng: 88.3832 },
  "patuli": { lat: 22.476, lng: 88.389 },
  "naktala": { lat: 22.477, lng: 88.367 },
  "sonarpur": { lat: 22.4411, lng: 88.4005 },
  "narendrapur": { lat: 22.438, lng: 88.397 },

  // East Kolkata & IT Corridor
  "salt lake": { lat: 22.5804, lng: 88.4174 },
  "saltlake": { lat: 22.5804, lng: 88.4174 },
  "bidhannagar": { lat: 22.5804, lng: 88.4174 },
  "sector v": { lat: 22.5744, lng: 88.4338 },
  "sector 5": { lat: 22.5744, lng: 88.4338 },
  "new town": { lat: 22.5899, lng: 88.4744 },
  "newtown": { lat: 22.5899, lng: 88.4744 },
  "rajarhat": { lat: 22.6186, lng: 88.498 },
  "kankurgachi": { lat: 22.5765, lng: 88.3887 },
  "phoolbagan": { lat: 22.573, lng: 88.389 },
  "ultadanga": { lat: 22.5888, lng: 88.3846 },
  "lake town": { lat: 22.6033, lng: 88.4033 },
  "bangur": { lat: 22.607, lng: 88.408 },

  // North Kolkata
  "north kolkata": { lat: 22.5958, lng: 88.3697 },
  "shyambazar": { lat: 22.6022, lng: 88.3708 },
  "hatibagan": { lat: 22.5947, lng: 88.3727 },
  "bagbazar": { lat: 22.6044, lng: 88.3644 },
  "sovabazar": { lat: 22.5975, lng: 88.3639 },
  "shobhabazar": { lat: 22.5975, lng: 88.3639 },
  "kumartuli": { lat: 22.5998, lng: 88.362 },
  "girish park": { lat: 22.5856, lng: 88.36 },
  "dum dum": { lat: 22.642, lng: 88.4312 },
  "nagerbazar": { lat: 22.628, lng: 88.423 },
  "belgharia": { lat: 22.661, lng: 88.385 },
  "sodepur": { lat: 22.697, lng: 88.389 },
  "barrackpore": { lat: 22.7667, lng: 88.3667 },
  "barasat": { lat: 22.7214, lng: 88.4816 },
  "madhyamgram": { lat: 22.6983, lng: 88.4552 },

  // West Kolkata / Howrah
  "howrah": { lat: 22.5958, lng: 88.315 },
  "shibpur": { lat: 22.565, lng: 88.315 },
  "santragachi": { lat: 22.582, lng: 88.283 },
  "salkia": { lat: 22.61, lng: 88.345 },

  // Default Kolkata
  "kolkata": { lat: 22.5726, lng: 88.3639 },
};

export const ZONE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "south kolkata theme": { lat: 22.515, lng: 88.35 },
  "north kolkata heritage": { lat: 22.5958, lng: 88.3697 },
  "salt lake & new town": { lat: 22.585, lng: 88.445 },
  "suburban megastars": { lat: 22.68, lng: 88.42 },
  "local area": { lat: 22.56, lng: 88.36 },
};

export function resolveCoordinates(
  record?: Pick<PublicProfileRecord, "area" | "pujaPreferences"> | null
): { lat: number; lng: number } {
  const defaultCoord = { lat: 22.5726, lng: 88.3639 };
  if (!record) return defaultCoord;

  const areaStr = (record.area || "").toLowerCase().trim();
  if (areaStr) {
    const keys = Object.keys(KOLKATA_COORDINATES).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (areaStr.includes(key)) {
        return KOLKATA_COORDINATES[key];
      }
    }
  }

  const zoneStr = (record.pujaPreferences?.favoritePandalZone || "").toLowerCase().trim();
  if (zoneStr) {
    for (const [zoneKey, coord] of Object.entries(ZONE_COORDINATES)) {
      if (zoneStr.includes(zoneKey)) {
        return coord;
      }
    }
  }

  return defaultCoord;
}

export function getHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function computeDistanceKm(
  me: Pick<PublicProfileRecord, "area" | "pujaPreferences"> | null | undefined,
  them: Pick<PublicProfileRecord, "area" | "pujaPreferences">,
  seed = ""
): number {
  const themCoord = resolveCoordinates(them);

  if (!me) {
    const central = { lat: 22.5516, lng: 88.3524 }; // Park Street
    const raw = getHaversineDistanceKm(central.lat, central.lng, themCoord.lat, themCoord.lng);
    return Math.max(1, Math.round(raw) || 2);
  }

  const meCoord = resolveCoordinates(me);
  const rawKm = getHaversineDistanceKm(meCoord.lat, meCoord.lng, themCoord.lat, themCoord.lng);

  // If in the exact same neighborhood / centroid (< 0.8 km):
  // Never show 0 km! Match real dating apps (minimum 1 km, deterministic jitter 1-2 km)
  if (rawKm < 0.8) {
    if (seed) {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
      }
      return (Math.abs(hash) % 2) + 1; // 1 or 2 km
    }
    return 1;
  }

  return Math.max(1, Math.round(rawKm));
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
    prompts: Array.isArray(record.prompts)
      ? record.prompts
          .filter((prompt) => prompt && typeof prompt.answer === "string")
          .map((prompt, index) => ({
            question: PROMPT_QUESTIONS[index] || prompt.question,
            answer: prompt.answer,
          }))
      : [],
    gender: (preferences as any).gender || (record.pujaPreferences as any)?.gender || undefined,
    interestedIn: (preferences as any).interestedIn || (record.pujaPreferences as any)?.interestedIn || undefined,
    verified: Boolean(
      record.collegeVerified ||
      (typeof window !== "undefined" && window.localStorage.getItem(`ishqyara_verified_${uid}`) === "true")
    ),
    distanceKm: computeDistanceKm(me, record, uid),
  };
}

export const DEFAULT_PUJA: PujaPreferences = {
  crowdComfort: "Balanced Explorer",
  favoritePandalZone: "South Kolkata Theme",
  foodPriority: "Puchka & Rolls First",
  timing: "Sunset to Midnight (5 PM - 12 AM)",
  gender: "Man",
  interestedIn: "Women",
};

export const GENDER_OPTIONS = ["Man", "Woman", "Non-binary / More"] as const;
export const INTERESTED_IN_OPTIONS = ["Men", "Women", "Everyone"] as const;

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
  "My perfect puja date would be",
  "This puja i'm looking for someone who...",
  "Pandal hopping with me means...",
];
