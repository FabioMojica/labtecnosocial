const PERIOD_TO_DAYS = {
  today: 2,
  lastWeek: 7,
  lastMonth: 30,
  lastSixMonths: 180,
  all: 365,
};

const TWEET_TEXTS = [
  "Compartimos avances clave del proyecto con la comunidad.",
  "Nueva publicacion con resultados destacados del equipo.",
  "Seguimos mejorando nuestros procesos de trabajo colaborativo.",
  "Resumen semanal de hitos, aprendizajes y proximos pasos.",
  "Contenido para fortalecer la estrategia digital del proyecto.",
  "Mostramos impacto y datos importantes del periodo actual.",
  "Novedades del trabajo con aliados y actores clave.",
  "Publicacion con recomendaciones y buenas practicas.",
  "Actualizacion sobre actividades y logros recientes.",
  "Cierre del dia con los principales indicadores.",
];

function toNumber(value) {
  return Number(value) || 0;
}

function toDateLabel(dayKey) {
  const [year, month, day] = String(dayKey).split("-");
  if (!year || !month || !day) return dayKey;
  return `${day}/${month}/${year}`;
}

function toIsoDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}

function buildDateSeries(range = "lastMonth") {
  const days = PERIOD_TO_DAYS[range] ?? PERIOD_TO_DAYS.lastMonth;
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const dayKeys = [];
  for (let index = days; index >= 0; index -= 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - index);
    dayKeys.push(toIsoDate(date));
  }
  return dayKeys.filter(Boolean);
}

function buildMetric(dayKeys = [], valueBuilder = () => 0) {
  const chartData = dayKeys.map((dayKey, index) => toNumber(valueBuilder(dayKey, index)));
  const dates = dayKeys.map(toDateLabel);
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

function buildTopPosts(integration = {}, dayKeys = []) {
  const integrationId = integration?.integration_id || "mock_x_account";
  const username = integration?.name || "Cuenta X";
  const slug = String(username)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const posts = [];
  const count = 8;
  for (let index = 0; index < count; index += 1) {
    const dayIndex =
      count <= 1
        ? 0
        : Math.max(0, dayKeys.length - 1 - Math.round((index * (dayKeys.length - 1)) / (count - 1)));
    const dayKey = dayKeys[dayIndex] ?? dayKeys[dayKeys.length - 1];
    const createdDate = new Date(`${dayKey}T00:00:00.000Z`);
    createdDate.setUTCHours((index * 3) % 24, (index * 11) % 60, 0, 0);

    const likes = 22 + (index % 9) * 8;
    const replies = 3 + (index % 5) * 2;
    const reposts = 4 + (index % 6) * 2;
    const quotes = 1 + (index % 4);
    const popularityScore = likes + replies * 2 + reposts * 2 + quotes * 2;

    posts.push({
      id: `${integrationId}_post_${index + 1}`,
      message: TWEET_TEXTS[index % TWEET_TEXTS.length],
      created_time: createdDate.toISOString(),
      updated_time: createdDate.toISOString(),
      permalink_url: `https://x.com/${slug || "x_account"}/status/${1900000000000000000 + index}`,
      full_picture: `https://picsum.photos/seed/x-mock-${index + 1}/1200/630`,
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
        impressions: 180 + (index % 8) * 24,
        bookmarks: 2 + (index % 5),
      },
    });
  }

  return posts
    .filter((item) => item.popularityScore > 0)
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 5);
}

export function generateMockXOverview(integration = {}) {
  const integrationId = integration?.integration_id || "mock_x_account";
  const name = integration?.name || "X Mock Account";
  const username = String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return {
    id: integrationId,
    name,
    username: username || "x_mock_account",
    description: "Cuenta mock para pruebas de dashboard de X.",
    profile_image_url: `https://i.pravatar.cc/256?u=x-${integrationId}`,
    verified: false,
    public_metrics: {
      followers_count: 3840,
      following_count: 412,
      tweet_count: 1296,
      listed_count: 22,
    },
  };
}

export function generateMockXTweets(integration = {}, range = "lastMonth") {
  const dayKeys = buildDateSeries(range);

  const posts = buildMetric(dayKeys, (_day, index) => (index % 5 === 0 ? 2 : 1));
  const likes = buildMetric(dayKeys, (_day, index) => 38 + (index % 9) * 5 + Math.floor(index / 6));
  const reposts = buildMetric(dayKeys, (_day, index) => 9 + (index % 7) * 2 + Math.floor(index / 10));
  const replies = buildMetric(dayKeys, (_day, index) => 6 + (index % 6) * 2 + Math.floor(index / 12));
  const quotes = buildMetric(dayKeys, (_day, index) => 3 + (index % 5) + Math.floor(index / 20));
  const impressions = buildMetric(
    dayKeys,
    (_day, index) => 420 + (index % 10) * 36 + Math.floor(index / 4) * 11
  );
  const bookmarks = buildMetric(dayKeys, (_day, index) => 5 + (index % 6) + Math.floor(index / 15));

  const interactions = {
    chartData: dayKeys.map((_day, index) => {
      const like = likes.chartData[index] ?? 0;
      const repost = reposts.chartData[index] ?? 0;
      const reply = replies.chartData[index] ?? 0;
      const quote = quotes.chartData[index] ?? 0;
      return like + repost + reply + quote;
    }),
    dates: [...likes.dates],
    total: 0,
    delta: 0,
  };
  interactions.total = interactions.chartData.reduce((acc, value) => acc + value, 0);
  const lastValue = interactions.chartData[interactions.chartData.length - 1] ?? 0;
  const previousValue = interactions.chartData[interactions.chartData.length - 2] ?? 0;
  interactions.delta = interactions.chartData.length > 1 ? lastValue - previousValue : lastValue;

  return {
    metrics: {
      posts,
      likes,
      reposts,
      replies,
      quotes,
      impressions,
      bookmarks,
      interactions,
    },
    totals: {
      posts: posts.total,
      likes: likes.total,
      reposts: reposts.total,
      replies: replies.total,
      quotes: quotes.total,
      impressions: impressions.total,
      bookmarks: bookmarks.total,
      interactions: interactions.total,
    },
    topPosts: buildTopPosts(integration, dayKeys),
  };
}
