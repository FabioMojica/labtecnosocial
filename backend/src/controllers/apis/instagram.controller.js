import axios from "axios";
import dotenv from "dotenv";
import { normalizeGetAPIsData } from "../../utils/normalizeGetAPIsData.js";
import { ERROR_CODES, errorResponse, successResponse } from "../../utils/apiResponse.js";
import { resolveDateRange } from "../../utils/resolveDateRange.js";
import { formatInsights } from "./utils/formatInsights.js";

dotenv.config();

const { INSTAGRAM_TOKEN } = process.env;
const GRAPH_VERSION = "v17.0";
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;
const INSTAGRAM_INSIGHTS_MAX_DAYS = 30;
const INSTAGRAM_TOP_POST_CANDIDATES_DEFAULT = 20;
const INSTAGRAM_TOP_POST_CANDIDATES_HEAVY_RANGE = 10;

function toIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}

function addDaysToIsoDate(isoDate, days = 0) {
  if (!isoDate) return null;
  const baseDate = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(baseDate.getTime())) return null;
  baseDate.setUTCDate(baseDate.getUTCDate() + days);
  return toIsoDate(baseDate);
}

function getInstagramMediaTypeLabel(type = "") {
  switch (String(type || "").toUpperCase()) {
    case "IMAGE":
      return "Imagen";
    case "VIDEO":
      return "Video";
    case "REELS":
      return "Reel";
    case "CAROUSEL_ALBUM":
      return "Carrusel";
    default:
      return "Otro";
  }
}

function getRangeBounds(range = "lastMonth") {
  const intervals = resolveDateRange(range);
  const latestChunk = intervals[0] || {};
  const oldestChunk = intervals[intervals.length - 1] || {};

  return {
    since: oldestChunk.since,
    until: latestChunk.until,
    intervals,
  };
}

function splitIntervalInDays(interval = {}, maxDays = INSTAGRAM_INSIGHTS_MAX_DAYS) {
  const since = interval?.since;
  const until = interval?.until;

  if (!since || !until) return [interval];

  const startDate = new Date(`${since}T00:00:00Z`);
  const endDate = new Date(`${until}T00:00:00Z`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return [interval];
  }

  const chunks = [];
  let chunkStart = new Date(startDate);

  while (chunkStart <= endDate) {
    const chunkEnd = new Date(chunkStart);
    chunkEnd.setUTCDate(chunkEnd.getUTCDate() + maxDays - 1);
    if (chunkEnd > endDate) chunkEnd.setTime(endDate.getTime());

    chunks.push({
      since: toIsoDate(chunkStart),
      until: toIsoDate(chunkEnd),
    });

    chunkStart = new Date(chunkEnd);
    chunkStart.setUTCDate(chunkStart.getUTCDate() + 1);
  }

  return chunks;
}

function getInstagramInsightIntervals(range = "lastMonth") {
  const { intervals } = getRangeBounds(range);
  return intervals
    .flatMap((interval) => splitIntervalInDays(interval))
    .sort((a, b) => new Date(`${a?.since}T00:00:00Z`) - new Date(`${b?.since}T00:00:00Z`));
}

function safeNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (value && typeof value === "object") {
    return Object.values(value).reduce((acc, current) => acc + safeNumber(current), 0);
  }
  return 0;
}

function pickInstagramPreviewUrl(item = {}) {
  const mediaType = item?.media_type;
  const children = Array.isArray(item?.children?.data) ? item.children.data : [];
  const firstChildWithPreview = children.find((child) => child?.thumbnail_url || child?.media_url);

  const childPreview = firstChildWithPreview?.thumbnail_url || firstChildWithPreview?.media_url || null;
  const directImage = item?.media_url || null;
  const thumbnail = item?.thumbnail_url || null;

  if (mediaType === "VIDEO" || mediaType === "REELS") {
    return thumbnail || childPreview || directImage || null;
  }

  if (mediaType === "CAROUSEL_ALBUM") {
    return thumbnail || directImage || childPreview || null;
  }

  return directImage || thumbnail || childPreview || null;
}
function getInsightValue(metricData = {}) {
  const firstValue = Array.isArray(metricData?.values) ? metricData.values[0] : null;
  if (firstValue && typeof firstValue === "object") {
    return safeNumber(firstValue.value);
  }
  if (firstValue !== null && firstValue !== undefined) {
    return safeNumber(firstValue);
  }
  return safeNumber(metricData?.value);
}

