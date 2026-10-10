import type { PublicProfileRecord } from "@/lib/schema";

export type ProfileRow = {
  id: string;
  display_name: string;
  age: number;
  college: string;
  area: string;
  bio: string;
  tagline: string;
  intention: PublicProfileRecord["intention"];
  looking_for: PublicProfileRecord["lookingFor"];
  interests: string[];
  photo_urls: string[];
  puja_preferences: PublicProfileRecord["pujaPreferences"];
  prompts: PublicProfileRecord["prompts"];
  profile_complete: boolean;
  college_verified: boolean;
  created_at: string;
  updated_at: string;
};

export function fromProfileRow(row: ProfileRow): PublicProfileRecord {
  return {
    displayName: row.display_name,
    age: Number(row.age),
    college: row.college,
    area: row.area,
    bio: row.bio,
    tagline: row.tagline,
    intention: row.intention,
    lookingFor: row.looking_for || [],
    interests: row.interests || [],
    photoURLs: row.photo_urls || [],
    pujaPreferences: row.puja_preferences,
    prompts: row.prompts || [],
    profileComplete: row.profile_complete,
    collegeVerified: row.college_verified,
    createdAt: Date.parse(row.created_at) || 0,
    updatedAt: Date.parse(row.updated_at) || 0,
  };
}
