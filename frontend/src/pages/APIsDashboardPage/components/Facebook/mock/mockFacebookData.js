const PERIOD_TO_DAYS = {
  today: 2,
  lastWeek: 7,
  lastMonth: 30,
  lastSixMonths: 180,
  all: 365,
};

const POST_MESSAGES = [
  "Lanzamos una nueva actividad para la comunidad.",
  "Compartimos avances importantes del proyecto.",
  "Gracias por su participacion en la jornada de hoy.",
  "Presentamos resultados y siguientes pasos del equipo.",
  "Nuevo contenido disponible en nuestra pagina oficial.",
  "Publicamos un resumen con los hitos del periodo.",
  "Seguimos creciendo junto a toda nuestra audiencia.",
  "Conoce las novedades y acciones destacadas de la semana.",
  "Estamos mejorando procesos para brindar mas valor.",
  "Celebramos los logros obtenidos con nuestros aliados.",
];

function toNumber(value) {
  return Number(value) || 0;
}

function toIsoDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
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

function buildMetric({ pageId, name, title, description, values }) {
  return {
    name,
    period: "day",
    title,
    description,
    id: `${pageId}/insights/${name}/day`,
    values,
  };
}

function buildCountryFollowers(totalFollowers = 0) {
  const total = toNumber(totalFollowers);
  return {
    BO: Math.round(total * 0.42),
    PE: Math.round(total * 0.14),
    AR: Math.round(total * 0.11),
    CO: Math.round(total * 0.09),
    CL: Math.round(total * 0.08),
    US: Math.round(total * 0.07),
    MX: Math.round(total * 0.06),
    ES: Math.round(total * 0.03),
  };
}

function buildCityFollowers(totalFollowers = 0) {
  const total = toNumber(totalFollowers);
  return {
    "La Paz": Math.round(total * 0.16),
    "Santa Cruz": Math.round(total * 0.14),
    Cochabamba: Math.round(total * 0.11),
    ElAlto: Math.round(total * 0.09),
    Sucre: Math.round(total * 0.06),
    Tarija: Math.round(total * 0.04),
  };
}