function normalizeTotalValueInsightRow(row = {}, metricName = "", interval = {}) {
  if (!row || typeof row !== "object") return null;

  const name = row?.name || metricName;
  if (!name) return null;

  const totalValue = safeNumber(row?.total_value?.value);
  const endTime = interval?.until
    ? `${interval.until}T23:59:59+0000`
    : new Date().toISOString();

  return {
    name,
    period: "day",
    title: row?.title,
    description: row?.description,
    id: row?.id,
    values: [
      {
        value: totalValue,
        end_time: endTime,
      },
    ],
  };
}

async function fetchInstagramMediaInsightsByIds(mediaIds = []) {
  const uniqueIds = [...new Set(mediaIds.filter(Boolean))];
  if (uniqueIds.length === 0) return {};

  const entries = await Promise.all(
    uniqueIds.map(async (mediaId) => {
      try {
        const response = await axios.get(`${BASE_URL}/${mediaId}/insights`, {
          params: {
            access_token: INSTAGRAM_TOKEN,
            metric: "likes,comments,shares,saved,total_interactions",
          },
        });

        const metrics = Array.isArray(response?.data?.data) ? response.data.data : [];
        const normalized = metrics.reduce((acc, metric) => {
          if (!metric?.name) return acc;
          acc[metric.name] = getInsightValue(metric);
          return acc;
        }, {});

        return [mediaId, normalized];
      } catch (error) {
        console.warn(
          `No se pudo obtener insights del media ${mediaId}:`,
          error.response?.data?.error?.message || error.message
        );
        return [mediaId, null];
      }
    })
  );

  return entries.reduce((acc, [mediaId, metrics]) => {
    if (metrics) acc[mediaId] = metrics;
    return acc;
  }, {});
}

function mapMediaToTopPosts(media = [], mediaInsightsById = {}, options = {}) {
  const limit = Number.isInteger(options?.limit) && options.limit > 0
    ? options.limit
    : Number.POSITIVE_INFINITY;

  return media
    .map((item) => {
      const mediaInsights = mediaInsightsById?.[item?.id] || {};
      const likeCount = mediaInsights?.likes ?? safeNumber(item?.like_count);
      const commentsCount = mediaInsights?.comments ?? safeNumber(item?.comments_count);
      const sharesCount = mediaInsights?.shares ?? 0;
      const savesCount = mediaInsights?.saved ?? 0;
      const totalInteractions =
        mediaInsights?.total_interactions ??
        likeCount + commentsCount + sharesCount + savesCount;
      const popularityScore =
        likeCount + commentsCount * 2 + sharesCount * 3 + savesCount * 2;
      const previewUrl = pickInstagramPreviewUrl(item);

      return {
        id: item?.id,
        message: typeof item?.caption === "string" ? item.caption : "",
        created_time: item?.timestamp,
        updated_time: item?.timestamp,
        permalink_url: item?.permalink,
        full_picture: previewUrl,
        reactions: {
          byType: {
            LIKE: likeCount,
          },
          total: likeCount,
        },
        comments: commentsCount,
        shares: sharesCount,
        popularityScore,
        meta: {
          media_type: item?.media_type,
          thumbnail_url: item?.thumbnail_url || null,
          saves: savesCount,
          total_interactions: totalInteractions,
        },
      };
    })
    .filter((post) => post.popularityScore > 0)
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit);
}

function buildInstagramMediaAnalytics(media = []) {
  const byDateMap = {};
  const byTypeMap = {};

  for (const item of media) {
    const date = toIsoDate(item?.timestamp);
    if (!date) continue;

    const likes = safeNumber(item?.like_count);
    const comments = safeNumber(item?.comments_count);
    const interactions = likes + comments;
    const mediaType = getInstagramMediaTypeLabel(item?.media_type);

    if (!byDateMap[date]) {
      byDateMap[date] = {
        date,
        posts: 0,
        likes: 0,
        comments: 0,
        interactions: 0,
      };
    }
    byDateMap[date].posts += 1;
    byDateMap[date].likes += likes;
    byDateMap[date].comments += comments;
    byDateMap[date].interactions += interactions;

    if (!byTypeMap[mediaType]) {
      byTypeMap[mediaType] = {
        type: mediaType,
        posts: 0,
        likes: 0,
        comments: 0,
        interactions: 0,
      };
    }
    byTypeMap[mediaType].posts += 1;
    byTypeMap[mediaType].likes += likes;
    byTypeMap[mediaType].comments += comments;
    byTypeMap[mediaType].interactions += interactions;
  }

  const byDate = Object.values(byDateMap).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const byMediaType = Object.values(byTypeMap)
    .map((item) => ({
      ...item,
      avgInteractionsPerPost: item.posts > 0 ? item.interactions / item.posts : 0,
    }))
    .sort((a, b) => b.interactions - a.interactions);

  return {
    byDate,
    byMediaType,
  };
}

