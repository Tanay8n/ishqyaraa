import { readFile } from "node:fs/promises";
import { after, before, beforeEach, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { get, ref, set, update } from "firebase/database";

const projectId = "demo-ishqyaraa-rules";
let environment;

before(async () => {
  const rules = await readFile(new URL("../database.rules.json", import.meta.url), "utf8");
  environment = await initializeTestEnvironment({
    projectId,
    database: { host: "127.0.0.1", port: 9000, rules },
  });
});

beforeEach(async () => {
  await environment.clearDatabase();
  await environment.withSecurityRulesDisabled(async (context) => {
    await update(ref(context.database()), {
      "publicProfiles/alice": { displayName: "Alice", age: 21, college: "Example College", profileComplete: true, updatedAt: 1, createdAt: 1, collegeVerified: false },
      "publicProfiles/bob": { displayName: "Bob", age: 22, college: "Example College", profileComplete: true, updatedAt: 1, createdAt: 1, collegeVerified: false },
      "privateProfiles/alice": { dateOfBirth: "2005-01-01", email: "alice@example.test" },
      "privateProfiles/bob": { dateOfBirth: "2004-01-01", email: "bob@example.test" },
      "matches/alice_bob": { uidLow: "alice", uidHigh: "bob", participantIds: { alice: true, bob: true }, status: "active", createdAt: 1 },
      "messages/alice_bob/message-1": { senderUid: "alice", text: "Hello", createdAt: 1 },
      "matches/alice_carol": { uidLow: "alice", uidHigh: "carol", participantIds: { alice: true, carol: true }, status: "active", createdAt: 1 },
      "messages/alice_carol/message-1": { senderUid: "alice", text: "Private", createdAt: 1 },
    });
  });
});

after(async () => environment?.cleanup());

test("public profiles require authentication while authenticated discovery reads work", async () => {
  const guestDb = environment.unauthenticatedContext().database();
  const aliceDb = environment.authenticatedContext("alice").database();
  await assertFails(get(ref(guestDb, "publicProfiles")));
  await assertSucceeds(get(ref(aliceDb, "publicProfiles")));
});

test("private profile reads are limited to the owner", async () => {
  const aliceDb = environment.authenticatedContext("alice").database();
  const bobDb = environment.authenticatedContext("bob").database();
  await assertSucceeds(get(ref(aliceDb, "privateProfiles/alice")));
  await assertFails(get(ref(aliceDb, "privateProfiles/bob")));
  await assertFails(get(ref(bobDb, "privateProfiles/alice")));
});

test("clients cannot edit trusted profiles, likes, passes, or matches", async () => {
  const aliceDb = environment.authenticatedContext("alice").database();
  await assertFails(set(ref(aliceDb, "publicProfiles/alice/collegeVerified"), true));
  await assertFails(set(ref(aliceDb, "privateProfiles/alice/dateOfBirth"), "2001-01-01"));
  await assertFails(set(ref(aliceDb, "likes/alice/bob"), { createdAt: 2 }));
  await assertFails(set(ref(aliceDb, "passes/alice/bob"), { createdAt: 2 }));
  await assertFails(set(ref(aliceDb, "matches/fabricated"), { participantIds: { alice: true } }));
});

test("match and conversation reads require participant membership", async () => {
  const aliceDb = environment.authenticatedContext("alice").database();
  const bobDb = environment.authenticatedContext("bob").database();
  const carolDb = environment.authenticatedContext("carol").database();
  await assertSucceeds(get(ref(aliceDb, "matches/alice_bob")));
  await assertSucceeds(get(ref(bobDb, "messages/alice_bob")));
  await assertFails(get(ref(carolDb, "matches/alice_bob")));
  await assertFails(get(ref(carolDb, "messages/alice_bob")));
  await assertFails(set(ref(aliceDb, "messages/alice_bob/forged"), { senderUid: "bob", text: "forged", createdAt: 2 }));
});

test("reports can be submitted by their reporter but cannot be read by clients", async () => {
  const aliceDb = environment.authenticatedContext("alice").database();
  const report = { reporterUid: "alice", reportedUid: "bob", reason: "Spam", createdAt: 2 };
  await assertSucceeds(set(ref(aliceDb, "reports/report-1"), report));
  await assertFails(get(ref(aliceDb, "reports/report-1")));
  await assertFails(set(ref(aliceDb, "reports/report-2"), { ...report, reporterUid: "bob" }));
});

test("clients can manage only their own block entries and cannot edit the reverse index", async () => {
  const aliceDb = environment.authenticatedContext("alice").database();
  await assertSucceeds(set(ref(aliceDb, "blocks/alice/bob"), { createdAt: 2 }));
  await assertFails(set(ref(aliceDb, "blocks/bob/alice"), { createdAt: 2 }));
  await assertFails(set(ref(aliceDb, "blockedBy/alice/bob"), { createdAt: 2 }));
});
