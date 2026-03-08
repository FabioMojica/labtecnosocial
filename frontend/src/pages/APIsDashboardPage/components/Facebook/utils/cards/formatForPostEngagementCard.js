function toNumericValue(rawValue) {
    if (typeof rawValue === "number") return rawValue;
    if (typeof rawValue === "string") return Number(rawValue) || 0;

    if (rawValue && typeof rawValue === "object") {
        return Object.values(rawValue).reduce(
            (acc, current) => acc + (Number(current) || 0),
            0
        );
    }

    return 0;
}

export function formatForPostEngagementCard(rawData = [], period = "lastMonth") {
    if (!Array.isArray(rawData) || rawData.length === 0) {
        return {
            chartData: [],
            dates: [],
            total: 0,
            delta: 0,
            latestValue: 0,
        };
    }

    const groupedByDate = rawData.reduce((acc, item) => {
        const dayKey =
            typeof item?.end_time === "string" && item.end_time.includes("T")
                ? item.end_time.split("T")[0]
                : new Date(item?.end_time).toISOString().split("T")[0];

        if (!acc[dayKey]) acc[dayKey] = 0;
        acc[dayKey] += toNumericValue(item?.value);
        return acc;
    }, {});

    const orderedDayKeys = Object.keys(groupedByDate).sort(
        (a, b) => new Date(a) - new Date(b)
    );

    const chartData = orderedDayKeys.map((dayKey) => groupedByDate[dayKey]);
    const dates = orderedDayKeys.map((dayKey) => {
        const [year, month, day] = dayKey.split("-");
        return `${day}/${month}/${year}`;
    });

    const total = chartData.reduce((acc, value) => acc + value, 0);
    const latestValue = chartData[chartData.length - 1] ?? 0;
    const previousValue = chartData[chartData.length - 2] ?? 0;
    const delta = chartData.length > 1 ? latestValue - previousValue : latestValue;

    return {
        chartData,
        dates,
        total,
        delta,
        latestValue,
    };
}
