export const formatForPageViewsCard = (rawData = [], period = "lastMonth") => {
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

    // Total de visualizaciones en el periodo
    const total = sorted.reduce((acc, curr) => acc + (curr.value ?? 0), 0);

    // Delta: diferencia entre el primer y último día, opcional
    // Si querés mostrar cambio diario
    const delta = sorted.length > 1 ? sorted[sorted.length - 1].value - sorted[0].value : 0;

    return {
        chartData: sorted.map(item => item.value),
        dates: sorted.map(item => item.end_time.split('T')[0]),
        total,
        delta,
    };
};
