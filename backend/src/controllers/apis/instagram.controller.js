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

function toIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
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

function safeNumber(value) {
  return Number(value) || 0;
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
function mapMediaToTopPosts(media = []) {
  return media
    .map((item) => {
      const likeCount = safeNumber(item?.like_count);
      const commentsCount = safeNumber(item?.comments_count);
      const sharesCount = 0;
      const popularityScore = likeCount + commentsCount * 2 + sharesCount * 3;
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
            LOVE: 0,
            WOW: 0,
            HAHA: 0,
            SAD: 0,
            ANGRY: 0,
          },
          total: likeCount,
        },
        comments: commentsCount,
        shares: sharesCount,
        popularityScore,
        meta: {
          media_type: item?.media_type,
          thumbnail_url: item?.thumbnail_url || null,
        },
      };
    })
    .filter((post) => post.popularityScore > 0)
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 5);
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

    const { intervals } = getRangeBounds(range);
    const metrics = ["follower_count", "reach", "impressions", "profile_views", "accounts_engaged"];

    const allInsights = [];

    for (const metric of metrics) {
      for (const interval of intervals) {
        const params = {
          access_token: INSTAGRAM_TOKEN,
          metric,
          period: "day",
        };

        if (interval?.since) params.since = interval.since;
        if (interval?.until) params.until = interval.until;

        try {
          const response = await axios.get(`${BASE_URL}/${instagramId}/insights`, { params });
          if (Array.isArray(response?.data?.data)) {
            allInsights.push(...response.data.data);
          }
        } catch (metricError) {
          // Some metrics may not be available for all account types; skip those metrics without breaking the dashboard.
          console.warn(
            `Metrica de Instagram no disponible (${metric}):`,
            metricError.response?.data?.error?.message || metricError.message
          );
        }
      }
    }

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

    let allMedia = [];
    let nextUrl = `${BASE_URL}/${instagramId}/media`;

    const firstParams = {
      access_token: INSTAGRAM_TOKEN,
      limit: 50,
      fields:
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,children{media_type,media_url,thumbnail_url}",
    };

    if (since) firstParams.since = since;
    if (until) firstParams.until = until;

    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        params: nextUrl === `${BASE_URL}/${instagramId}/media` ? firstParams : undefined,
      });

      const mediaBatch = Array.isArray(response?.data?.data) ? response.data.data : [];
      allMedia = allMedia.concat(mediaBatch);

      nextUrl = response?.data?.paging?.next || null;
    }

    const sinceDate = since ? new Date(`${since}T00:00:00Z`) : null;
    const untilDate = until ? new Date(`${until}T23:59:59Z`) : null;

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

    const payload = {
      media: allMedia,
      totals,
      analytics,
      topPosts: mapMediaToTopPosts(allMedia),
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

