import axios from "axios";
import dotenv from "dotenv";
import { normalizeGetAPIsData } from "../../utils/normalizeGetAPIsData.js";
import { ERROR_CODES, errorResponse, successResponse } from "../../utils/apiResponse.js";
import { resolveDateRange } from '../../utils/resolveDateRange.js';
import { getFacebookPageAccessToken } from './utils/getFacebookPageAccessToken.js'
import { formatInsights } from "./utils/formatInsights.js";

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

    const metrics = [
      "page_media_view",
      "page_follows",
      "page_follows_country"
    ];

    let allInsights = [];

    for (const interval of intervals) {
      const params = {
        access_token: pageAccessToken,
        metric: metrics.join(","),
        period: "day",
      };
      if (interval.since) params.since = interval.since;
      if (interval.until) params.until = interval.until;

      const response = await axios.get(
        `${BASE_URL}/${pageId}/insights`,
        { params }
      );

      allInsights = allInsights.concat(response.data.data);
    }

    const formattedInsights = formatInsights(allInsights)
 
    return successResponse(res, formattedInsights, "OK", 200);

  } catch (error) {
    console.error("Error obteniendo insights:", error);
    return errorResponse(res, ERROR_CODES.SERVER_ERROR, error.message, 500);
  }
};


export const getFacebookPagePosts = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { limit = 10 } = req.query;

    const response = await axios.get(`${BASE_URL}/${pageId}/posts`, {
      params: {
        access_token: FACEBOOK_TOKEN,
        limit,
        fields:
          "id,message,created_time,full_picture,permalink_url," +
          "insights.metric(post_impressions,post_engaged_users)," +
          "shares,reactions.summary(true),comments.summary(true)",
      },
    });

    return res.status(200).json(response.data.data);
  } catch (error) {
    console.error(
      "Error obteniendo posts:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "No se pudieron obtener los posts" });
  }
};
