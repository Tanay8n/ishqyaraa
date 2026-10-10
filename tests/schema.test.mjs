import test from "node:test";
import assert from "node:assert/strict";
import { ageFromDateOfBirth, isAdult } from "../src/lib/schema.ts";

test("age calculation handles the eighteenth birthday and future dates", () => {
  const now = new Date("2026-10-09T12:00:00.000Z");
  assert.equal(ageFromDateOfBirth("2008-10-09", now), 18);
  assert.equal(ageFromDateOfBirth("2008-10-10", now), 17);
  assert.equal(ageFromDateOfBirth("2000-10-08", now), 26);
  assert.equal(isAdult("1900-01-01"), true);
  assert.equal(isAdult("2999-01-01"), false);
});

test("invalid calendar dates are rejected instead of being normalized", () => {
  assert.equal(ageFromDateOfBirth("2000-02-30", new Date("2026-10-09T12:00:00.000Z")), -1);
  assert.equal(ageFromDateOfBirth("2000-13-01"), -1);
  assert.equal(ageFromDateOfBirth("2000-1-01"), -1);
});
