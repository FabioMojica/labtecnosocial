
import { differenceInDays, subDays } from "date-fns";

const MAX_DAYS = 93;

const toFacebookDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const resolveDateRange = (range) => {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  if (range === "all") {
    return [{}];
  }

  let windowDays;

  switch (range) {
    case "today":
      windowDays = 1;
      break;
    case "lastWeek":
      windowDays = 7;
      break;
    case "lastMonth":
      windowDays = 30;
      break;
    case "lastSixMonths":
      windowDays = 180;
      break;
    default:
      windowDays = 30;
  }

  const start = subDays(end, windowDays - 1);
  const totalDays = differenceInDays(end, start) + 1;

  if (totalDays <= MAX_DAYS) {
    return [{ since: toFacebookDate(start), until: toFacebookDate(end) }];
  }

  const intervals = [];
  let chunkEnd = end;

  while (chunkEnd >= start) {
    let chunkStart = subDays(chunkEnd, MAX_DAYS - 1);
    if (chunkStart < start) {
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
