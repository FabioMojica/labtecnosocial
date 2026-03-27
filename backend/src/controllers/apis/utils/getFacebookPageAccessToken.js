import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const { FACEBOOK_TOKEN } = process.env;
const GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION || "v17.0";
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

const PAGE_TOKEN_TTL_MS = 15 * 60 * 1000;
const pageTokenCache = new Map();

function getLegacyPageTokenFromEnv(pageId) {
  const entries = Object.entries(process.env);
  const match = entries.find(([key]) => key.includes(`_${pageId}`));
  return match?.[1] || null;
}

async function findPageTokenInAccounts(pageId) {
  let nextUrl = `${BASE_URL}/me/accounts`;
  let params = {
    access_token: FACEBOOK_TOKEN,
    fields: "id,access_token",
    limit: 100,
  };

  while (nextUrl) {
    const response = await axios.get(nextUrl, { params });
    const pages = Array.isArray(response?.data?.data) ? response.data.data : [];

    const page = pages.find((item) => String(item?.id) === String(pageId));
    if (page?.access_token) {
      return page.access_token;
    }

    nextUrl = response?.data?.paging?.next || null;
    // paginated URLs already include query params
    params = undefined;
  }

  return null;
}

async function findPageTokenDirect(pageId) {
  const response = await axios.get(`${BASE_URL}/${pageId}`, {
    params: {
      access_token: FACEBOOK_TOKEN,
      fields: "access_token",
    },
  });

  return response?.data?.access_token || null;
}

export const getFacebookPageAccessToken = async (pageId) => {
  if (!pageId) {
    throw new Error("No pageId was received to resolve Facebook page token.");
  }

  const cached = pageTokenCache.get(String(pageId));
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  if (!FACEBOOK_TOKEN) {
    throw new Error("FACEBOOK_TOKEN is not configured.");
  }

  try {
    const tokenFromAccounts = await findPageTokenInAccounts(pageId);
    if (tokenFromAccounts) {
      pageTokenCache.set(String(pageId), {
        token: tokenFromAccounts,
        expiresAt: Date.now() + PAGE_TOKEN_TTL_MS,
      });
      return tokenFromAccounts;
    }
  } catch (error) {
    // Continue with fallback strategies.
  }

  try {
    const tokenDirect = await findPageTokenDirect(pageId);
    if (tokenDirect) {
      pageTokenCache.set(String(pageId), {
        token: tokenDirect,
        expiresAt: Date.now() + PAGE_TOKEN_TTL_MS,
      });
      return tokenDirect;
    }
  } catch (error) {
    // Continue with legacy fallback.
  }

  const legacyEnvToken = getLegacyPageTokenFromEnv(pageId);
  if (legacyEnvToken) {
    return legacyEnvToken;
  }

  throw new Error(
    `No token was resolved for page ${pageId}. Check Meta permissions for the authenticated token.`
  );
};
