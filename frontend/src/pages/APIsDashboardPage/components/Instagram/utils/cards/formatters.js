const EMPTY_METRIC = {
    chartData: [],
    dates: [],
    total: 0,
    delta: 0,
};

const PERIOD_TO_DAYS = {
    today: 1,
    lastWeek: 7,
    lastMonth: 30,
    lastSixMonths: 180,
};

function toNumber(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value) || 0;

    if (value && typeof value === "object") {
        return Object.values(value).reduce((acc, current) => acc + (Number(current) || 0), 0);
    }

    return 0;
}

function toLocalIsoDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function extractIsoDateFromDateTime(value) {
    if (!value) return null;

    if (typeof value === "string") {
        const normalized = value.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return null;

    return toLocalIsoDate(parsedDate);
}

function extractApiDayKey(value) {
    if (!value) return null;

    if (typeof value === "string") {
        const normalized = value.trim();
        const match = normalized.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match?.[1]) return match[1];
    }

    return extractIsoDateFromDateTime(value);
}

function getMetricValues(insights = [], metricName = "") {
    if (!Array.isArray(insights)) return [];

    const metric = insights.find((item) => item?.name === metricName);
    if (Array.isArray(metric?.values) && metric.values.length > 0) {
        return metric.values;
    }

    // Some IG insights only come as total_value for the selected period.
    if (metric?.total_value && typeof metric.total_value === "object") {
        const totalValue =
            metric.total_value?.value ??
            metric.total_value?.total ??
            metric.total_value;
        const endTime =
            metric.total_value?.end_time ??
            metric?.end_time ??
            new Date().toISOString();

        return [{
            value: totalValue,
            end_time: endTime,
        }];
    }

    return [];
}

function getPeriodBounds(selectedPeriod = "lastMonth") {
    const totalDays = PERIOD_TO_DAYS[selectedPeriod] ?? PERIOD_TO_DAYS.lastMonth;
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(end.getDate() - (totalDays - 1));
    return {
        startDayKey: toLocalIsoDate(start),
        endDayKey: toLocalIsoDate(end),
    };
}

function isDateInsidePeriod(dayKey = "", selectedPeriod = "lastMonth") {
    if (!dayKey) return false;
    const { startDayKey, endDayKey } = getPeriodBounds(selectedPeriod);
    if (!startDayKey || !endDayKey) return true;
    return dayKey >= startDayKey && dayKey <= endDayKey;
}

function groupByDate(rawValues = [], selectedPeriod = "lastMonth") {
    return rawValues.reduce((acc, item) => {
        const dayKey = extractApiDayKey(item?.end_time);
        if (!dayKey) return acc;
        if (!isDateInsidePeriod(dayKey, selectedPeriod)) return acc;

        if (!acc[dayKey]) acc[dayKey] = 0;
        acc[dayKey] += toNumber(item?.value);
        return acc;
    }, {});
}

