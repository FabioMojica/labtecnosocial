import dayjs from "dayjs";

export const formatForFollowersByCountryCard = (insights, selectedPeriod) => {
    if (!insights || !insights.length) return [];

    const today = dayjs().startOf("day");
    let startDate, endDate;

    switch (selectedPeriod) {
        case "today":
            startDate = today;
            endDate = today.endOf("day");
            break;
        case "lastWeek":
            startDate = today.subtract(7, "day");
            endDate = today.endOf("day");
            break;
        case "lastMonth":
            startDate = today.subtract(1, "month");
            endDate = today.endOf("day");
            break;
        case "lastSixMonths":
            startDate = today.subtract(6, "month");
            endDate = today.endOf("day");
            break;
        case "all":
        default:
            startDate = null;
            endDate = null;
    }

    let filtered = insights;
    if (startDate && endDate) {
        filtered = insights.filter(item => {
            const date = dayjs(item.end_time);
            return date.isSameOrAfter(startDate, "day") && date.isSameOrBefore(endDate, "day");
        });
    }

    const latest = filtered.length ? filtered[filtered.length - 1].value : {};
    // Retornar como array de un solo elemento
    return [latest];
};
