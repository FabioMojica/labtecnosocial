import { TwitterApi } from "twitter-api-v2";
import { normalizeGetAPIsData } from "../../utils/normalizeGetAPIsData.js";
import { ERROR_CODES, errorResponse, successResponse } from "../../utils/apiResponse.js";
import { resolveDateRange } from "../../utils/resolveDateRange.js";

function createTwitterClient() {
  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });
}

function toIsoStart(day) {
  return day ? `${day}T00:00:00.000Z` : undefined;
}

function toIsoEnd(day) {
  return day ? `${day}T23:59:59.000Z` : undefined;
}

function toDateLabel(dayKey) {
  const [year, month, day] = dayKey.split("-");
  return `${day}/${month}/${year}`;
}

function safeNumber(value) {
  return Number(value) || 0;
}

function getPublicMetrics(tweet) {
  return tweet?.public_metrics || {};
}

function getTweetDayKey(tweet) {
  const createdAt = tweet?.created_at;
  if (typeof createdAt !== "string" || !createdAt.includes("T")) return null;
  return createdAt.split("T")[0];
}

function buildMetricFromTweets(tweets = [], extractor = () => 0) {
  const groupedByDate = tweets.reduce((acc, tweet) => {
    const dayKey = getTweetDayKey(tweet);
    if (!dayKey) return acc;

    if (!acc[dayKey]) acc[dayKey] = 0;
    acc[dayKey] += safeNumber(extractor(tweet));
    return acc;
  }, {});

  const orderedDayKeys = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const chartData = orderedDayKeys.map((dayKey) => groupedByDate[dayKey]);
  const dates = orderedDayKeys.map(toDateLabel);

  const total = chartData.reduce((acc, value) => acc + value, 0);
  const lastValue = chartData[chartData.length - 1] ?? 0;
  const previousValue = chartData[chartData.length - 2] ?? 0;

  return {
    chartData,
    dates,
    total,
    delta: chartData.length > 1 ? lastValue - previousValue : lastValue,
  };
}

function mapMediaByKey(media = []) {
  return media.reduce((acc, item) => {
    if (item?.media_key) {
      acc[item.media_key] = item;
    }
    return acc;
  }, {});
}

function mapTweetsToTopPosts(tweets = [], username = "", mediaByKey = {}) {
  return tweets
    .map((tweet) => {
      const metrics = getPublicMetrics(tweet);
      const likes = safeNumber(metrics.like_count);
      const replies = safeNumber(metrics.reply_count);
      const reposts = safeNumber(metrics.retweet_count);
      const quotes = safeNumber(metrics.quote_count);
      const popularityScore = likes + replies * 2 + reposts * 2 + quotes * 2;

      const firstMediaKey = tweet?.attachments?.media_keys?.[0];
      const media = firstMediaKey ? mediaByKey[firstMediaKey] : null;
      const mediaUrl = media?.url || media?.preview_image_url || null;

      return {
        id: tweet?.id,
        message: typeof tweet?.text === "string" ? tweet.text : "",
        created_time: tweet?.created_at,
        updated_time: tweet?.created_at,
        permalink_url: username ? `https://x.com/${username}/status/${tweet?.id}` : null,
        full_picture: mediaUrl,
        reactions: {
          byType: {
            LIKE: likes,
            LOVE: 0,
            WOW: 0,
            HAHA: 0,
            SAD: 0,
            ANGRY: 0,
          },
          total: likes,
        },
        comments: replies,
        shares: reposts,
        popularityScore,
        meta: {
          quotes,
        },
      };
    })
    .filter((post) => post.popularityScore > 0)
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 5);
}

