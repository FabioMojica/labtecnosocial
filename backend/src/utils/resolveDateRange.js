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
      start = subDays(now, 1);
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

  // Si el rango es menor a MAX_DAYS, devolvemos un solo intervalo
  if (totalDays <= MAX_DAYS) {
    // return [{ since: start.toISOString(), until: end.toISOString() }];
    return [{ since: toFacebookDate(start), until: toFacebookDate(end) }];
  }

  // Si es mayor, dividimos en chunks de MAX_DAYS
  const intervals = [];
  let chunkEnd = end;
  let chunkStart;

  while (differenceInDays(chunkEnd, start) > 0) {
    chunkStart = subDays(chunkEnd, MAX_DAYS); 
    if (differenceInDays(chunkStart, start) < 0) {
      chunkStart = start; // último chunk
    }
    // intervals.push({ since: chunkStart.toISOString(), until: chunkEnd.toISOString() });
    intervals.push({
      since: toFacebookDate(chunkStart),
      until: toFacebookDate(chunkEnd)
    });
    chunkEnd = subDays(chunkStart, 1); // movemos para el siguiente chunk
  }

  return intervals;
};
