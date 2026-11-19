import type { getCalendarFeeds } from "@tasks/_fetchers/calendar-feed";

export type CalendarFeed = Awaited<ReturnType<typeof getCalendarFeeds>>[number];
