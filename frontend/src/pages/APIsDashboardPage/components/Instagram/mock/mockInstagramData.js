const PERIOD_TO_DAYS = {
  today: 1,
  lastWeek: 7,
  lastMonth: 30,
  lastSixMonths: 180,
  all: 365,
};

const MEDIA_TYPES = ["IMAGE", "VIDEO", "REELS", "CAROUSEL_ALBUM"];

const CAPTIONS = [
  "Resumen de actividades del equipo en este periodo.",
  "Compartimos contenido relevante para nuestra comunidad.",
  "Resultados destacados y proximas metas del proyecto.",
  "Publicacion especial para mostrar avances recientes.",
  "Historias y logros del trabajo colaborativo.",
  "Nueva actualizacion con indicadores importantes.",
  "Contenido visual del impacto generado.",
  "Publicacion con informacion clave para seguimiento.",
  "Novedades del equipo y siguientes pasos.",
  "Cierre semanal con puntos destacados.",
];

function toNumber(value) {
  return Number(value) || 0;
}

function toIsoDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}

function slugify(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildDateSeries(range = "lastMonth") {
  const totalDays = PERIOD_TO_DAYS[range] ?? PERIOD_TO_DAYS.lastMonth;
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const dates = [];
  for (let index = totalDays; index >= 0; index -= 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - index);
    dates.push(date);
  }

  return dates;
}

