import test from "node:test";
import assert from "node:assert/strict";
import {
  formatConversationTime,
  formatMessageTime,
  formatChatDateHeader,
  isDifferentChatDay,
} from "../src/lib/time.ts";

test("formatConversationTime formats today, yesterday, and older dates correctly", () => {
  const now = new Date();
  
  // Today's time should return time of day (contains AM or PM or digits)
  const todayResult = formatConversationTime(now.getTime());
  assert.ok(/\d+:\d+/.test(todayResult));

  // Yesterday
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0, 0);
  assert.equal(formatConversationTime(yesterday.getTime()), "Yesterday");

  // 3 days ago should be weekday abbreviation
  const threeDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 12, 0, 0);
  const threeDaysResult = formatConversationTime(threeDaysAgo.getTime());
  assert.ok(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].some((day) => threeDaysResult.includes(day)));

  // Null or undefined
  assert.equal(formatConversationTime(null), "New");
  assert.equal(formatConversationTime(undefined), "New");
  assert.equal(formatConversationTime("invalid-date"), "New");
});

test("formatMessageTime returns formatted hour and minute", () => {
  const testDate = new Date("2026-10-14T14:30:00.000Z");
  const result = formatMessageTime(testDate.getTime());
  assert.ok(/\d+:\d+/.test(result));
  assert.equal(formatMessageTime(null), "");
});

test("formatChatDateHeader returns Today, Yesterday, and day names", () => {
  const now = new Date();
  assert.equal(formatChatDateHeader(now.getTime()), "Today");

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 0, 0);
  assert.equal(formatChatDateHeader(yesterday.getTime()), "Yesterday");
});

test("isDifferentChatDay correctly identifies day boundaries", () => {
  const now = new Date("2026-10-14T10:00:00.000Z");
  const sameDay = new Date("2026-10-14T15:30:00.000Z");
  const nextDay = new Date("2026-10-15T09:00:00.000Z");

  assert.equal(isDifferentChatDay(sameDay.getTime(), now.getTime()), false);
  assert.equal(isDifferentChatDay(nextDay.getTime(), now.getTime()), true);
  assert.equal(isDifferentChatDay(now.getTime(), null), true);
});