export const getInstagramPages = async (req, res) => {
  try {
    const fbResponse = await axios.get(`${BASE_URL}/me/accounts`, {
      params: {
        access_token: INSTAGRAM_TOKEN,
        fields: "id,name,instagram_business_account",
      },
    });

    const pages = fbResponse.data.data || [];
    const igPages = pages.filter((page) => page.instagram_business_account?.id);

    const instagramPages = await Promise.all(
      igPages.map(async (page) => {
        try {
          const igId = page.instagram_business_account.id;
          const igResponse = await axios.get(`${BASE_URL}/${igId}`, {
            params: {
              fields: "username,profile_picture_url",
              access_token: INSTAGRAM_TOKEN,
            },
          });

          const username = igResponse.data.username;
          const imageUrl = igResponse.data.profile_picture_url;

          return {
            id: igId,
            name: page.name,
            url: `https://www.instagram.com/${username}`,
            image_url: imageUrl,
          };
        } catch (err) {
          console.error(`Error obteniendo username de ${page.name}:`, err.response?.data || err.message);
          return {
            id: page.instagram_business_account.id,
            name: page.name,
            url: `https://www.instagram.com/${page.name.replace(/\s+/g, "").toLowerCase()}`,
          };
        }
      })
    );

    const normalizedData = normalizeGetAPIsData("instagram", { pages: instagramPages });
    return res.status(200).json(normalizedData);
  } catch (error) {
    console.error("Error obteniendo paginas de Instagram:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "No se pudieron obtener las paginas de Instagram",
      error: error.response?.data || error.message,
    });
  }
};

export const getInstagramOverview = async (req, res) => {
  try {
    const { instagramId } = req.params;

    const response = await axios.get(`${BASE_URL}/${instagramId}`, {
      params: {
        access_token: INSTAGRAM_TOKEN,
        fields: "id,username,name,profile_picture_url,followers_count,follows_count,media_count",
      },
    });

    return successResponse(
      res,
      response?.data,
      "Overview de la cuenta de Instagram recuperado exitosamente.",
      200
    );
  } catch (error) {
    console.error("Error obteniendo overview de Instagram:", error.response?.data || error.message);
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      "Error del servidor.",
      500
    );
  }
};

export const getInstagramInsights = async (req, res) => {
  try {
    const { instagramId } = req.params;
    const { range = "lastMonth" } = req.query;

    const intervals = getInstagramInsightIntervals(range);
    const dailyMetrics = ["reach"];
    const totalValueMetrics = [
      "accounts_engaged",
      "profile_views",
      "profile_links_taps",
      "website_clicks",
      "total_interactions",
      "likes",
      "comments",
      "shares",
      "saves",
      "replies",
      "reposts",
    ];
    const allInsights = [];

    for (const metric of dailyMetrics) {
      const intervalRequests = intervals.map((interval) => {
        const params = {
          access_token: INSTAGRAM_TOKEN,
          metric,
          period: "day",
        };

        if (interval?.since) params.since = interval.since;
        if (interval?.until) params.until = interval.until;

        return {
          interval,
          request: axios.get(`${BASE_URL}/${instagramId}/insights`, { params }),
        };
      });

      const intervalResults = await Promise.allSettled(
        intervalRequests.map(({ request }) => request)
      );

      intervalResults.forEach((result) => {
        if (result.status === "fulfilled") {
          const rows = Array.isArray(result.value?.data?.data) ? result.value.data.data : [];
          if (rows.length > 0) {
            allInsights.push(...rows);
          }
          return;
        }

        const metricError = result.reason;
        if (metricError?.response?.status !== 400) {
          console.warn(
            `Metrica diaria de Instagram no disponible (${metric}):`,
            metricError.response?.data?.error?.message || metricError.message
          );
        }
      });
    }

    const totalMetricRequests = totalValueMetrics.flatMap((metric) =>
      intervals.map((interval) => {
        const params = {
          access_token: INSTAGRAM_TOKEN,
          metric,
          period: "day",
          metric_type: "total_value",
        };

        if (interval?.since) params.since = interval.since;
        if (interval?.until) params.until = interval.until;

        return {
          metric,
          interval,
          request: axios.get(`${BASE_URL}/${instagramId}/insights`, { params }),
        };
      })
    );

    const totalMetricResults = await Promise.allSettled(
      totalMetricRequests.map(({ request }) => request)
    );

    totalMetricResults.forEach((result, index) => {
      const metric = totalMetricRequests[index]?.metric;
      const interval = totalMetricRequests[index]?.interval;

      if (result.status === "fulfilled") {
        const rows = Array.isArray(result.value?.data?.data) ? result.value.data.data : [];
        if (rows.length > 0) {
          rows.forEach((row) => {
            const normalizedRow = normalizeTotalValueInsightRow(row, metric, interval);
            if (normalizedRow) allInsights.push(normalizedRow);
          });
        }
        return;
      }

      const metricError = result.reason;
      if (metricError?.response?.status !== 400) {
        console.warn(
          `Metrica total de Instagram no disponible (${metric}):`,
          metricError.response?.data?.error?.message || metricError.message
        );
      }
    });

    const formattedInsights = formatInsights(allInsights);

    return successResponse(
      res,
      formattedInsights,
      "Insights de Instagram recuperados exitosamente.",
      200
    );
  } catch (error) {
    console.error("Error obteniendo insights de Instagram:", error.response?.data || error.message);
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      error.message,
      500
    );
  }
};