function getRangePostCount(range = "lastMonth") {
  switch (range) {
    case "today":
      return 4;
    case "lastWeek":
      return 10;
    case "lastSixMonths":
      return 70;
    case "all":
      return 110;
    case "lastMonth":
    default:
      return 24;
  }
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

function buildMetric({ integrationId, name, title, description, values }) {
  return {
    name,
    period: "day",
    title,
    description,
    id: `${integrationId}/insights/${name}/day`,
    values,
  };
}

function buildMockInstagramMedia(integrationId = "mock_instagram_page", range = "lastMonth") {
  const dates = buildDateSeries(range);
  const totalPosts = getRangePostCount(range);
  const media = [];

  for (let index = 0; index < totalPosts; index += 1) {
    const relativeIndex =
      totalPosts <= 1 ? 0 : Math.round((index * (dates.length - 1)) / (totalPosts - 1));
    const baseDate = new Date(dates[relativeIndex] ?? dates[dates.length - 1]);
    baseDate.setHours((index * 3) % 24, (index * 11) % 60, 0, 0);

    const mediaType = MEDIA_TYPES[index % MEDIA_TYPES.length];
    const likes = 18 + (index % 11) * 9 + Math.floor(index / 5);
    const comments = 3 + (index % 7) * 2;
    const shares = (index % 4 === 0 ? 2 : 0) + (index % 9 === 0 ? 1 : 0);
    const saves = 1 + (index % 6);
    const imageSeed = `instagram-mock-${index + 1}`;
    const permalink = `https://www.instagram.com/p/${slugify(integrationId)}_${1000 + index}/`;

    const baseMedia = {
      id: `${integrationId}_media_${index + 1}`,
      caption: CAPTIONS[index % CAPTIONS.length],
      media_type: mediaType,
      media_url: `https://picsum.photos/seed/${imageSeed}/1080/1080`,
      thumbnail_url:
        mediaType === "VIDEO" || mediaType === "REELS"
          ? `https://picsum.photos/seed/${imageSeed}-thumb/1080/1080`
          : null,
      permalink,
      timestamp: baseDate.toISOString(),
      like_count: likes,
      comments_count: comments,
      share_count: shares,
      saved_count: saves,
    };

    if (mediaType === "CAROUSEL_ALBUM") {
      baseMedia.children = {
        data: [
          {
            media_type: "IMAGE",
            media_url: `https://picsum.photos/seed/${imageSeed}-c1/1080/1080`,
            thumbnail_url: null,
          },
          {
            media_type: "IMAGE",
            media_url: `https://picsum.photos/seed/${imageSeed}-c2/1080/1080`,
            thumbnail_url: null,
          },
        ],
      };
    }

    media.push(baseMedia);
  }

  return media;
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
      const likeCount = toNumber(item?.like_count);
      const commentsCount = toNumber(item?.comments_count);
      const sharesCount = toNumber(item?.share_count);
      const savesCount = toNumber(item?.saved_count);
      const popularityScore = likeCount + commentsCount * 2 + sharesCount * 3 + savesCount * 2;
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
          total_interactions: likeCount + commentsCount + sharesCount + savesCount,
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

    const likes = toNumber(item?.like_count);
    const comments = toNumber(item?.comments_count);
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

  const byDate = Object.values(byDateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
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

export function generateMockInstagramOverview(integration = {}) {
  const integrationId = integration?.integration_id || "mock_instagram_page";
  const baseName = integration?.name || "instagram_mock_account";
  const username = slugify(baseName).replace(/_+/g, ".") || "instagram.mock";

  return {
    id: integrationId,
    username,
    name: integration?.name || "Instagram Mock Account",
    profile_picture_url: `https://i.pravatar.cc/256?u=instagram-${integrationId}`,
    followers_count: 5420,
    follows_count: 318,
    media_count: 486,
  };
}

export function generateMockInstagramInsights(
  integrationId = "mock_instagram_page",
  range = "lastMonth"
) {
  const dates = buildDateSeries(range);

  const followerValues = [];
  const reachValues = [];
  const viewsValues = [];
  const profileViewsValues = [];
  const profileLinksTapsValues = [];
  const websiteClicksValues = [];
  const accountsEngagedValues = [];
  const totalInteractionsValues = [];
  const likesValues = [];
  const commentsValues = [];
  const sharesValues = [];
  const savesValues = [];
  const repliesValues = [];
  const repostsValues = [];

  dates.forEach((date, index) => {
    const endTime = date.toISOString();
    const dailyFollowers = Math.max(0, 1 + (index % 5 === 0 ? 2 : 0) - (index % 17 === 0 ? 1 : 0));

    const reach = 180 + (index % 12) * 16 + Math.floor(index / 6) * 4;
    const views = reach + 120 + (index % 7) * 11;
    const profileViews = 28 + (index % 8) * 5 + Math.floor(index / 10) * 2;
    const profileLinksTaps = Math.max(0, Math.floor(profileViews * (0.28 + (index % 4) * 0.03)));
    const websiteClicks = Math.max(0, Math.floor(profileLinksTaps * (0.35 + (index % 3) * 0.04)));
    const accountsEngaged = 70 + (index % 10) * 7 + Math.floor(index / 7) * 3;
    const likes = 30 + (index % 9) * 4;
    const comments = 8 + (index % 7) * 2;
    const shares = 4 + (index % 5);
    const saves = 7 + (index % 6);
    const replies = 2 + (index % 3);
    const reposts = index % 4 === 0 ? 1 : 0;
    const totalInteractions = likes + comments + shares + saves + replies + reposts;

    followerValues.push({
      value: dailyFollowers,
      end_time: endTime,
    });
    reachValues.push({
      value: reach,
      end_time: endTime,
    });
    viewsValues.push({
      value: views,
      end_time: endTime,
    });
    profileViewsValues.push({
      value: profileViews,
      end_time: endTime,
    });
    profileLinksTapsValues.push({
      value: profileLinksTaps,
      end_time: endTime,
    });
    websiteClicksValues.push({
      value: websiteClicks,
      end_time: endTime,
    });
    accountsEngagedValues.push({
      value: accountsEngaged,
      end_time: endTime,
    });
    totalInteractionsValues.push({
      value: totalInteractions,
      end_time: endTime,
    });
    likesValues.push({
      value: likes,
      end_time: endTime,
    });
    commentsValues.push({
      value: comments,
      end_time: endTime,
    });
    sharesValues.push({
      value: shares,
      end_time: endTime,
    });
    savesValues.push({
      value: saves,
      end_time: endTime,
    });
    repliesValues.push({
      value: replies,
      end_time: endTime,
    });
    repostsValues.push({
      value: reposts,
      end_time: endTime,
    });
  });

  return [
    buildMetric({
      integrationId,
      name: "follower_count",
      title: "Follower count",
      description: "Daily follower count trend.",
      values: followerValues,
    }),
    buildMetric({
      integrationId,
      name: "reach",
      title: "Reach",
      description: "Daily account reach.",
      values: reachValues,
    }),
    buildMetric({
      integrationId,
      name: "views",
      title: "Views",
      description: "Daily content views.",
      values: viewsValues,
    }),
    buildMetric({
      integrationId,
      name: "profile_views",
      title: "Profile views",
      description: "Daily profile visits.",
      values: profileViewsValues,
    }),
    buildMetric({
      integrationId,
      name: "profile_links_taps",
      title: "Profile link taps",
      description: "Daily taps on profile links.",
      values: profileLinksTapsValues,
    }),
    buildMetric({
      integrationId,
      name: "website_clicks",
      title: "Website clicks",
      description: "Daily website clicks.",
      values: websiteClicksValues,
    }),
    buildMetric({
      integrationId,
      name: "accounts_engaged",
      title: "Accounts engaged",
      description: "Daily engaged accounts.",
      values: accountsEngagedValues,
    }),
    buildMetric({
      integrationId,
      name: "total_interactions",
      title: "Total interactions",
      description: "Daily total interactions.",
      values: totalInteractionsValues,
    }),
    buildMetric({
      integrationId,
      name: "likes",
      title: "Likes",
      description: "Daily likes.",
      values: likesValues,
    }),
    buildMetric({
      integrationId,
      name: "comments",
      title: "Comments",
      description: "Daily comments.",
      values: commentsValues,
    }),
    buildMetric({
      integrationId,
      name: "shares",
      title: "Shares",
      description: "Daily shares.",
      values: sharesValues,
    }),
    buildMetric({
      integrationId,
      name: "saves",
      title: "Saves",
      description: "Daily saves.",
      values: savesValues,
    }),
    buildMetric({
      integrationId,
      name: "replies",
      title: "Replies",
      description: "Daily replies.",
      values: repliesValues,
    }),
    buildMetric({
      integrationId,
      name: "reposts",
      title: "Reposts",
      description: "Daily reposts.",
      values: repostsValues,
    }),
  ];
}

export function generateMockInstagramMedia(
  integrationId = "mock_instagram_page",
  range = "lastMonth"
) {
  const media = buildMockInstagramMedia(integrationId, range);

  const totals = media.reduce(
    (acc, item) => {
      const likes = toNumber(item?.like_count);
      const comments = toNumber(item?.comments_count);
      acc.posts += 1;
      acc.likes += likes;
      acc.comments += comments;
      acc.interactions += likes + comments;
      return acc;
    },
    { posts: 0, likes: 0, comments: 0, interactions: 0 }
  );

  const analytics = buildInstagramMediaAnalytics(media);
  const byDate = analytics.byDate;
  const since = byDate.length > 0 ? byDate[0].date : null;
  const until = byDate.length > 0 ? byDate[byDate.length - 1].date : null;

  return {
    media,
    totals,
    analytics,
    topPosts: mapMediaToTopPosts(media),
    meta: {
      range,
      since,
      until,
    },
  };
}