export function generateMockFacebookOverview(integration = {}) {
  const integrationId = String(integration?.integration_id || "mock_facebook_page");
  const hash = [...integrationId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fanCount = 1200 + (hash % 3800);
  const followersCount = fanCount + 120 + (hash % 450);

  return {
    id: integrationId,
    name: integration?.name || "Pagina de Facebook",
    category: "Organizacion sin fines de lucro",
    fan_count: fanCount,
    followers_count: followersCount,
    link: integration?.url || `https://www.facebook.com/${integrationId}`,
    picture: {
      data: {
        url: `https://graph.facebook.com/${integrationId}/picture?type=square`,
      },
    },
  };
}

export function generateMockFacebookInsights(pageId = "mock_facebook_page", range = "lastMonth") {
  const dates = buildDateSeries(range);

  let cumulativeFollowers = 1600;
  const pageFollowsValues = [];
  const pageViewsValues = [];
  const pageMediaViewValues = [];
  const pageReactionsValues = [];
  const pageTotalActionsValues = [];
  const pagePostEngagementValues = [];
  const pageFollowsCountryValues = [];
  const pageFollowsCityValues = [];

  dates.forEach((date, index) => {
    const endTime = date.toISOString();
    const followerGrowth = 2 + (index % 4 === 0 ? 1 : 0) - (index % 11 === 0 ? 1 : 0);
    cumulativeFollowers = Math.max(0, cumulativeFollowers + followerGrowth);

    const pageViews = 90 + (index % 10) * 7 + Math.floor(index / 6) * 3;
    const organicViews = 150 + (index % 9) * 8 + Math.floor(index / 8) * 4;
    const paidViews = 35 + (index % 7) * 4 + Math.floor(index / 10) * 2;

    const like = 12 + (index % 8) * 2;
    const love = 4 + (index % 5);
    const wow = 2 + (index % 4);
    const haha = 1 + (index % 3);
    const sorry = index % 4 === 0 ? 1 : 0;
    const anger = index % 9 === 0 ? 1 : 0;

    const totalActions = 22 + (index % 9) * 3 + Math.floor(index / 7);
    const postEngagements = 32 + (index % 10) * 4 + Math.floor(index / 5);

    pageFollowsValues.push({
      value: cumulativeFollowers,
      end_time: endTime,
    });

    pageViewsValues.push({
      value: pageViews,
      end_time: endTime,
    });

    pageMediaViewValues.push(
      {
        value: organicViews,
        end_time: endTime,
        is_from_ads: "0",
      },
      {
        value: paidViews,
        end_time: endTime,
        is_from_ads: "1",
      }
    );

    pageReactionsValues.push({
      value: {
        like,
        love,
        wow,
        haha,
        sorry,
        anger,
      },
      end_time: endTime,
    });

    pageTotalActionsValues.push({
      value: totalActions,
      end_time: endTime,
    });

    pagePostEngagementValues.push({
      value: postEngagements,
      end_time: endTime,
    });

    pageFollowsCountryValues.push({
      value: buildCountryFollowers(cumulativeFollowers),
      end_time: endTime,
    });

    pageFollowsCityValues.push({
      value: buildCityFollowers(cumulativeFollowers),
      end_time: endTime,
    });
  });

  return [
    buildMetric({
      pageId,
      name: "page_follows",
      title: "Page follows",
      description: "Daily followers trend.",
      values: pageFollowsValues,
    }),
    buildMetric({
      pageId,
      name: "page_views_total",
      title: "Page views total",
      description: "Daily total page views.",
      values: pageViewsValues,
    }),
    buildMetric({
      pageId,
      name: "page_follows_country",
      title: "Page follows by country",
      description: "Followers segmented by country.",
      values: pageFollowsCountryValues,
    }),
    buildMetric({
      pageId,
      name: "page_follows_city",
      title: "Page follows by city",
      description: "Followers segmented by city.",
      values: pageFollowsCityValues,
    }),
    buildMetric({
      pageId,
      name: "page_actions_post_reactions_total",
      title: "Post reactions total",
      description: "Daily reactions to posts.",
      values: pageReactionsValues,
    }),
    buildMetric({
      pageId,
      name: "page_total_actions",
      title: "Page total actions",
      description: "Daily total actions.",
      values: pageTotalActionsValues,
    }),
    buildMetric({
      pageId,
      name: "page_post_engagements",
      title: "Page post engagements",
      description: "Daily post engagements.",
      values: pagePostEngagementValues,
    }),
    buildMetric({
      pageId,
      name: "page_media_view",
      title: "Page media view",
      description: "Daily media views split by ads.",
      values: pageMediaViewValues,
    }),
  ];
}

export function generateMockFacebookPosts(pageId = "mock_facebook_page", range = "lastMonth") {
  const dates = buildDateSeries(range);
  const posts = [];
  const postCount = 10;

  for (let index = 0; index < postCount; index += 1) {
    const dateIndex = Math.max(
      0,
      dates.length - 1 - index * Math.max(1, Math.floor(dates.length / postCount))
    );
    const postDate = new Date(dates[dateIndex] ?? dates[dates.length - 1]);
    postDate.setHours((index * 3) % 24, (index * 11) % 60, 0, 0);

    const reactionsByType = {
      LIKE: 24 + (index % 7) * 5,
      LOVE: 6 + (index % 5) * 2,
      WOW: 2 + (index % 4),
      HAHA: 1 + (index % 3),
      SAD: index % 4 === 0 ? 1 : 0,
      ANGRY: index % 8 === 0 ? 1 : 0,
    };

    const reactionsTotal = Object.values(reactionsByType).reduce(
      (acc, value) => acc + toNumber(value),
      0
    );
    const comments = 4 + (index % 6) * 2;
    const shares = 2 + (index % 5);
    const popularityScore = reactionsTotal + comments * 2 + shares * 3;

    posts.push({
      id: `${pageId}_mock_post_${index + 1}`,
      message: POST_MESSAGES[index % POST_MESSAGES.length],
      created_time: postDate.toISOString(),
      updated_time: postDate.toISOString(),
      permalink_url: `https://www.facebook.com/${pageId}/posts/mock-${1000 + index}`,
      full_picture: `https://picsum.photos/seed/facebook-mock-${index + 1}/1200/630`,
      reactions: {
        byType: reactionsByType,
        total: reactionsTotal,
      },
      comments,
      shares,
      popularityScore,
      meta: {
        is_published: true,
        is_popular: popularityScore >= 100,
        is_eligible_for_promotion: index % 2 === 0,
      },
    });
  }

  return posts
    .filter((post) => post.popularityScore > 0)
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 5);
}

export function getMockFacebookRangeBounds(range = "lastMonth") {
  const dates = buildDateSeries(range);
  const since = toIsoDate(dates[0]);
  const until = toIsoDate(dates[dates.length - 1]);

  return {
    since,
    until,
  };
}
