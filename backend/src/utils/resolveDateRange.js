
import { subDays, subWeeks, subMonths, differenceInDays, addDays } from "date-fns";

const MAX_DAYS = 93;

const toFacebookDate = (date) =>
  date.toISOString().split("T")[0];

export const resolveDateRange = (range) => {
  const now = new Date();

  if (range === "all") {
    return [{}];
  }

  let start;
  let end = now;

  switch (range) {
    case "today":
      start = subDays(now, 2);
      break;
    case "lastWeek":
      start = subWeeks(now, 1);
      break;
    case "lastMonth":
      start = subMonths(now, 1);
      break;
    case "lastSixMonths":
      start = subMonths(now, 6);
      break;
    default:
      start = subMonths(now, 1);
  }

  const totalDays = differenceInDays(end, start);

  if (totalDays <= MAX_DAYS) {
    return [{ since: toFacebookDate(start), until: toFacebookDate(end) }];
  }

  const intervals = [];
  let chunkEnd = end;
  let chunkStart;

  while (differenceInDays(chunkEnd, start) > 0) {
    chunkStart = subDays(chunkEnd, MAX_DAYS); 
    if (differenceInDays(chunkStart, start) < 0) {
      chunkStart = start;
    }
    intervals.push({
      since: toFacebookDate(chunkStart),
      until: toFacebookDate(chunkEnd)
    });
    chunkEnd = subDays(chunkStart, 1);
  }

  return intervals;
};
