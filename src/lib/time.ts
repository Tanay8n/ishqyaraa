export function formatConversationTime(timestamp?: string | number | null): string {
  if (!timestamp) return "New";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "New";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfDate) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function formatMessageTime(timestamp?: string | number | Date | null): string {
  if (!timestamp) return "";
  const date = typeof timestamp === "number" || timestamp instanceof Date ? new Date(timestamp) : new Date(timestamp);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatChatDateHeader(timestamp?: string | number | Date | null): string {
  if (!timestamp) return "";
  const date = typeof timestamp === "number" || timestamp instanceof Date ? new Date(timestamp) : new Date(timestamp);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfDate) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function isDifferentChatDay(
  currentTimestamp?: string | number | null,
  previousTimestamp?: string | number | null
): boolean {
  if (!currentTimestamp) return false;
  if (!previousTimestamp) return true;
  const d1 = new Date(currentTimestamp);
  const d2 = new Date(previousTimestamp);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
  return (
    d1.getDate() !== d2.getDate() ||
    d1.getMonth() !== d2.getMonth() ||
    d1.getFullYear() !== d2.getFullYear()
  );
}
