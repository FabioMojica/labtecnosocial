export const formatForPageViewsCard = (rawData = [], period = "lastMonth") => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
        return { chartData: [], dates: [], total: 0, delta: 0 };
    }

    const sorted = [...rawData].sort(
        (a, b) => new Date(a.end_time) - new Date(b.end_time)
    );

    const dates = sorted.map(item =>
        new Date(item.end_time).toLocaleDateString("es-BO", {
            timeZone: "America/La_Paz",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    );

    const chartData = sorted.map(item => item.value ?? 0);
    const total = chartData.reduce((acc, v) => acc + v, 0); // en tu ejemplo: 84

    return {
        chartData,
        dates,
        total,
        delta: total, // o 0 si no quieres flecha
    };
};
