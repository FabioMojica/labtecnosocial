import axios from "axios";
import dotenv from "dotenv";
import { normalizeGetAPIsData } from "../../utils/normalizeGetAPIsData.js";
import { ERROR_CODES, errorResponse, successResponse } from "../../utils/apiResponse.js";
import { resolveDateRange } from '../../utils/resolveDateRange.js';
import { getFacebookPageAccessToken } from './utils/getFacebookPageAccessToken.js'
import { formatInsights } from "./utils/formatInsights.js";
import { formatPopularPosts } from "./utils/formatPosts.js";

dotenv.config();

const { FACEBOOK_TOKEN } = process.env;
const GRAPH_VERSION = "v17.0";
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

export const getFacebookPages = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/me/accounts`, {
      params: {
        access_token: FACEBOOK_TOKEN,
        fields: "id,name,link,picture{url}"
      }
    }
    );

    const normalized = normalizeGetAPIsData('facebook', { pages: response.data.data });

    return res.status(200).json(normalized);
  } catch (error) {
    console.error("Error obteniendo páginas de Facebook:", error.response?.data || error.message);
    return res.status(500).json({ error: "No se pudieron obtener las páginas" });
  }
};

export const getFacebookPageOverview = async (req, res) => {
  try {
    const { pageId } = req.params;

    const response = await axios.get(`${BASE_URL}/${pageId}`, {
      params: {
        access_token: FACEBOOK_TOKEN,
        fields: "id,name,fan_count,followers_count,link,picture{url}",
      },
    });

    return (
      successResponse(
        res,
        response?.data,
        "Overview de la página de facebook recuperado exitosamente.",
        200
      )
    );

  } catch (error) {
    console.error(
      "Error obteniendo overview:",
      error.response?.data || error.message
    );
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor.',
      500
    );
  }
};


export const getFacebookPageInsights = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { range = "lastMonth" } = req.query;

    const pageAccessToken = getFacebookPageAccessToken(pageId);

    const intervals = resolveDateRange(range);

    // Métricas normales (no aceptan breakdown)
    const normalMetrics = [
      "page_follows",
      "page_views_total",
      "page_follows_country",
      "page_follows_city",
      "page_actions_post_reactions_total",
      "page_total_actions",
      "page_post_engagements",
    ];
    // Métricas con breakdown
    const breakdownMetrics = ["page_media_view"];

    let allInsights = [];

    // 1️⃣ Métricas normales
    for (const interval of intervals) {
      const params = {
        access_token: pageAccessToken,
        metric: normalMetrics.join(","),
        period: "day",
      };
      if (interval.since) params.since = interval.since;
      if (interval.until) params.until = interval.until;

      const response = await axios.get(`${BASE_URL}/${pageId}/insights`, { params });
      allInsights = allInsights.concat(response.data.data);
    }

    // 2️⃣ Métricas con breakdown
    for (const interval of intervals) {
      const params = {
        access_token: pageAccessToken,
        metric: breakdownMetrics.join(","),
        period: "day",
        breakdown: "is_from_ads",
      };
      if (interval.since) params.since = interval.since;
      if (interval.until) params.until = interval.until;

      const response = await axios.get(`${BASE_URL}/${pageId}/insights`, { params });
      allInsights = allInsights.concat(response.data.data);
    }

 
    const formattedInsights = formatInsights(allInsights)

    return successResponse(res, formattedInsights, "Insights de la página recuperados exitosamente.", 200);

  } catch (error) {
    console.error(
      "Error obteniendo insights:",
      error.response?.data || error.message
    );
    return errorResponse(res, ERROR_CODES.SERVER_ERROR, error.message, 500);
  }
};
 
export const getFacebookPagePosts = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { range = "lastMonth" } = req.query;

    const pageAccessToken = getFacebookPageAccessToken(pageId);
    const [{ since, until }] = resolveDateRange(range);

    const sinceDate = since ? new Date(`${since}T00:00:00Z`) : null;
    const untilDate = until ? new Date(`${until}T23:59:59Z`) : null;

    let allPosts = [];
    let nextUrl = `${BASE_URL}/${pageId}/posts`;

    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        params: {
          access_token: pageAccessToken,
          limit: 25,
          fields: `
            id,
            message,
            story,
            created_time,
            updated_time,
            scheduled_publish_time,
            permalink_url,
            full_picture, 
            is_published,
            is_hidden,
            is_popular,
            is_eligible_for_promotion,
            comments.summary(total_count).limit(0),
            reactions.summary(total_count).limit(0),
            reactions.type(LIKE).summary(total_count).limit(0).as(reactions_like),
            reactions.type(LOVE).summary(total_count).limit(0).as(reactions_love),
            reactions.type(WOW).summary(total_count).limit(0).as(reactions_wow),
            reactions.type(HAHA).summary(total_count).limit(0).as(reactions_haha),
            reactions.type(SAD).summary(total_count).limit(0).as(reactions_sad),
            reactions.type(ANGRY).summary(total_count).limit(0).as(reactions_angry),
            shares,
            attachments{title,description}
          `
        },
      });

      const posts = response.data.data;
      if (!posts.length) break;

      for (const post of posts) {
        const createdTime = new Date(post.created_time);

        if (
          (!sinceDate || createdTime >= sinceDate) &&
          (!untilDate || createdTime <= untilDate)
        ) {
          allPosts.push(post);
        }
      }

      const lastPostDate = new Date(
        posts[posts.length - 1].created_time
      );

      if (sinceDate && lastPostDate < sinceDate) break;
 
      nextUrl = response.data.paging?.next || null;
    }

    const popularPosts = formatPopularPosts(allPosts, 5);

    return successResponse(
      res,
      popularPosts,
      "Posts recuperados exitosamente.",
      200
    );
  } catch (error) {
    console.error("Error obteniendo posts:", error.response?.data || error.message);
    return errorResponse(res, ERROR_CODES.SERVER_ERROR, error.message, 500);
  }
};