export const getInstagramMedia = async (req, res) => {
  try {
    const { instagramId } = req.params;
    const { range = "lastMonth" } = req.query;
    const { since, until } = getRangeBounds(range);
    // IG media endpoint requires since < until. For "today" both dates are equal.
    // We query with an exclusive upper bound (tomorrow) and then keep local filtering
    // with the original inclusive [since, until] range.
    const mediaUntilParam = since && until && since === until
      ? addDaysToIsoDate(until, 1)
      : until;

    let allMedia = [];
    let nextUrl = `${BASE_URL}/${instagramId}/media`;

    const firstParams = {
      access_token: INSTAGRAM_TOKEN,
      limit: 50,
      fields:
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,children{media_type,media_url,thumbnail_url}",
    };

    if (since) firstParams.since = since;
    if (mediaUntilParam) firstParams.until = mediaUntilParam;

    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        params: nextUrl === `${BASE_URL}/${instagramId}/media` ? firstParams : undefined,
      });

      const mediaBatch = Array.isArray(response?.data?.data) ? response.data.data : [];
      allMedia = allMedia.concat(mediaBatch);

      nextUrl = response?.data?.paging?.next || null;
    }

    const sinceDate = since ? new Date(`${since}T00:00:00`) : null;
    const untilDate = until ? new Date(`${until}T23:59:59.999`) : null;

    if (sinceDate || untilDate) {
      allMedia = allMedia.filter((item) => {
        const timestamp = new Date(item?.timestamp);
        if (Number.isNaN(timestamp.getTime())) return false;
        if (sinceDate && timestamp < sinceDate) return false;
        if (untilDate && timestamp > untilDate) return false;
        return true;
      });
    }

    const totals = allMedia.reduce(
      (acc, item) => {
        const likes = safeNumber(item?.like_count);
        const comments = safeNumber(item?.comments_count);
        acc.posts += 1;
        acc.likes += likes;
        acc.comments += comments;
        acc.interactions += likes + comments;
        return acc;
      },
      { posts: 0, likes: 0, comments: 0, interactions: 0 }
    );

    const analytics = buildInstagramMediaAnalytics(allMedia);
    const topPostCandidatesLimit =
      range === "lastSixMonths"
        ? INSTAGRAM_TOP_POST_CANDIDATES_HEAVY_RANGE
        : INSTAGRAM_TOP_POST_CANDIDATES_DEFAULT;

    const topCandidateIds = mapMediaToTopPosts(allMedia, {}, { limit: topPostCandidatesLimit })
      .map((post) => post?.id)
      .filter(Boolean);
    const mediaInsightsById = await fetchInstagramMediaInsightsByIds(topCandidateIds);

    const payload = {
      media: allMedia,
      totals,
      analytics,
      topPosts: mapMediaToTopPosts(allMedia, mediaInsightsById, { limit: 5 }),
      meta: {
        range,
        since: toIsoDate(since),
        until: toIsoDate(until),
      },
    };

    return successResponse(
      res,
      payload,
      "Publicaciones de Instagram recuperadas exitosamente.",
      200
    );
  } catch (error) {
    console.error("Error obteniendo publicaciones de Instagram:", error.response?.data || error.message);
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      error.message,
      500
    );
  }
};

