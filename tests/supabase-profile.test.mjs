import test from "node:test";
import assert from "node:assert/strict";
import { fromProfileRow } from "../src/lib/supabase/profiles.ts";

test("database profile mapping exposes public fields only", () => {
  const profile = fromProfileRow({
    id: "00000000-0000-0000-0000-000000000001",
    display_name: "A Student",
    age: 21,
    college: "Example College",
    area: "Kolkata",
    bio: "Hello",
    tagline: "Adda first",
    intention: "Friendship",
    looking_for: ["Friendship"],
    interests: ["Music"],
    photo_urls: ["profile-photos/uid/image.webp"],
    puja_preferences: { crowdComfort: "Balanced Explorer", favoritePandalZone: "South Kolkata Theme", foodPriority: "Puchka & Rolls First", timing: "Early Bird" },
    prompts: [],
    profile_complete: true,
    college_verified: false,
    created_at: "2026-10-09T00:00:00.000Z",
    updated_at: "2026-10-09T00:00:00.000Z",
    email: "private@example.test",
    date_of_birth: "2000-01-01",
  });

  assert.equal(profile.displayName, "A Student");
  assert.equal(profile.photoURLs[0], "profile-photos/uid/image.webp");
  assert.equal("email" in profile, false);
  assert.equal("dateOfBirth" in profile, false);
});
