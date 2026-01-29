import axios from "axios";
import dotenv from "dotenv";
import { normalizeGetAPIsData } from "../../utils/normalizeGetAPIsData.js";
 
dotenv.config();

const { FACEBOOK_TOKEN } = process.env;
const GRAPH_VERSION = "v17.0";
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

export const getFacebookPages = async (req, res) => {
  try {
     const response = await axios.get(`${BASE_URL}/me/accounts`, {
        params: {
          access_token: FACEBOOK_TOKEN, 
          // fields: "id,name,link" 
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

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error obteniendo overview:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "No se pudo obtener el overview" });
  }
};

export const getFacebookPageInsights = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { since, until } = req.query;

    const metrics = [
      "page_impressions",
      "page_impressions_organic",
      "page_impressions_paid",
      "page_engaged_users",
      "page_fans",
    ];

    const response = await axios.get(`${BASE_URL}/${pageId}/insights`, {
      params: {
        access_token: FACEBOOK_TOKEN,
        metric: metrics.join(","),
        since,
        until,
      },
    });

    return res.status(200).json(response.data.data);
  } catch (error) {
    console.error(
      "Error obteniendo insights:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "No se pudieron obtener insights" });
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