function buildDayKeysForPeriod(selectedPeriod = "lastMonth") {
    const { startDayKey, endDayKey } = getPeriodBounds(selectedPeriod);
    if (!startDayKey || !endDayKey) return [];

    const startDate = new Date(`${startDayKey}T00:00:00`);
    const endDate = new Date(`${endDayKey}T00:00:00`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return [];

    const dayKeys = [];
    for (let cursor = new Date(startDate); cursor <= endDate; cursor.setDate(cursor.getDate() + 1)) {
        const dayKey = toLocalIsoDate(cursor);
        if (dayKey) dayKeys.push(dayKey);
    }
    return dayKeys;
}

function mapOrderedDateData(groupedByDate = {}, selectedPeriod = null) {
    const orderedDayKeys = selectedPeriod
        ? buildDayKeysForPeriod(selectedPeriod)
        : Object.keys(groupedByDate).sort(
            (a, b) => new Date(a) - new Date(b)
        );

    const chartData = orderedDayKeys.map((dayKey) => groupedByDate[dayKey] ?? 0);
    const dates = orderedDayKeys.map((dayKey) => {
        const [year, month, day] = dayKey.split("-");
        return `${day}/${month}/${year}`;
    });

    return { chartData, dates };
}

function formatIsoDateToDisplay(dayKey = "") {
    const [year, month, day] = String(dayKey).split("-");
    if (!year || !month || !day) return dayKey;
    return `${day}/${month}/${year}`;
}

function buildDatesForPeriod(selectedPeriod = "lastMonth") {
    const totalDays = PERIOD_TO_DAYS[selectedPeriod] ?? PERIOD_TO_DAYS.lastMonth;
    const end = new Date();
    end.setHours(0, 0, 0, 0);

    const dates = [];
    for (let index = totalDays - 1; index >= 0; index -= 1) {
        const date = new Date(end);
        date.setDate(end.getDate() - index);
        dates.push(
            `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
        );
    }

    return dates;
}

function buildMediaByDate(mediaPayload = {}, selectedPeriod = "lastMonth") {
    const analyticsByDate = Array.isArray(mediaPayload?.analytics?.byDate)
        ? mediaPayload.analytics.byDate
        : [];

    if (analyticsByDate.length > 0) {
        return analyticsByDate
            .map((item) => ({
                date: extractIsoDateFromDateTime(item?.date),
                posts: Number(item?.posts ?? 0),
                likes: Number(item?.likes ?? 0),
                comments: Number(item?.comments ?? 0),
                interactions: Number(item?.interactions ?? 0),
            }))
            .filter((item) => isDateInsidePeriod(item?.date, selectedPeriod))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    const media = Array.isArray(mediaPayload?.media) ? mediaPayload.media : [];
    const grouped = media.reduce((acc, item) => {
        const dayKey = extractIsoDateFromDateTime(item?.timestamp);
        if (!dayKey) return acc;
        if (!isDateInsidePeriod(dayKey, selectedPeriod)) return acc;

        const likes = toNumber(item?.like_count);
        const comments = toNumber(item?.comments_count);

        if (!acc[dayKey]) {
            acc[dayKey] = {
                date: dayKey,
                posts: 0,
                likes: 0,
                comments: 0,
                interactions: 0,
            };
        }

        acc[dayKey].posts += 1;
        acc[dayKey].likes += likes;
        acc[dayKey].comments += comments;
        acc[dayKey].interactions += likes + comments;
        return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function formatInstagramFollowersCard(insights = [], selectedPeriod = "lastMonth") {
    const followerCountValues = getMetricValues(insights, "follower_count");
    const followsAndUnfollowsValues = getMetricValues(insights, "follows_and_unfollows");
    const hasUsefulFollowFallback = followsAndUnfollowsValues.some(
        (item) => toNumber(item?.value) !== 0
    );
    const rawValues = followerCountValues.length > 0
        ? followerCountValues
        : hasUsefulFollowFallback
            ? followsAndUnfollowsValues
            : [];

    if (!Array.isArray(rawValues) || rawValues.length === 0) {
        const dates = buildDatesForPeriod(selectedPeriod);
        return {
            chartData: dates.map(() => 0),
            dates,
            total: 0,
            delta: 0,
        };
    }

    const groupedByDate = groupByDate(rawValues, selectedPeriod);
    const { chartData: dailyValues, dates } = mapOrderedDateData(groupedByDate, selectedPeriod);

    if (dailyValues.length === 0) return EMPTY_METRIC;

    const totalChange = dailyValues.reduce((acc, value) => acc + value, 0);
    const lastValue = dailyValues[dailyValues.length - 1] ?? 0;
    const previousValue = dailyValues[dailyValues.length - 2] ?? 0;

    return {
        chartData: dailyValues,
        dates,
        total: totalChange,
        delta: dailyValues.length > 1 ? lastValue - previousValue : lastValue,
    };
}

export function formatInstagramMetricCard(insights = [], metricName = "", selectedPeriod = "lastMonth") {
    const rawValues = getMetricValues(insights, metricName);
    if (!Array.isArray(rawValues) || rawValues.length === 0) return EMPTY_METRIC;

    const groupedByDate = groupByDate(rawValues, selectedPeriod);
    const { chartData, dates } = mapOrderedDateData(groupedByDate, selectedPeriod);

    if (chartData.length === 0) return EMPTY_METRIC;

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

export function formatInstagramEngagementRateCard(insights = [], selectedPeriod = "lastMonth") {
    const reachMetric = formatInstagramMetricCard(insights, "reach", selectedPeriod);
    const interactionsMetric = formatInstagramMetricCard(insights, "total_interactions", selectedPeriod);

    const interactionsTotal = Number(interactionsMetric?.total ?? 0);
    const reachTotal = Number(reachMetric?.total ?? 0);
    const rate = reachTotal > 0 ? Number(((interactionsTotal / reachTotal) * 100).toFixed(2)) : 0;

    return {
        total: rate,
        interactionsTotal,
        reachTotal,
        hasData:
            (Array.isArray(reachMetric?.chartData) && reachMetric.chartData.length > 0) ||
            (Array.isArray(interactionsMetric?.chartData) && interactionsMetric.chartData.length > 0),
    };
}

export function formatInstagramInteractionBreakdownCard(insights = [], selectedPeriod = "lastMonth") {
    const metrics = [
        { key: "likes", label: "Likes" },
        { key: "comments", label: "Comentarios" },
        { key: "shares", label: "Compartidos" },
        { key: "saves", label: "Guardados" },
        { key: "replies", label: "Respuestas" },
        { key: "reposts", label: "Reposts" },
    ];

    const chartData = metrics.map((metric) => {
        const metricData = formatInstagramMetricCard(insights, metric.key, selectedPeriod);
        const rawValue = Number(metricData?.total ?? 0);
        const normalizedValue = Math.max(0, rawValue);

        return {
            key: metric.key,
            name: metric.label,
            value: normalizedValue,
            rawValue,
        };
    });
    const total = chartData.reduce((acc, item) => acc + Number(item?.value ?? 0), 0);

    return {
        chartData,
        dates: [],
        total,
        delta: 0,
    };
}

export function formatInstagramProfileConversionFunnelCard(insights = [], selectedPeriod = "lastMonth") {
    const profileViewsMetric = formatInstagramMetricCard(insights, "profile_views", selectedPeriod);
    const profileLinksTapsMetric = formatInstagramMetricCard(insights, "profile_links_taps", selectedPeriod);
    const websiteClicksMetric = formatInstagramMetricCard(insights, "website_clicks", selectedPeriod);

    const profileViews = Number(profileViewsMetric?.total ?? 0);
    const profileLinksTaps = Number(profileLinksTapsMetric?.total ?? 0);
    const websiteClicks = Number(websiteClicksMetric?.total ?? 0);

    const topStageValue = Math.max(profileViews, 1);
    const tapsVsViews = profileViews > 0 ? (profileLinksTaps / profileViews) * 100 : 0;
    const clicksVsTaps = profileLinksTaps > 0 ? (websiteClicks / profileLinksTaps) * 100 : 0;
    const clicksVsViews = profileViews > 0 ? (websiteClicks / profileViews) * 100 : 0;

    const validatedProfileViews = Math.max(profileViews, 0);
    const validatedTaps = Math.min(Math.max(profileLinksTaps, 0), validatedProfileViews);
    const validatedClicks = Math.min(Math.max(websiteClicks, 0), validatedTaps);

    const noTap = Math.max(validatedProfileViews - validatedTaps, 0);
    const tapNoClick = Math.max(validatedTaps - validatedClicks, 0);

    return {
        chartData: [
            {
                key: "profile_views",
                name: "Visitas al perfil",
                value: profileViews,
                percentageOfTop: (profileViews / topStageValue) * 100,
            },
            {
                key: "profile_links_taps",
                name: "Toques en enlace del perfil",
                value: profileLinksTaps,
                percentageOfTop: (profileLinksTaps / topStageValue) * 100,
            },
            {
                key: "website_clicks",
                name: "Clics al sitio web",
                value: websiteClicks,
                percentageOfTop: (websiteClicks / topStageValue) * 100,
            },
        ],
        dates: [],
        total: websiteClicks,
        delta: 0,
        profileViewsTotal: validatedProfileViews,
        pieData: [
            {
                id: "no_tap",
                name: "Visitas sin toque",
                value: noTap,
            },
            {
                id: "tap_no_click",
                name: "Toques sin clic",
                value: tapNoClick,
            },
            {
                id: "website_clicks",
                name: "Clics al sitio web",
                value: validatedClicks,
            },
        ],
        conversionRates: {
            tapsVsViews: Number(tapsVsViews.toFixed(1)),
            clicksVsTaps: Number(clicksVsTaps.toFixed(1)),
            clicksVsViews: Number(clicksVsViews.toFixed(1)),
        },
    };
}

export function formatInstagramInteractionsCard(mediaPayload = {}, selectedPeriod = "lastMonth") {
    const byDate = buildMediaByDate(mediaPayload, selectedPeriod);

    if (byDate.length === 0) {
        return {
            ...EMPTY_METRIC,
            likesTotal: 0,
            commentsTotal: 0,
            topPosts: Array.isArray(mediaPayload?.topPosts) ? mediaPayload.topPosts : [],
        };
    }

    const chartData = byDate.map((item) => Number(item?.interactions ?? 0));
    const dates = byDate.map((item) => formatIsoDateToDisplay(item?.date));
    const likesTotal = byDate.reduce((acc, item) => acc + Number(item?.likes ?? 0), 0);
    const commentsTotal = byDate.reduce((acc, item) => acc + Number(item?.comments ?? 0), 0);
    const total = likesTotal + commentsTotal;

    const lastValue = chartData[chartData.length - 1] ?? 0;
    const previousValue = chartData[chartData.length - 2] ?? 0;

    return {
        chartData,
        dates,
        total,
        delta: chartData.length > 1 ? lastValue - previousValue : lastValue,
        likesTotal,
        commentsTotal,
        topPosts: Array.isArray(mediaPayload?.topPosts) ? mediaPayload.topPosts : [],
    };
}

export function formatInstagramPostsCard(mediaPayload = {}, selectedPeriod = "lastMonth") {
    const byDate = buildMediaByDate(mediaPayload, selectedPeriod);
    if (byDate.length === 0) return EMPTY_METRIC;

    const chartData = byDate.map((item) => Number(item?.posts ?? 0));
    const dates = byDate.map((item) => formatIsoDateToDisplay(item?.date));
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

export function formatInstagramAvgInteractionsPerPostCard(mediaPayload = {}, selectedPeriod = "lastMonth") {
    const byDate = buildMediaByDate(mediaPayload, selectedPeriod);
    if (byDate.length === 0) return EMPTY_METRIC;

    const chartData = byDate.map((item) => {
        const posts = Number(item?.posts ?? 0);
        const interactions = Number(item?.interactions ?? 0);
        return posts > 0 ? Number((interactions / posts).toFixed(2)) : 0;
    });

    const dates = byDate.map((item) => formatIsoDateToDisplay(item?.date));
    const totals = byDate.reduce(
        (acc, item) => {
            acc.totalPosts += Number(item?.posts ?? 0);
            acc.totalInteractions += Number(item?.interactions ?? 0);
            return acc;
        },
        { totalPosts: 0, totalInteractions: 0 }
    );
    const { totalPosts, totalInteractions } = totals;
    const avg = totalPosts > 0 ? Number((totalInteractions / totalPosts).toFixed(2)) : 0;
    const lastValue = chartData[chartData.length - 1] ?? 0;
    const previousValue = chartData[chartData.length - 2] ?? 0;

    return {
        chartData,
        dates,
        total: avg,
        delta: chartData.length > 1 ? Number((lastValue - previousValue).toFixed(2)) : lastValue,
    };
}

export function formatInstagramContentTypeCard(mediaPayload = {}) {
    const byType = Array.isArray(mediaPayload?.analytics?.byMediaType)
        ? mediaPayload.analytics.byMediaType
        : [];

    if (byType.length === 0) {
        return {
            chartData: [],
            dates: [],
            total: 0,
            delta: 0,
        };
    }

    const sorted = [...byType].sort((a, b) => Number(b?.interactions ?? 0) - Number(a?.interactions ?? 0));
    const totalInteractions = sorted.reduce((acc, item) => acc + Number(item?.interactions ?? 0), 0);

    return {
        chartData: sorted.map((item) => ({
            name: item?.type ?? "Otro",
            value: Number(item?.interactions ?? 0),
            posts: Number(item?.posts ?? 0),
            avgPerPost: Number(item?.avgInteractionsPerPost ?? 0),
        })),
        dates: [],
        total: totalInteractions,
        delta: 0,
    };
}
