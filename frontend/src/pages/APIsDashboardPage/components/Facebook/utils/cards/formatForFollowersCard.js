export const formatForFollowersCard = (rawData = [], period = "lastMonth") => {
    console.log("FOLLOWERS BACKEND DATA", rawData);

    if (!Array.isArray(rawData) || rawData.length === 0) {
        return {
            chartData: [],
            dates: [],
            total: 0,
            delta: 0,
        };
    }

    // 1️⃣ Ordenar por fecha ascendente
    const sorted = [...rawData].sort(
        (a, b) => new Date(a.end_time) - new Date(b.end_time)
    );

    // 2️⃣ Convertir fechas a hora boliviana
    const dates = sorted.map(item => {
        const date = new Date(item.end_time);

        return date.toLocaleDateString("es-BO", {
            timeZone: "America/La_Paz",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    });

    // 3️⃣ Calcular variaciones diarias
    const chartData = sorted.map((item, index) => {
        if (index === 0) return 0;

        return item.value - sorted[index - 1].value;
    });

    // 4️⃣ Cambio total del periodo
    const totalChange =
        sorted[sorted.length - 1].value - sorted[0].value;

    return {
        chartData,
        dates,
        total: totalChange,  // 🔥 seguidores ganados/perdidos en el periodo
        delta: totalChange,  // puedes usarlo igual para flechita ↑ ↓
    };
};
