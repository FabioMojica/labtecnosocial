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

function getMetricValues(insights = [], metricName = "") {
    if (!Array.isArray(insights)) return [];

    const metric = insights.find((item) => item?.name === metricName);
    return Array.isArray(metric?.values) ? metric.values : [];
}

function groupByDate(rawValues = []) {
    return rawValues.reduce((acc, item) => {
        const dayKey =
            typeof item?.end_time === "string" && item.end_time.includes("T")
                ? item.end_time.split("T")[0]
                : new Date(item?.end_time).toISOString().split("T")[0];

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
        const dayKey =
            typeof item?.timestamp === "string" && item.timestamp.includes("T")
                ? item.timestamp.split("T")[0]
                : new Date(item?.timestamp).toISOString().split("T")[0];

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