async function fetchTweetsByRange(client, userId, intervals = []) {
  const tweetsById = new Map();
  const mediaByKey = {};

  for (const interval of intervals) {
    let nextToken;

    do {
      const params = {
        max_results: 100,
        expansions: "attachments.media_keys",
        "tweet.fields": "created_at,public_metrics,attachments,text",
        "media.fields": "media_key,url,preview_image_url,type",
      };

      const startTime = toIsoStart(interval?.since);
      const endTime = toIsoEnd(interval?.until);

      if (startTime) params.start_time = startTime;
      if (endTime) params.end_time = endTime;
      if (nextToken) params.pagination_token = nextToken;

      const response = await client.v2.get(`users/${userId}/tweets`, params);
      const tweets = Array.isArray(response?.data) ? response.data : [];
      const media = Array.isArray(response?.includes?.media) ? response.includes.media : [];

      tweets.forEach((tweet) => {
        if (tweet?.id) {
          tweetsById.set(tweet.id, tweet);
        }
      });

      Object.assign(mediaByKey, mapMediaByKey(media));

      nextToken = response?.meta?.next_token;
    } while (nextToken);
  }

  return {
    tweets: [...tweetsById.values()].sort(
      (a, b) => new Date(a?.created_at) - new Date(b?.created_at)
    ),
    mediaByKey,
  };
}

export const getXAccounts = async (req, res) => {
  try {
    const client = createTwitterClient();

    const user = await client.v2.me({
      "user.fields": ["id", "name", "username", "profile_image_url"],
    });

    const accounts = [
      {
        id: user.data.id,
        name: user.data.name,
        url: `https://x.com/${user.data.username}`,
        image_url: user.data.profile_image_url,
      },
    ];

    const normalizedData = normalizeGetAPIsData("twitter", { pages: accounts });
    return res.status(200).json(normalizedData);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "No se pudieron obtener las cuentas de X",
      error: err.data || err.message || err,
    });
  }
};

export const getXOverview = async (req, res) => {
  try {
    const { accountId } = req.params;
    const client = createTwitterClient();

    const response = await client.v2.user(accountId, {
      "user.fields": [
        "id",
        "name",
        "username",
        "description",
        "profile_image_url",
        "verified",
        "public_metrics",
      ],
    });

    return successResponse(
      res,
      response?.data,
      "Overview de la cuenta de X recuperado exitosamente.",
      200
    );
  } catch (error) {
    console.error("Error obteniendo overview de X:", error?.data || error.message);
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      "Error del servidor.",
      500
    );
  }
};

export const getXTweets = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { range = "lastMonth" } = req.query;
    const client = createTwitterClient();

    const userResponse = await client.v2.user(accountId, {
      "user.fields": ["id", "username", "public_metrics"],
    });

    const username = userResponse?.data?.username;
    const intervals = resolveDateRange(range);

    const { tweets, mediaByKey } = await fetchTweetsByRange(client, accountId, intervals);

    const postsMetric = buildMetricFromTweets(tweets, () => 1);
    const likesMetric = buildMetricFromTweets(tweets, (tweet) => getPublicMetrics(tweet)?.like_count);
    const repostsMetric = buildMetricFromTweets(tweets, (tweet) => getPublicMetrics(tweet)?.retweet_count);
    const repliesMetric = buildMetricFromTweets(tweets, (tweet) => getPublicMetrics(tweet)?.reply_count);
    const quotesMetric = buildMetricFromTweets(tweets, (tweet) => getPublicMetrics(tweet)?.quote_count);
    const interactionsMetric = buildMetricFromTweets(
      tweets,
      (tweet) =>
        safeNumber(getPublicMetrics(tweet)?.like_count) +
        safeNumber(getPublicMetrics(tweet)?.retweet_count) +
        safeNumber(getPublicMetrics(tweet)?.reply_count) +
        safeNumber(getPublicMetrics(tweet)?.quote_count)
    );

    const payload = {
      metrics: {
        posts: postsMetric,
        likes: likesMetric,
        reposts: repostsMetric,
        replies: repliesMetric,
        quotes: quotesMetric,
        interactions: interactionsMetric,
      },
      totals: {
        posts: postsMetric.total,
        likes: likesMetric.total,
        reposts: repostsMetric.total,
        replies: repliesMetric.total,
        quotes: quotesMetric.total,
        interactions: interactionsMetric.total,
      },
      topPosts: mapTweetsToTopPosts(tweets, username, mediaByKey),
    };

    return successResponse(
      res,
      payload,
      "Tweets de la cuenta de X recuperados exitosamente.",
      200
    );
  } catch (error) {
    console.error("Error obteniendo tweets de X:", error?.data || error.message);
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      "Error del servidor.",
      500
    );
  }
};
