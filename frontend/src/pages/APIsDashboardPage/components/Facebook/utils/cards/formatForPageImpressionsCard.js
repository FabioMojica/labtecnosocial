export const formatForPageImpressionsCard = (rawData = [], period = "lastMonth") => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
        return {
            chartData: [],
            dates: [],
            total: 0,
            delta: 0,
        };
    }

    const sorted = [...rawData].sort(
        (a, b) => new Date(a.end_time) - new Date(b.end_time)
    );

    const groupedByDate = sorted.reduce((acc, item) => {
        const dayKey =
            typeof item?.end_time === "string" && item.end_time.includes("T")
                ? item.end_time.split("T")[0]
                : new Date(item.end_time).toISOString().split("T")[0];

        if (!acc[dayKey]) acc[dayKey] = 0;
        acc[dayKey] += Number(item.value ?? 0);
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
    const delta =
        chartData.length > 1 ? chartData[chartData.length - 1] - chartData[0] : 0;

    return {
        chartData,
        dates,
        total,
        delta,
    };
};
