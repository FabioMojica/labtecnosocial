export const formatForFollowersCard = (rawData = [], period = "lastMonth") => {
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
    
    const firstValue = sorted[0]?.value ?? 0;
    const lastValue = sorted[sorted.length - 1]?.value ?? 0;

    return {
        chartData: sorted.map(item => item.value),
        dates: sorted.map(item => item.end_time.split('T')[0]),
        total: period === "all" ? lastValue : lastValue - firstValue,
        delta: sorted.at(-1).value - sorted[0].value,
    };
};
