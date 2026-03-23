const EMPTY_METRIC = {
    chartData: [],
    dates: [],
    total: 0,
    delta: 0,
};

function toNumber(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value) || 0;

    if (value && typeof value === "object") {
        return Object.values(value).reduce((acc, current) => acc + (Number(current) || 0), 0);
    }

    return 0;
}

function extractIsoDateFromDateTime(value) {
    if (!value) return null;

    if (typeof value === "string" && value.includes("T")) {
        return value.split("T")[0];
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return null;

    return parsedDate.toISOString().split("T")[0];
}

function getMetricValues(insights = [], metricName = "") {
    if (!Array.isArray(insights)) return [];

    const metric = insights.find((item) => item?.name === metricName);
    return Array.isArray(metric?.values) ? metric.values : [];
}

function groupByDate(rawValues = []) {
    return rawValues.reduce((acc, item) => {
        const dayKey = extractIsoDateFromDateTime(item?.end_time);
        if (!dayKey) return acc;

        if (!acc[dayKey]) acc[dayKey] = 0;
        acc[dayKey] += toNumber(item?.value);
        return acc;
    }, {});
}

function mapOrderedDateData(groupedByDate = {}) {
    const orderedDayKeys = Object.keys(groupedByDate).sort(
        (a, b) => new Date(a) - new Date(b)
    );

    const chartData = orderedDayKeys.map((dayKey) => groupedByDate[dayKey]);
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

function buildMediaByDate(mediaPayload = {}) {
    const analyticsByDate = Array.isArray(mediaPayload?.analytics?.byDate)
        ? mediaPayload.analytics.byDate
        : [];

    if (analyticsByDate.length > 0) {
        return analyticsByDate.map((item) => ({
            date: item?.date,
            posts: Number(item?.posts ?? 0),
            likes: Number(item?.likes ?? 0),
            comments: Number(item?.comments ?? 0),
            interactions: Number(item?.interactions ?? 0),
        }));
    }

    const media = Array.isArray(mediaPayload?.media) ? mediaPayload.media : [];
    const grouped = media.reduce((acc, item) => {
        const dayKey = extractIsoDateFromDateTime(item?.timestamp);
        if (!dayKey) return acc;

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

export function formatInstagramFollowersCard(insights = []) {
    const rawValues = getMetricValues(insights, "follower_count");
    if (!Array.isArray(rawValues) || rawValues.length === 0) return EMPTY_METRIC;

    const groupedByDate = groupByDate(rawValues);
    const { chartData: cumulativeValues, dates } = mapOrderedDateData(groupedByDate);

    if (cumulativeValues.length === 0) return EMPTY_METRIC;

    const dailyChanges = cumulativeValues.map((value, index) => {
        if (index === 0) return 0;
        return value - cumulativeValues[index - 1];
    });

    const totalChange = cumulativeValues[cumulativeValues.length - 1] - cumulativeValues[0];

    return {
        chartData: dailyChanges,
        dates,
        total: totalChange,
        delta: totalChange,
    };
}

export function formatInstagramMetricCard(insights = [], metricName = "") {
    const rawValues = getMetricValues(insights, metricName);
    if (!Array.isArray(rawValues) || rawValues.length === 0) return EMPTY_METRIC;

    const groupedByDate = groupByDate(rawValues);
    const { chartData, dates } = mapOrderedDateData(groupedByDate);

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

export function formatInstagramInteractionsCard(mediaPayload = {}) {
    const media = Array.isArray(mediaPayload?.media) ? mediaPayload.media : [];

    if (media.length === 0) {
        return {
            ...EMPTY_METRIC,
            likesTotal: 0,
            commentsTotal: 0,
            topPosts: Array.isArray(mediaPayload?.topPosts) ? mediaPayload.topPosts : [],
        };
    }

    const groupedByDate = media.reduce((acc, item) => {
        const dayKey = extractIsoDateFromDateTime(item?.timestamp);
        if (!dayKey) return acc;

        const likes = toNumber(item?.like_count);
        const comments = toNumber(item?.comments_count);

        if (!acc[dayKey]) acc[dayKey] = 0;
        acc[dayKey] += likes + comments;
        return acc;
    }, {});

    const { chartData, dates } = mapOrderedDateData(groupedByDate);

    const likesTotal = toNumber(mediaPayload?.totals?.likes) || media.reduce((acc, item) => acc + toNumber(item?.like_count), 0);
    const commentsTotal = toNumber(mediaPayload?.totals?.comments) || media.reduce((acc, item) => acc + toNumber(item?.comments_count), 0);
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

export function formatInstagramPostsCard(mediaPayload = {}) {
    const byDate = buildMediaByDate(mediaPayload);
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

export function formatInstagramAvgInteractionsPerPostCard(mediaPayload = {}) {
    const byDate = buildMediaByDate(mediaPayload);
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
